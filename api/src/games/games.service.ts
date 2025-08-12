import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { firestore } from 'firebase-admin';

// Interface for what a participant sends
interface AnswerSubmission {
    answer: string;
    participantId: string;
    timeLeft: number; // NEW: The time left on the clock when submitted
}

@Injectable()
export class GamesService {
    private readonly db: firestore.Firestore;

    constructor(private firebaseService: FirebaseService) {
        this.db = this.firebaseService.getFirestore();
    }

    private generateGameCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async create(quizId: string, userId: string) {
        const quizRef = this.db.collection('quizzes').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            throw new NotFoundException(`Quiz with ID "${quizId}" not found.`);
        }

        const quizData = quizDoc.data();
        if (!quizData || quizData.creatorId !== userId) {
            throw new ForbiddenException('You are not authorized to start a game with this quiz.');
        }

        const gameCode = this.generateGameCode();
        console.log(gameCode)
        const gameRef = this.db.collection('games').doc(gameCode);

        const gameData = {
            quizId,
            hostId: userId,
            state: 'lobby',
            createdAt: firestore.FieldValue.serverTimestamp(),
            currentQuestionIndex: -1,
        };

        await gameRef.set(gameData);
        return { gameCode };
    }

    async startGame(gameCode: string, userId: string) {
        const gameRef = this.db.collection('games').doc(gameCode);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) {
            throw new NotFoundException(`Game with code "${gameCode}" not found.`);
        }

        const gameData = gameDoc.data();

        if (!gameData) {
            throw new NotFoundException(`Game data for code "${gameCode}" not found.`);
        }

        // Security Check: Ensure the user starting the game is the host.
        if (gameData.hostId !== userId) {
            throw new ForbiddenException('You are not authorized to start this game.');
        }

        // State Check: Ensure the game is actually in the lobby.
        if (gameData.state !== 'lobby') {
            throw new ForbiddenException('This game has already started or has ended.');
        }

        // Update the game state to begin the quiz
        await gameRef.update({
            state: 'in-progress',
            currentQuestionIndex: 0, // Start with the first question
        });

        return { message: `Game ${gameCode} has started.` };
    }

    async nextQuestion(gameCode: string, userId: string) {
        const gameRef = this.db.collection('games').doc(gameCode);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) throw new NotFoundException();
        const gameData = gameDoc.data();
        if (!gameData || gameData.hostId !== userId) throw new ForbiddenException();

        await gameRef.update({
            state: 'in-progress',
            currentQuestionIndex: firestore.FieldValue.increment(1)
        });
        return { message: "Advanced to next question." };
    }

    // --- NEW: Show the leaderboard for the current question ---
    async showLeaderboard(gameCode: string, userId: string) {
        const gameRef = this.db.collection('games').doc(gameCode);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) throw new NotFoundException();
        const gameData = gameDoc.data();
        if (!gameData || gameData.hostId !== userId) throw new ForbiddenException();

        const quizRef = this.db.collection('quizzes').doc(gameData.quizId);
        const quizDoc = await quizRef.get();
        const quizData = quizDoc.data();
        const totalQuestions = quizData && quizData.questions ? quizData.questions.length : 0;

        // Check if this is the last question
        const isFinalQuestion = (gameData && gameData.currentQuestionIndex != null) ? gameData.currentQuestionIndex >= totalQuestions - 1 : false;
        const nextState = isFinalQuestion ? 'final-results' : 'question-results';

        // In a real app, you would calculate and update a 'leaderboard' field here.
        // For now, we just change the state.
        await gameRef.update({ state: nextState });

        return { message: "Leaderboard displayed." };
    }

    // --- NEW: Handle participant answer submissions ---
    async submitAnswer(gameCode: string, submission: AnswerSubmission) {
        const gameRef = this.db.collection('games').doc(gameCode);
        const participantRef = gameRef.collection('participants').doc(submission.participantId);

        return this.db.runTransaction(async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists || gameDoc.data()?.state !== 'in-progress') {
                throw new BadRequestException("You can no longer submit for this question.");
            }

            const gameData = gameDoc.data();
            if (!gameData) {
                throw new NotFoundException("Game data not found");
            }
            const quizRef = this.db.collection('quizzes').doc(gameData.quizId);
            const quizDoc = await transaction.get(quizRef);

            const currentQuestionIndex = gameDoc.data()?.currentQuestionIndex ?? 0;
            const quizData = quizDoc.data();
            const question = quizData && quizData.questions ? quizData.questions[currentQuestionIndex] : null;

            let scoreToAdd = 0;
            // Check if the answer is correct
            if (question.answer.toLowerCase() === submission.answer.toLowerCase()) {
                const basePoints = 1000;
                const timeLeft = submission.timeLeft;
                const questionTimer = question.timer;

                // DEFENSIVE CHECK: Ensure we have valid numbers before calculating a score.
                if (typeof timeLeft === 'number' && timeLeft > 0 && typeof questionTimer === 'number' && questionTimer > 0) {
                    const timeBonus = (timeLeft / questionTimer);
                    scoreToAdd = Math.round(basePoints * timeBonus);
                } else {
                    // If time data is invalid but the answer is correct, award a flat score.
                    // This prevents NaN and handles edge cases gracefully.
                    scoreToAdd = 500;
                }
            }

            const answerData = {
                [`answers.${currentQuestionIndex}`]: {
                    answer: submission.answer,
                    isCorrect: scoreToAdd > 0,
                    score: scoreToAdd
                }
            };

            transaction.update(participantRef, {
                ...answerData,
                score: firestore.FieldValue.increment(scoreToAdd)
            });

            return { scoreAwarded: scoreToAdd };
        });
    }
}
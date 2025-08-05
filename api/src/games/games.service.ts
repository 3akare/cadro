import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { firestore } from 'firebase-admin';

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
}
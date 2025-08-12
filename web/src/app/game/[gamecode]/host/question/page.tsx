'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameSession } from '../../../../../hooks/useGameSession';
import { nextQuestion, showLeaderboard } from '../../../../../services/api';
import LeaderboardDisplay from '../../../../components/leaderboard-display';

export default function HostQuestionPage() {
    const router = useRouter();
    const params = useParams();
    const gameCode = params.gamecode as string; // Respecting your convention
    const { game, quiz, loading, error } = useGameSession(gameCode);
    
    const [timer, setTimer] = useState(0);

    const currentQuestion = game && quiz ? quiz.questions[game.currentQuestionIndex] : null;

    // --- THE FIX: Consolidated Timer Management ---
    useEffect(() => {
        // This single effect now controls the entire lifecycle of a question's timer.
        if (game?.state === 'in-progress' && currentQuestion) {
            
            // 1. Set the timer for the new question.
            setTimer(currentQuestion.timer);

            // 2. Create an interval that ticks down every second.
            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    // When the timer is about to hit zero...
                    if (prevTimer <= 1) {
                        clearInterval(interval); // Stop the ticking
                        showLeaderboard(gameCode).catch(err => console.error("Failed to auto-show leaderboard", err));
                        return 0;
                    }
                    // Otherwise, just decrement.
                    return prevTimer - 1;
                });
            }, 1000);
            
            // 3. Cleanup: This function is crucial. It runs when the component
            //    re-renders due to a state change, ensuring we don't have multiple
            //    timers running at once.
            return () => clearInterval(interval);
        }
    }, [game?.state, currentQuestion, gameCode]); // Dependencies are now correct.


    // The manual "Show Leaderboard" button is no longer needed as the timer handles it.
    // We can keep it as a manual override if desired, but for now, we'll rely on the timer.

    const handleNextQuestion = async () => {
        if (gameCode) await nextQuestion(gameCode);
    };

    const handleEndGame = () => {
        router.push('/dashboard');
    };

    if (loading) return <div className="p-8 text-center text-2xl">Loading game...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            {game?.state === 'in-progress' && currentQuestion && (
                <div className="text-center">
                    <p className="text-lg text-gray-500">Question {game.currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <h1 className="mt-4 text-4xl font-bold text-gray-900 max-w-4xl">{currentQuestion.text}</h1>
                    <div className="mt-8 text-6xl font-bold text-indigo-600">{timer}</div>
                </div>
            )}
            
            {game?.state === 'question-results' && gameCode && (
                <LeaderboardDisplay gameCode={gameCode} isFinal={false} onNext={handleNextQuestion} />
            )}

            {game?.state === 'final-results' && gameCode && (
                <LeaderboardDisplay gameCode={gameCode} isFinal={true} onEnd={handleEndGame} />
            )}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGameSession } from '../../../../hooks/useGameSession';
import { submitAnswer } from '../../../../services/api';

export default function PlayQuestionPage() {
    const params = useParams();
    const gameCode = params.gamecode as string;
    const { game, quiz, loading, error } = useGameSession(gameCode);

    const [participantId, setParticipantId] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Get the participant ID from session storage
    useEffect(() => {
        const storedId = sessionStorage.getItem(`participantId-${gameCode}`);
        if (storedId) {
            setParticipantId(storedId);
        }
    }, [gameCode]);

    // Reset answered state when a new question appears
    useEffect(() => {
        setHasAnswered(false);
        setIsCorrect(null);
    }, [game?.currentQuestionIndex]);

    const handleAnswerSubmit = async (answer: string) => {
        if (hasAnswered || !participantId) return;
        setHasAnswered(true);
        try {
            const result = await submitAnswer(gameCode, participantId, answer);
            setIsCorrect(result.scoreAwarded > 0);
        } catch (err) {
            console.error("Failed to submit answer", err);
        }
    };

    if (loading) return <div className="p-8 text-center text-2xl">Loading question...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    const currentQuestion = game?.currentQuestionIndex !== undefined ? quiz?.questions[game.currentQuestionIndex] : undefined;

    const renderContent = () => {
        if (hasAnswered) {
            return (
                <div className="text-center">
                    <h1 className="text-4xl font-bold">{isCorrect ? 'Correct!' : 'Nice Try!'}</h1>
                    <p className="mt-4 text-xl">Waiting for the next round...</p>
                </div>
            );
        }

        if (game?.state === 'in-progress' && currentQuestion) {
            return (
                <div>
                    <h1 className="text-center text-3xl font-bold mb-8">{currentQuestion.text}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((opt, i) => (
                            <button key={i} onClick={() => handleAnswerSubmit(opt)} className="bg-indigo-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-indigo-700">
                                {opt}
                            </button>
                        ))}
                        {currentQuestion.type === 'true-false' && (
                            <>
                                <button onClick={() => handleAnswerSubmit('True')} className="bg-blue-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-blue-700">True</button>
                                <button onClick={() => handleAnswerSubmit('False')} className="bg-red-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-red-700">False</button>
                            </>
                        )}
                        {/* Text entry would require a form, omitted for simplicity */}
                    </div>
                </div>
            );
        }

        // Default waiting/leaderboard view
        return <div className="text-center text-2xl animate-pulse">Waiting for the next question...</div>;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white p-8">
            {renderContent()}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGameSession } from '../../../../hooks/useGameSession';
import { submitAnswer } from '../../../../services/api';
import LeaderboardDisplay from '../../../components/leaderboard-display';

export default function PlayQuestionPage() {
    const params = useParams();
    const gameCode = params.gamecode as string; // Using your gamecode convention
    const { game, quiz, loading, error } = useGameSession(gameCode);
    
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timer, setTimer] = useState(0);

    // Get the participant ID from session storage
    useEffect(() => {
        const storedId = sessionStorage.getItem(`participantId-${gameCode}`);
        if (storedId) {
            setParticipantId(storedId);
        }
    }, [gameCode]);
    
    const currentQuestion = game && quiz ? quiz.questions[game.currentQuestionIndex] : null;

    // Effect to reset answered state when a new question appears
    useEffect(() => {
        if (game?.state === 'in-progress') {
            setHasAnswered(false);
            if(currentQuestion) {
                setTimer(currentQuestion.timer);
            }
        }
    }, [game?.state, game?.currentQuestionIndex, currentQuestion]);

    // Effect for the visual countdown timer
    useEffect(() => {
        if (game?.state === 'in-progress' && !hasAnswered) {
             const interval = setInterval(() => {
                setTimer(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [game?.state, hasAnswered]);


    const handleAnswerSubmit = async (answer: string) => {
        if (hasAnswered || !participantId) return;
        setHasAnswered(true);
        try {
            await submitAnswer(gameCode, participantId, answer);
        } catch (err) {
            console.error("Failed to submit answer", err);
            // Optionally show an error to the user
        }
    };
    
    if (loading) return <div className="p-8 text-center text-2xl">Loading question...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    const renderContent = () => {
        // --- Leaderboard Views ---
        if (game?.state === 'question-results' || game?.state === 'final-results') {
            return <LeaderboardDisplay gameCode={gameCode} isFinal={game.state === 'final-results'} />;
        }

        // --- Question View ---
        if (game?.state === 'in-progress' && currentQuestion) {
            // If player has answered, show a waiting screen
            if (hasAnswered) {
                return (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">Answer Locked In!</h1>
                        <p className="mt-4 text-xl">Let's see how everyone else did...</p>
                    </div>
                );
            }

            // Otherwise, show the question and answer options
            return (
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <div className="text-6xl font-bold text-indigo-400">{timer}</div>
                        <h1 className="mt-4 text-3xl font-bold">{currentQuestion.text}</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((opt, i) => (
                           <button key={i} onClick={() => handleAnswerSubmit(opt)} className="bg-indigo-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-indigo-700 transition-transform transform hover:scale-105">
                               {opt}
                           </button>
                        ))}
                         {currentQuestion.type === 'true-false' && (
                             <>
                                <button onClick={() => handleAnswerSubmit('True')} className="bg-blue-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-blue-700 transition-transform transform hover:scale-105">True</button>
                                <button onClick={() => handleAnswerSubmit('False')} className="bg-red-600 text-white font-bold py-6 px-4 rounded-lg text-2xl hover:bg-red-700 transition-transform transform hover:scale-105">False</button>
                             </>
                         )}
                         {currentQuestion.type === 'text-entry' && (
                            <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(e.currentTarget.answer.value); }} className="md:col-span-2 flex gap-2">
                                <input name="answer" type="text" className="flex-grow bg-gray-700 p-4 rounded-lg text-2xl" placeholder="Type your answer..."/>
                                <button type="submit" className="bg-green-600 text-white font-bold px-8 rounded-lg text-2xl hover:bg-green-700">Submit</button>
                            </form>
                         )}
                    </div>
                </div>
            );
        }

        // Default waiting view
        return <div className="text-center text-2xl animate-pulse">Waiting for the next question...</div>;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white p-8">
            {renderContent()}
        </div>
    );
}
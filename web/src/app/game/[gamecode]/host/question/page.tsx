'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGameSession } from '../../../../../hooks/useGameSession';
import { nextQuestion, showLeaderboard } from '../../../../../services/api';

// You would create a proper Leaderboard component in a real app
const Leaderboard = ({ gameCode }: { gameCode: string }) => {
    // This component would also listen to the participants sub-collection
    // to show live scores. For now, it's a simple view.
    const handleNext = async () => {
        await nextQuestion(gameCode);
    };
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <p className="mt-4">Scores will be shown here.</p>
            <button onClick={handleNext} className="mt-8 bg-indigo-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-indigo-700">
                Next Question
            </button>
        </div>
    );
};

const FinalResults = () => {
    const router = useRouter();
    return (
         <div className="text-center">
            <h1 className="text-4xl font-bold">Final Results!</h1>
            <p className="mt-4">The winner is...</p>
            <button onClick={() => router.push('/dashboard')} className="mt-8 bg-gray-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-gray-700">
                Back to Dashboard
            </button>
        </div>
    );
};

export default function HostQuestionPage() {
    const params = useParams();
    const gameCode = params.gamecode as string; // Respecting your convention
    const { game, quiz, loading, error } = useGameSession(gameCode);

    const handleShowLeaderboard = async () => {
        await showLeaderboard(gameCode);
    };

    if (loading) return <div className="p-8 text-center text-2xl">Loading game...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    const currentQuestion = quiz?.questions?.[game?.currentQuestionIndex ?? 0];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            {game?.state === 'in-progress' && currentQuestion && (
                <div className="text-center">
                    <p className="text-lg text-gray-500">Question {game.currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <h1 className="mt-4 text-4xl font-bold">{currentQuestion.text}</h1>
                    {/* Add a timer visual here */}
                    <button onClick={handleShowLeaderboard} className="mt-12 bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-green-700">
                        Show Leaderboard
                    </button>
                </div>
            )}
            {game?.state === 'question-results' && <Leaderboard gameCode={gameCode} />}
            {game?.state === 'final-results' && <FinalResults />}
        </div>
    );
}
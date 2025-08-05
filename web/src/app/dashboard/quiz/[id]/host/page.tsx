'use client';

import { useEffect, useState, useRef } from 'react'; // <-- Import useRef
import { useParams, useRouter } from 'next/navigation';
import { createGame } from '../../../../../services/api';
import SubscriptionGuard from '../../../../components/subscription-guard';

export default function HostLauncherPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [error, setError] = useState<string | null>(null);

    // THE FIX: Use a ref to track if the game creation has been initiated.
    // This prevents the effect from running twice in Strict Mode.
    const creationInitiated = useRef(false);

    useEffect(() => {
        // Exit if the ID isn't ready or if we've already started the process.
        if (!quizId || creationInitiated.current) {
            return;
        }

        // Set the flag to true immediately to prevent re-entry.
        creationInitiated.current = true;

        const startNewGame = async () => {
            try {
                const { gameCode } = await createGame(quizId);
                // On success, redirect to the main host lobby page.
                // This will now only happen ONCE with ONE game code.
                router.push(`/game/${gameCode}/host`);
            } catch (err) {
                console.error("Failed to create game session", err);
                setError("Could not start a new game. Please go back to the dashboard and try again.");
            }
        };

        startNewGame();
    }, [quizId, router]); // Dependency array remains the same.

    return (
        <SubscriptionGuard>
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                {error ? (
                    <div className="text-red-600 bg-red-100 p-6 rounded-lg shadow-md">
                        <p className="font-semibold">An Error Occurred</p>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-xl text-gray-600">Preparing your live game session...</p>
                    </div>
                )}
            </div>
        </SubscriptionGuard>
    );
}
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, onSnapshot, doc } from 'firebase/firestore'; // Import doc
import { db } from '../../../../lib/firebase';
import QRCode from 'react-qr-code';
import SubscriptionGuard from '../../../components/subscription-guard';
import { startGame } from '../../../../services/api';

interface Participant {
    id: string;
    pseudonym: string;
}

interface GameState {
    state: 'lobby' | 'in-progress' | 'finished';
    // Add other game state fields as needed
}

// This is the main UI component, now with full functionality
function HostLobbyUI() {
    const router = useRouter();
    const params = useParams();
    const gameCode = params.gamecode as string;

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(false); // For the start button

    const joinUrl = useMemo(() => {
        if (typeof window !== 'undefined' && gameCode) {
            return `${window.location.origin}/join?code=${gameCode}`;
        }
        return '';
    }, [gameCode]);

    // Effect to listen for participant changes
    useEffect(() => {
        if (!gameCode) return;
        const participantsRef = collection(db, 'games', gameCode, 'participants');
        const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
            const newParticipants = snapshot.docs.map(doc => ({
                id: doc.id,
                pseudonym: doc.data().pseudonym,
            }));
            setParticipants(newParticipants);
        });
        return () => unsubscribe();
    }, [gameCode]);

    // NEW Effect: Listen for changes to the main game document (state changes)
    useEffect(() => {
        if (!gameCode) return;
        const gameRef = doc(db, 'games', gameCode);
        const unsubscribe = onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                setGameState(docSnap.data() as GameState);
            }
        });
        return () => unsubscribe();
    }, [gameCode]);

    // NEW Effect: React to game state changes by redirecting
    useEffect(() => {
        if (gameState?.state === 'in-progress') {
            // When game starts, navigate to the presenter's question view
            router.push(`/game/${gameCode}/host/question`);
        }
    }, [gameState, gameCode, router]);

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            await startGame(gameCode);
            // The useEffect above will handle the redirect automatically
        } catch (error) {
            console.error("Failed to start quiz", error);
            alert("Could not start the quiz. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-3/4 bg-white flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl font-bold text-gray-800">Game Lobby</h1>
                <p className="mt-4 text-lg text-gray-600">Waiting for players to join...</p>

                <div className="mt-8 p-6 border-4 border-dashed rounded-lg min-h-[200px] w-full max-w-md flex items-center justify-center">
                    {participants.length > 0 ? (
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center w-full">
                            {participants.map(p => (
                                <li key={p.id} className="bg-gray-200 p-2 rounded-md font-semibold truncate">{p.pseudonym}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No players have joined yet.</p>
                    )}
                </div>

                <div className="mt-auto">
                    <button
                        onClick={handleStartQuiz}
                        className="w-full bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={participants.length === 0 || loading}
                    >
                        {loading ? 'Starting...' : `Start Quiz (${participants.length})`}
                    </button>
                </div>
            </div>

            <div className="w-1/4 bg-indigo-800 text-white flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold">Join the Game!</h2>
                <p className="mt-4">Use the code or scan the QR</p>
                <div className="my-8 text-6xl font-mono tracking-widest bg-white text-indigo-900 p-4 rounded-lg w-full">
                    {gameCode ? gameCode : '...'}
                </div>
                <div className="p-4 bg-white rounded-lg">
                    {joinUrl ? (
                        <QRCode value={joinUrl} size={180} />
                    ) : (
                        <div className="w-[180px] h-[180px] bg-gray-200 animate-pulse"></div>
                    )}
                </div>
            </div>
        </div>
    );
}

// The exported page remains the same, wrapping the UI in the guard
export default function HostLobbyPage() {
    return (
        <SubscriptionGuard>
            <HostLobbyUI />
        </SubscriptionGuard>
    );
}
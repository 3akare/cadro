'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface GameState {
    state: 'lobby' | 'in-progress' | 'finished';
}

export default function PlayLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const gameCode = params.gamecode as string;

    const [gameExists, setGameExists] = useState<boolean | null>(null);
    const [pseudonym, setPseudonym] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to check if game exists initially
    useEffect(() => {
        const checkGame = async () => {
            const gameRef = doc(db, 'games', gameCode);
            const gameSnap = await getDoc(gameRef);
            if (gameSnap.exists()) {
                // Also check if the game is still in the lobby
                if (gameSnap.data().state !== 'lobby') {
                    setGameExists(false); // Treat a running game as un-joinable
                    setError("This game has already started.");
                } else {
                    setGameExists(true);
                }
            } else {
                setGameExists(false);
            }
        };
        if (gameCode) {
            checkGame();
        }
    }, [gameCode]);

    // NEW Effect: Listen for game start *after* the player has joined
    useEffect(() => {
        if (!hasJoined || !gameCode) return;

        const gameRef = doc(db, 'games', gameCode);
        const unsubscribe = onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const gameState = docSnap.data() as GameState;
                if (gameState.state === 'in-progress') {
                    // Game has started! Redirect participant to their question view.
                    router.push(`/play/${gameCode}/question`);
                }
            }
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();

    }, [hasJoined, gameCode, router]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pseudonym.trim()) return;
        try {
            const participantsRef = collection(db, 'games', gameCode, 'participants');
            // Get the newly created document reference
            const docRef = await addDoc(participantsRef, {
                pseudonym: pseudonym.trim(),
                score: 0,
                answers: {}
            });
            // --- NEW: Save the participant's unique ID to session storage ---
            sessionStorage.setItem(`participantId-${gameCode}`, docRef.id);
            setHasJoined(true);
        } catch (error) { /* ... */ }
    };

    if (gameExists === null) return <div className="p-8 text-center">Checking game code...</div>;
    if (gameExists === false) return <div className="p-8 text-center text-red-500">{error || "Game not found. Please check the code and try again."}</div>;

    if (hasJoined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-700 text-white text-center p-4">
                <h2 className="text-3xl font-bold">You're in!</h2>
                <p className="mt-4 text-xl">See your name on the presenter's screen.</p>
                <div className="mt-24 text-2xl animate-pulse">
                    Waiting for the quiz to begin...
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold">Enter Your Nickname</h1>
                <form onSubmit={handleJoin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your cool name"
                        value={pseudonym}
                        onChange={(e) => setPseudonym(e.target.value)}
                        className="w-full px-4 py-3 text-center text-xl rounded-md border-gray-300 shadow-sm"
                        maxLength={15}
                    />
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-green-700">
                        Join Game
                    </button>
                </form>
            </div>
        </div>
    );
}
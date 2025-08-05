'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function PlayLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const gameCode = params.gamecode as string;

    const [gameExists, setGameExists] = useState<boolean | null>(null);
    const [pseudonym, setPseudonym] = useState('');
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const checkGame = async () => {
            const gameRef = doc(db, 'games', gameCode);
            const gameSnap = await getDoc(gameRef);
            setGameExists(gameSnap.exists());
        };
        if (gameCode) {
            checkGame();
        }
    }, [gameCode]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pseudonym.trim()) return;

        try {
            const participantsRef = collection(db, 'games', gameCode, 'participants');
            await addDoc(participantsRef, {
                pseudonym: pseudonym.trim(),
                score: 0,
            });
            setHasJoined(true);
        } catch (error) {
            console.error("Failed to join game", error);
            // Handle error display
        }
    };

    if (gameExists === null) return <div className="p-8 text-center">Checking game code...</div>;
    if (gameExists === false) return <div className="p-8 text-center text-red-500">Game not found. Please check the code and try again.</div>;

    if (hasJoined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-700 text-white text-center">
                <h2 className="text-3xl font-bold">You're in!</h2>
                <p className="mt-4 text-xl">See your name on the screen?</p>
                <p className="mt-12 text-2xl">Waiting for the presenter to start the quiz...</p>
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
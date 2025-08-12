'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Participant {
    id: string;
    pseudonym: string;
    score: number;
}

interface LeaderboardProps {
    gameCode: string;
    isFinal: boolean;
    onNext?: () => void; // Optional callback for presenter
    onEnd?: () => void;  // Optional callback for presenter
}

export default function LeaderboardDisplay({ gameCode, isFinal, onNext, onEnd }: LeaderboardProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameCode) return;

        const participantsRef = collection(db, 'games', gameCode, 'participants');
        const q = query(participantsRef, orderBy('score', 'desc')); // Order by score

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rankedParticipants = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Participant));
            setParticipants(rankedParticipants);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [gameCode]);

    return (
        <div className="text-center w-full max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">{isFinal ? '🏆 Final Results! 🏆' : 'Leaderboard'}</h1>
            {loading ? (
                <p>Calculating scores...</p>
            ) : (
                <div className="space-y-3">
                    {participants.map((p, index) => (
                        <div key={p.id} className="flex items-center justify-between bg-white text-gray-800 p-4 rounded-lg shadow">
                            <span className="font-bold text-lg">{index + 1}. {p.pseudonym}</span>
                            <span className="text-lg">{p.score} pts</span>
                        </div>
                    ))}
                </div>
            )}
            {!isFinal && onNext && (
                <button onClick={onNext} className="mt-12 bg-indigo-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-indigo-700">
                    Next Question
                </button>
            )}
            {isFinal && onEnd && (
                <button onClick={onEnd} className="mt-12 bg-gray-600 text-white font-bold py-4 px-12 rounded-lg text-2xl hover:bg-gray-700">
                    End Game
                </button>
            )}
        </div>
    );
}
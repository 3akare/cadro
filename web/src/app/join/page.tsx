'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
    const router = useRouter();
    const [gameCode, setGameCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameCode.trim()) {
            router.push(`/play/${gameCode.trim()}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold">Join a Game</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter Game Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-indigo-700">
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}
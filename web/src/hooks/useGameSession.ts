'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getQuizById, Quiz } from '../services/api'; // Assuming Quiz type is exported from api.ts

// Define the shape of the game document in Firestore
export interface Game {
    state: 'lobby' | 'in-progress' | 'question-results' | 'final-results';
    quizId: string;
    hostId: string;
    currentQuestionIndex: number;
    // We will add a leaderboard field later
}

export function useGameSession(gameCode: string) {
    const [game, setGame] = useState<Game | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameCode) {
            setLoading(false);
            setError("No game code provided.");
            return;
        }

        let isMounted = true; // Prevent state updates on unmounted component

        // Listener for the main game document
        const gameRef = doc(db, 'games', gameCode);
        const unsubscribeGame = onSnapshot(gameRef, (docSnap) => {
            if (!isMounted) return;

            if (docSnap.exists()) {
                const gameData = docSnap.data() as Game;
                setGame(gameData);

                // If we haven't fetched the quiz yet, do it now.
                if (!quiz && gameData.quizId) {
                    getQuizById(gameData.quizId)
                        .then(quizData => {
                            if (isMounted) setQuiz(quizData);
                        })
                        .catch(err => {
                            console.error("Failed to fetch quiz", err);
                            if (isMounted) setError("Could not load the quiz associated with this game.");
                        });
                }
            } else {
                setError("This game session does not exist.");
                setGame(null);
            }
        });

        // Combined loading state management
        useEffect(() => {
            if (game && quiz) {
                setLoading(false);
            }
        }, [game, quiz]);

        return () => {
            isMounted = false;
            unsubscribeGame();
        };
    }, [gameCode, quiz]); // `quiz` is in the dependency array to prevent re-fetching

    return { game, quiz, loading, error };
}
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getQuizById, Quiz } from '../services/api'; // Make sure Quiz is exported from api.ts

// Define the shape of the game document in Firestore
export interface Game {
    state: 'lobby' | 'in-progress' | 'question-results' | 'final-results';
    quizId: string;
    hostId: string;
    currentQuestionIndex: number;
}

export function useGameSession(gameCode: string) {
    const [game, setGame] = useState<Game | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This effect should only run when the gameCode changes.
        if (!gameCode) {
            setLoading(false);
            setError("No game code provided.");
            return;
        }

        let isMounted = true; // Prevent state updates on unmounted component
        let quizFetched = false; // Flag to prevent re-fetching the quiz

        // Listener for the main game document
        const gameRef = doc(db, 'games', gameCode);
        const unsubscribeGame = onSnapshot(gameRef, (docSnap) => {
            if (!isMounted) return;

            if (docSnap.exists()) {
                const gameData = docSnap.data() as Game;
                setGame(gameData);

                // If we haven't fetched the quiz yet, do it now.
                // This check prevents re-fetching every time the game state changes.
                if (!quizFetched && gameData.quizId) {
                    quizFetched = true; // Set flag immediately
                    getQuizById(gameData.quizId)
                        .then(quizData => {
                            if (isMounted) {
                                setQuiz(quizData);
                                setLoading(false); // We are done loading ONLY when both are fetched
                            }
                        })
                        .catch(err => {
                            console.error("Failed to fetch quiz", err);
                            if (isMounted) {
                                setError("Could not load the quiz associated with this game.");
                                setLoading(false); // Also stop loading on error
                            }
                        });
                }
            } else {
                setError("This game session does not exist.");
                setGame(null);
                setLoading(false); // Stop loading if game doesn't exist
            }
        }, (err) => {
            // Handle snapshot errors
            console.error("Firestore listener error:", err);
            if (isMounted) {
                setError("A connection error occurred.");
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribeGame();
        };
    }, [gameCode]); // The dependency array is now correct.

    return { game, quiz, loading, error };
}
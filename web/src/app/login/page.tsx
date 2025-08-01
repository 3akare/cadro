'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import axios from 'axios';

// This function will be called after any successful Firebase sign-in
const getBackendToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user found after login.");

    const firebaseToken = await currentUser.getIdToken();
    const response = await axios.post('http://localhost:3001/auth/v1/login', {
        token: firebaseToken,
    });

    // For simplicity, we'll store the token in localStorage.
    // For production, HttpOnly cookies are more secure.
    localStorage.setItem('accessToken', response.data.accessToken);
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailLogin = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            await getBackendToken();
            console.log("success")// Redirect to dashboard after login
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            await getBackendToken();
            router.push('/dashboard'); // Redirect
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Presenter Login</h2>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    {/* Add a Google Icon SVG here */}
                    Sign in with Google
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Email/Password Form */}
                <form className="space-y-6" onSubmit={handleEmailLogin}>
                    {/* Email and Password inputs (similar to your register page) */}
                </form>
                {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
            </div>
        </div>
    );
}
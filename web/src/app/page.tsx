'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const getBackendToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No user found after login.");

  const firebaseToken = await currentUser.getIdToken();
  const response = await axios.post('http://localhost:3001/auth/v1/login', {
    token: firebaseToken,
  });

  localStorage.setItem('accessToken', response.data.accessToken);
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await getBackendToken();
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  };

  if (loading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Cadro
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Your real-time interactive quiz platform.
        </p>
        <div className="mt-10">
          <button
            onClick={handleGoogleLogin}
            className="rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in with Google to Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
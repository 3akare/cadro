'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('accessToken');
            router.push('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
        >
            Logout
        </button>
    );
}
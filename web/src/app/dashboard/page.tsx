'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../components/LogoutButton';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If loading is finished and there's no user, redirect to login page.
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // While loading, we can show a spinner or a blank screen to prevent flashing content.
    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner component
    }

    // If the user is authenticated, render the children (the actual page).
    if (user) {
        return (
            <div className="dashboard-container">
                <header className="flex justify-between items-center p-4 bg-white shadow-md">
                    <h1 className="text-xl font-bold">Presenter Dashboard</h1>
                    <LogoutButton />
                </header>
                <main className="p-4">
                    {children}
                </main>
            </div>
        );
    }

    // If not loading and no user, this will be briefly rendered before the redirect happens.
    return null;
}
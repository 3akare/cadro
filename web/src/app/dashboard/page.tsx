'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../components/LogoutButton';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner component
    }
    if (user) {
        return (
            <div className="dashboard-container">
                <header className="flex justify-between items-center p-4 bg-white shadow-md">
                    <h1 className="text-xl font-bold">Presenter Dashboard</h1>
                    <LogoutButton />
                    <Link href={"/dashboard/quiz"}>quiz</Link>
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
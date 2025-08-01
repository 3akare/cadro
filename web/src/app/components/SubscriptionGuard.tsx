'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) {
            return;
        }
        const isActive = userProfile?.subscription?.status === 'active';
        if (!isActive) {
            router.push('/dashboard/subscribe');
        }
    }, [userProfile, loading, router]);
    if (userProfile?.subscription?.status === 'active') {
        return <>{children}</>;
    }
    return <div>Verifying subscription...</div>;
}
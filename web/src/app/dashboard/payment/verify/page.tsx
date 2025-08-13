'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

// Inner client component that uses useSearchParams, wrapped by Suspense below
function VerifyPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userProfile, loading } = useAuth();

    const reference = searchParams.get('reference');

    useEffect(() => {
        if (loading) return; // Wait for auth context

        if (userProfile?.subscription?.status === 'active') {
            const t = setTimeout(() => router.push('/dashboard'), 2000);
            return () => clearTimeout(t);
        }
    }, [userProfile, loading, router]);

    if (userProfile?.subscription?.status === 'active') {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
                <p>Your subscription is now active. Redirecting you to the dashboard...</p>
            </div>
        );
    }

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-bold">Verifying Your Payment...</h1>
            <p>Please do not close this window. We are confirming your subscription.</p>
            <p className="text-sm text-gray-500 mt-4">Payment Reference: {reference}</p>
        </div>
    );
}

export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Preparing verification…</div>}>
            <VerifyPaymentContent />
        </Suspense>
    );
}
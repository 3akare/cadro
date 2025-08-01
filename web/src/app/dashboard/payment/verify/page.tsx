'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

export default function VerifyPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userProfile, loading } = useAuth();

    // Get the payment reference from the URL (?reference=...)
    const reference = searchParams.get('reference');

    useEffect(() => {
        if (loading) {
            return; // Wait for auth context to load
        }

        // The real-time listener in AuthContext will do the heavy lifting.
        // We just wait until the subscription status becomes 'active'.
        if (userProfile?.subscription?.status === 'active') {
            // Optional: show a success message for a couple of seconds
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000); // 2-second delay
        }

        // You could add a timeout here to handle cases where the webhook is delayed
        // and redirect to /dashboard/subscribe with an error message.

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
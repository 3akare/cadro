'use client';

import { useState } from 'react';
import axios from 'axios';
import AuthGuard from '@/app/components/auth-guard';

const plans = [
    { id: '1-day', name: '1-Day Pass', price: '100 NGN' },
    { id: '3-day', name: '3-Day Pass', price: '250 NGN' },
    { id: '7-day', name: '7-Day Pass', price: '500 NGN' },
];

export default function SubscribePage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPlan = async (planId: '1-day' | '3-day' | '7-day') => {
        setLoadingPlan(planId);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL as string}/api/v1/subscriptions/create-intent`,
                { plan: planId },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const { authorization_url } = response.data.data;
            window.location.href = authorization_url;

        } catch (err) {
            setError('Could not initiate payment. Please try again.');
            console.error(err);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <AuthGuard>
            <div>
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className="border p-4 rounded-lg text-center">
                            <h3 className="text-xl font-semibold">{plan.name}</h3>
                            <p className="text-2xl my-4">{plan.price}</p>
                            <button
                                onClick={() => handleSelectPlan(plan.id as any)}
                                disabled={loadingPlan === plan.id}
                                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                            >
                                {loadingPlan === plan.id ? 'Processing...' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>
                {error && <p className="mt-4 text-red-600">{error}</p>}
            </div>
        </AuthGuard>
    );
}
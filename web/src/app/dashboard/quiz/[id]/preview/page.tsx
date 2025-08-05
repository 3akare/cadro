'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizById, Quiz } from '../../../../../services/api';
import SubscriptionGuard from '../../../../components/subscription-guard';

export default function PreviewQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            try {
                const data = await getQuizById(quizId);
                setQuiz(data);
            } catch (err) {
                setError("Failed to load quiz preview. You may not have permission to view it.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    if (loading) return <div className="p-8 text-center">Loading preview...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

    return (
        <SubscriptionGuard>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">A preview of your quiz. ({quiz.questions.length} questions)</p>
                </div>

                <div className="space-y-6">
                    {quiz.questions.map((q, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-500">Question {index + 1} • {q.timer} seconds</p>
                            <p className="mt-2 text-xl font-semibold text-gray-800">{q.text}</p>

                            <div className="mt-4">
                                {q.type === 'multiple-choice' && (
                                    <ul className="space-y-3">
                                        {q.options?.map((opt, oIndex) => (
                                            <li key={oIndex} className={`block p-3 rounded-md border text-sm ${q.answer === opt ? 'bg-green-100 border-green-400 text-green-800 font-bold' : 'bg-gray-50'}`}>
                                                {opt} {q.answer === opt && '✔'}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {q.type === 'true-false' && (
                                    <p className={`font-mono text-lg p-3 rounded-md border ${q.answer === 'True' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>Correct Answer: {q.answer}</p>
                                )}
                                {q.type === 'text-entry' && (
                                    <p className="font-mono text-lg p-3 bg-green-100 border-green-400 rounded-md">Correct Answer: "{q.answer}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <button onClick={() => router.push('/dashboard')} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </SubscriptionGuard>
    );
}
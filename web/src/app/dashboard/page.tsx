'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizzes, deleteQuiz, Quiz } from '../../services/api';
import SubscriptionGuard from '../components/subscription-guard';

export default function DashboardPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setError(null);
                const data = await getQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
                setError("Could not load your quizzes. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleDelete = async (quizId: string) => {
        if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            try {
                await deleteQuiz(quizId);
                setQuizzes(currentQuizzes => currentQuizzes.filter(q => q.id !== quizId));
            } catch (err) {
                console.error("Failed to delete quiz", err);
                setError('Could not delete the quiz. Please try again.');
            }
        }
    };

    return (
        <SubscriptionGuard>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">My Quizzes</h1>
                        <p className="mt-2 text-sm text-gray-700">A list of all the quizzes you have created.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link href="/dashboard/quiz/create">
                            <span className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                                Create New Quiz
                            </span>
                        </Link>
                    </div>
                </div>

                {error && <div className="mt-4 p-3 text-red-700 bg-red-100 rounded-md">{error}</div>}

                <div className="mt-8 flex flex-col">
                    {loading ? (
                        <p>Loading your quizzes...</p>
                    ) : quizzes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first quiz.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {quizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white overflow-hidden shadow rounded-lg p-5 flex flex-col">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{quiz.title}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{quiz.questions.length} questions</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Created: {new Date(quiz.createdAt._seconds * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-5 border-t border-gray-200 pt-4 flex items-center justify-end space-x-4">
                                        <Link href={`/dashboard/quiz/${quiz.id}/host`} className="flex-1">
                                            <span className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                                Host
                                            </span>
                                        </Link>
                                        <Link href={`/dashboard/quiz/${quiz.id}/preview`}>
                                            <span className="text-sm font-medium text-gray-700 hover:text-gray-900">Preview</span>
                                        </Link>
                                        <Link href={`/dashboard/quiz/${quiz.id}/edit`}>
                                            <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</span>
                                        </Link>
                                        <button onClick={() => handleDelete(quiz.id)} className="text-sm font-medium text-red-600 hover:text-red-800">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SubscriptionGuard>
    );
}
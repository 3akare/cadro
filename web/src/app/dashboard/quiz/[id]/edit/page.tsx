'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getQuizById, updateQuiz } from '../../../../../services/api';
import SubscriptionGuard from '../../../../components/subscription-guard';

// Define the shape of a question's state
interface QuestionState {
    text: string;
    type: 'multiple-choice' | 'true-false' | 'text-entry';
    timer: number;
    options: string[];
    answer: string;
}

// Factory function to create a clean, new question object
const newQuestion = (): QuestionState => ({
    text: '',
    type: 'multiple-choice',
    timer: 30,
    options: ['', '', '', ''],
    answer: '',
});

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<QuestionState[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing quiz data when the component mounts
    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            setError("Quiz ID is missing.");
            return;
        }

        const fetchQuizData = async () => {
            try {
                const quiz = await getQuizById(quizId);
                setTitle(quiz.title);
                // Ensure every question object has a consistent shape for the form
                const formattedQuestions = quiz.questions.map(q => ({
                    text: q.text || '',
                    type: q.type || 'multiple-choice',
                    timer: q.timer || 30,
                    options: q.options && q.options.length ? q.options : ['', '', '', ''],
                    answer: q.answer || ''
                }));
                setQuestions(formattedQuestions);
            } catch (err) {
                console.error(err);
                setError("Could not load quiz data. You may not have permission to edit this quiz, or it may not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [quizId]);

    // --- FORM HANDLER FUNCTIONS (Identical to Create Page) ---

    const handleQuestionChange = (index: number, field: keyof QuestionState, value: any) => {
        const newQuestions = [...questions];
        const questionToUpdate = { ...newQuestions[index] };

        if (field === 'type') {
            questionToUpdate.options = ['', '', '', ''];
            questionToUpdate.answer = '';
        }

        (questionToUpdate as any)[field] = value;
        newQuestions[index] = questionToUpdate;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, newQuestion()]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    // --- SUBMIT HANDLER (Calls the update API) ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!title.trim()) {
            setError("Quiz title is required.");
            setLoading(false);
            return;
        }
        for (const q of questions) {
            if (!q.text.trim() || !q.answer.trim()) {
                setError(`All questions must have text and a selected answer.`);
                setLoading(false);
                return;
            }
        }

        try {
            await updateQuiz(quizId, { title, questions });
            router.push('/dashboard');
        } catch (err) {
            console.error("Failed to update quiz", err);
            setError("Could not update quiz. Please try again.");
            setLoading(false);
        }
    };

    // --- RENDER LOGIC ---

    if (loading && !error) {
        return <div className="p-8 text-center">Loading quiz editor...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <SubscriptionGuard>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-12">
                        {/* Quiz Title Section */}
                        <div className="border-b border-gray-900/10 pb-12">
                            <h1 className="text-2xl font-semibold leading-7 text-gray-900">Edit Quiz</h1>
                            <p className="mt-1 text-sm leading-6 text-gray-600">Update the details of your quiz.</p>
                            <div className="mt-6">
                                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Quiz Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                />
                            </div>
                        </div>

                        {/* Questions Section */}
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="border-b border-gray-900/10 pb-12">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold leading-7 text-gray-900">Question {qIndex + 1}</h2>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => removeQuestion(qIndex)} className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100">Remove</button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="col-span-full">
                                        <label htmlFor={`question-text-${qIndex}`} className="block text-sm font-medium leading-6 text-gray-900">Question Text</label>
                                        <textarea
                                            id={`question-text-${qIndex}`}
                                            rows={3}
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor={`question-type-${qIndex}`} className="block text-sm font-medium leading-6 text-gray-900">Question Type</label>
                                        <select
                                            id={`question-type-${qIndex}`}
                                            value={q.type}
                                            onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                        >
                                            <option value="multiple-choice">Multiple Choice</option>
                                            <option value="true-false">True / False</option>
                                            <option value="text-entry">Text Entry</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor={`question-timer-${qIndex}`} className="block text-sm font-medium leading-6 text-gray-900">Time Limit</label>
                                        <select
                                            id={`question-timer-${qIndex}`}
                                            value={q.timer}
                                            onChange={(e) => handleQuestionChange(qIndex, 'timer', parseInt(e.target.value))}
                                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                        >
                                            <option value={15}>15 Seconds</option>
                                            <option value={30}>30 Seconds</option>
                                            <option value={60}>60 Seconds</option>
                                            <option value={90}>90 Seconds</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900">Answer</h3>

                                    {q.type === 'multiple-choice' && (
                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="relative flex items-center">
                                                    <div className="flex h-6 items-center">
                                                        <input id={`answer-${qIndex}-${oIndex}`} name={`answer-group-${qIndex}`} type="radio" checked={q.answer === opt} onChange={() => handleQuestionChange(qIndex, 'answer', opt)} className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-600" required />
                                                    </div>
                                                    <div className="ml-3 text-sm leading-6">
                                                        <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" required />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'true-false' && (
                                        <div className="mt-4 flex items-center space-x-6">
                                            <div className="flex items-center gap-x-3"><input type="radio" id={`answer-${qIndex}-true`} name={`answer-group-${qIndex}`} value="True" checked={q.answer === 'True'} onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" /><label htmlFor={`answer-${qIndex}-true`}>True</label></div>
                                            <div className="flex items-center gap-x-3"><input type="radio" id={`answer-${qIndex}-false`} name={`answer-group-${qIndex}`} value="False" checked={q.answer === 'False'} onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" /><label htmlFor={`answer-${qIndex}-false`}>False</label></div>
                                        </div>
                                    )}

                                    {q.type === 'text-entry' && (
                                        <div className="mt-2">
                                            <input type="text" placeholder="Enter the correct answer" value={q.answer} onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" required />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="border-b border-gray-900/10 pb-12">
                            <button type="button" onClick={addQuestion} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Add Another Question</button>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="button" onClick={() => router.push('/dashboard')} className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </SubscriptionGuard>
    );
}
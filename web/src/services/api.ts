import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001', // Your backend URL
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- DATA TYPES ---
export interface Question {
    text: string;
    type: 'multiple-choice' | 'true-false' | 'text-entry';
    timer: number;
    options?: string[];
    answer: string;
}

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    createdAt: { _seconds: number; _nanoseconds: number; }; // Firestore timestamp format
}

// --- API FUNCTIONS ---
export const getQuizzes = (): Promise<Quiz[]> => api.get('/quizzes').then(res => res.data);
export const createQuiz = (data: { title: string; questions: Question[] }): Promise<Quiz> => api.post('/quizzes', data).then(res => res.data);
export const getQuizById = (id: string): Promise<Quiz> => api.get(`/quizzes/${id}`).then(res => res.data);
export const updateQuiz = (id: string, data: { title: string; questions: Question[] }): Promise<Quiz> => api.put(`/quizzes/${id}`, data).then(res => res.data);
export const deleteQuiz = (id: string): Promise<void> => api.delete(`/quizzes/${id}`);
export const createGame = (quizId: string): Promise<{ gameCode: string }> => api.post('/games', { quizId }).then(res => res.data);
export const startGame = (gameCode: string): Promise<void> => api.post(`/games/${gameCode}/start`);
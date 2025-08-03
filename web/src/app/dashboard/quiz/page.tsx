import AuthGuard from "@/app/components/auth-guard";
import SubscriptionGuard from "@/app/components/subscription-guard";

export default function QuizPage() {
    return (
        <AuthGuard>
            <SubscriptionGuard>
                <div className="quiz-page">
                    <h1 className="text-2xl font-bold mb-4">Quiz Page</h1>
                    <p>This is where the quiz content will go.</p>
                </div>
            </SubscriptionGuard>
        </ AuthGuard>
    );
}
import LogoutButton from '../components/LogoutButton';
import Link from 'next/link';
import type { Metadata } from 'next';
import AuthGuard from '../components/AuthGuard'; // this is a client component

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="dashboard-container">
                <header className="flex justify-between items-center p-4 bg-white shadow-md">
                    <h1 className="text-xl font-bold">Presenter Dashboard</h1>
                    <LogoutButton />
                    <Link href={"/dashboard/quiz"}>quiz</Link>
                </header>
                <main className="p-4">{children}</main>
            </div>
        </AuthGuard>
    );
}

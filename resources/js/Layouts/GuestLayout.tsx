import ApplicationLogo from '@/Components/ApplicationLogo';
import DarkModeToggle from '@/Components/DarkModeToggle';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between transition-colors duration-200">
            <header className="p-6 sm:p-10 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <ApplicationLogo className="h-6 w-auto" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Solvity
                    </span>
                </Link>

                <DarkModeToggle />
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[480px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-100 dark:shadow-none border border-gray-200/80 dark:border-gray-700 p-8 sm:p-12 transition-colors">
                    {children}
                </div>
            </main>

            <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                &copy; {new Date().getFullYear()} Solvity
            </footer>
        </div>
    );
}

import DarkModeToggle from '@/Components/DarkModeToggle';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
    {
        name: 'Dashboard',
        href: route('dashboard'),
        active: route().current('dashboard'),
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Projects',
        href: route('projects.index'),
        active: route().current('projects.*'),
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
    },
    {
        name: 'Calendar',
        href: route('calendar'),
        active: route().current('calendar'),
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        name: 'Summary Report',
        href: route('report'),
        active: route().current('report'),
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-200">
            {/* Mobile Topbar */}
            <div className="md:hidden bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src="/images/solvity.png"
                        alt="Solvity"
                        className="h-8 w-8 object-contain rounded-lg bg-white p-1"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <span className="font-extrabold text-lg tracking-tight">Solvity</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300"
                >
                    ☰
                </button>
            </div>

            {/* Left Sidebar */}
            <aside
                className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between p-5 border-r border-slate-800 transition-transform duration-200 shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="space-y-6">
                    {/* Logo Solvity */}
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0">
                            <img
                                src="/images/solvity.png"
                                alt="Solvity"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    // Fallback visual jika file gambar belum dimasukkan
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-blue-600 font-black text-lg">S</span>';
                                }}
                            />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-white">
                            Solvity
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1 pt-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${item.active
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bottom part: Toggle Dark Mode & User Profile Card */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
                        <span>Dark Mode</span>
                        <DarkModeToggle />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <Link href={route('profile.edit')} className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition flex-1">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&bold=true`}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                            />
                            <div className="truncate">
                                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                            </div>
                        </Link>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 text-slate-400 hover:text-red-400 transition ml-2"
                            title="Log Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {header && (
                    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="max-w-7xl mx-auto px-6 py-5">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Project {
    id: number;
    name: string;
    description: string | null;
    deadline: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    tasks_count: number;
    completed_tasks_count: number;
}

interface Props {
    stats: {
        totalProjects: number;
        totalTasks: number;
        inProgressTasks: number;
        completedTasks: number;
    };
    recentProjects: Project[];
}

export default function Dashboard({ stats, recentProjects }: Props) {
    const statusBadge = (st: Project['status']) => {
        const styles = {
            'Pending': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            'In-Progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
            'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        };
        return <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${styles[st]}`}>{st}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - TaskFlow" />

            <div className="space-y-8">
                {/* Greetings */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Good morning!
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Here's your project overview for today.
                    </p>
                </div>

                {/* 4 Cards with SVG Icon */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Total Projects */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">Total Projects</div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalProjects}</div>
                        </div>
                    </div>
                    {/* Total Tasks */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">Total Tasks</div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalTasks}</div>
                        </div>
                    </div>
                    {/* In Progress */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">In Progress</div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.inProgressTasks}</div>
                        </div>
                    </div>
                    {/* Completed */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase">Completed</div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.completedTasks}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Projects</h2>
                        <Link
                            href={route('projects.index')}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View all &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => router.get(route('projects.show', project.id))}
                                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-2xl transition cursor-pointer group"
                                title="Click to view & edit project"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        {project.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition">
                                            {project.name}
                                        </span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                            {project.description || 'No description.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                    <span>{project.tasks_count} tasks</span>
                                    <span>Due: {project.deadline ? project.deadline.substring(0, 10) : '-'}</span>
                                    {statusBadge(project.status)}
                                </div>
                            </div>
                        ))}

                        {recentProjects.length === 0 && (
                            <div className="py-8 text-center text-sm text-slate-400">
                                No projects created yet. Click "View all" to create your first project!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

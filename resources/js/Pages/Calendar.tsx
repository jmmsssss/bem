import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Task {
    id: number;
    title: string;
    deadline: string;
    status: 'To-do' | 'In-Progress' | 'Done';
    project?: { id: number; name: string };
}

interface Project {
    id: number;
    name: string;
}

interface Props {
    tasks: Task[];
    projects: Project[];
}

export default function Calendar({ tasks, projects }: Props) {
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const filteredTasks = tasks.filter((t) => {
        const matchProject = selectedProject ? t.project?.id === Number(selectedProject) : true;
        const matchStatus = selectedStatus ? t.status === selectedStatus : true;
        return matchProject && matchStatus;
    });

    const getTasksForDay = (day: number) => {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredTasks.filter((t) => t.deadline && t.deadline.substring(0, 10) === dStr);
    };

    // Sort Upcoming Tasks: Urutkan berdasarkan deadline terdekat dari hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingTasksSorted = filteredTasks
        .slice()
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .filter((t) => t.deadline && t.deadline.substring(0, 10) >= todayStr);

    const displayUpcoming = upcomingTasksSorted.length > 0
        ? upcomingTasksSorted
        : filteredTasks.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return (
        <AuthenticatedLayout>
            <Head title="Calendar - Solvity" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Calendar
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track task deadlines and project schedules across the month.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Grid Kalender Container */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
                        {/* Header Kalender: 100% Responsif di HP & Tablet */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            {/* Judul Bulan */}
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                {monthNames[month]} {year}
                            </h2>

                            {/* Toolbar Kontrol: Tombol Panah & 2 Dropdown Responsif */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                                {/* Tombol Panah Navigasi Bulan */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={prevMonth}
                                        className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition flex items-center justify-center shadow-sm"
                                        title="Previous Month"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition flex items-center justify-center shadow-sm"
                                        title="Next Month"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* 2 Dropdown: Grid 2 Kolom di Mobile, Auto di Tablet/Desktop */}
                                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full sm:w-40 md:w-44 h-10 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 truncate"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full sm:w-32 md:w-36 h-10 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="To-do">To-do</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Bar Hari */}
                        <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-bold text-slate-400 pb-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="py-1">{d}</div>
                            ))}
                        </div>

                        {/* Grid Tanggal */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                            {Array.from({ length: firstDayIndex }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50 dark:bg-slate-850/20 border border-transparent" />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                                const dayNum = idx + 1;
                                const dayTasks = getTasksForDay(dayNum);
                                const isToday =
                                    new Date().getDate() === dayNum &&
                                    new Date().getMonth() === month &&
                                    new Date().getFullYear() === year;

                                return (
                                    <div
                                        key={`day-${dayNum}`}
                                        className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors overflow-hidden ${
                                            isToday
                                                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                                        }`}
                                    >
                                        <span className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {dayNum}
                                        </span>

                                        <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[48px] sm:max-h-[56px] pr-0.5">
                                            {dayTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md font-semibold truncate leading-tight ${
                                                        task.status === 'Done'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : task.status === 'In-Progress'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                                    title={`${task.title} - ${task.status}`}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Tasks Side Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                Upcoming Tasks
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">By Deadline</span>
                        </div>

                        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                            {displayUpcoming.slice(0, 8).map((task) => (
                                <div key={task.id} className="pt-3 first:pt-0 space-y-1">
                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="truncate max-w-[120px]">{task.project?.name || 'Project'}</span>
                                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                                            {task.deadline ? task.deadline.substring(0, 10) : '-'}
                                        </span>
                                    </div>
                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' :
                                        task.status === 'In-Progress' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300' :
                                        'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                                    }`}>
                                        {task.status}
                                    </span>
                                </div>
                            ))}

                            {displayUpcoming.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    No upcoming tasks.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
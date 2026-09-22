import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';

interface Project {
    id: number;
    name: string;
    tasks_count: number;
    completed_tasks_count: number;
}

interface OverdueTask {
    id: number;
    title: string;
    deadline: string;
    project?: { name: string };
}

interface Props {
    summary: {
        totalProjects: number;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        todoTasks: number;
        overdueCount: number;
        completionRate: number;
    };
    projects: Project[];
    overdueTasks: OverdueTask[];
}

export default function Report({ summary, projects, overdueTasks }: Props) {
    const [downloading, setDownloading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Menggambar lingkaran statistik menggunakan HTML5 Canvas agar 100% masuk ke export PDF
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 160;
        const center = size / 2;
        const radius = 60;
        const lineWidth = 14;

        ctx.clearRect(0, 0, size, size);

        // Lingkaran Background Abu-abu
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Lingkaran Hijau Persentase (Done)
        const rate = summary.completionRate || 0;
        if (rate > 0) {
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * (rate / 100));

            ctx.beginPath();
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.strokeStyle = '#10b981'; // Emerald Green
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }, [summary.completionRate]);

    const downloadPDF = () => {
        setDownloading(true);
        const element = document.getElementById('report-pdf-area');

        const opt = {
            margin: [10, 10, 10, 10],
            filename: 'Project_Summary_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        const generate = () => {
            (window as any).html2pdf().set(opt).from(element).save().then(() => {
                setDownloading(false);
            });
        };

        if ((window as any).html2pdf) {
            generate();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => generate();
            document.body.appendChild(script);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Summary Report - Solvity" />

            <div className="space-y-6">
                {/* Header Title & Tombol Download PDF */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Project Summary Report
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            High-level overview of project execution and performance.
                        </p>
                    </div>

                    <button
                        onClick={downloadPDF}
                        disabled={downloading}
                        className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {downloading ? 'Generating PDF...' : 'Export as PDF'}
                    </button>
                </div>

                {/* AREA YANG DI-RENDER KE FILE PDF */}
                <div id="report-pdf-area" className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 transition-colors">
                    {/* Header Dokumen PDF */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-black text-blue-600 dark:text-white">Solvity</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Automated Project Status Report</p>
                        </div>
                        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                            <div>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* 4 Cards Summary - Seragam dengan Dashboard dan Kompatibel PDF */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ pageBreakInside: 'avoid' }}>
                        {/* 1. Total Projects */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-blue-100/80 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                                    style={{ stroke: '#2563eb' }}
                                >
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Total Projects</div>
                                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{summary.totalProjects}</div>
                            </div>
                        </div>

                        {/* 2. Total Tasks */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#4f46e5"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400"
                                    style={{ stroke: '#4f46e5' }}
                                >
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Total Tasks</div>
                                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{summary.totalTasks}</div>
                            </div>
                        </div>

                        {/* 3. Completed Tasks */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#059669"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400"
                                    style={{ stroke: '#059669' }}
                                >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Completed Tasks</div>
                                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{summary.completedTasks}</div>
                            </div>
                        </div>

                        {/* 4. Overdue Tasks */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-red-100/80 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#dc2626"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400"
                                    style={{ stroke: '#dc2626' }}
                                >
                                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Overdue Tasks</div>
                                <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">{summary.overdueCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Ring Chart & Overdue Warning */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ pageBreakInside: 'avoid' }}>
                        {/* Lingkaran HTML5 Canvas (Pasti Masuk PDF) */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Task Completion Rate</h3>

                            <div className="flex items-center justify-around py-2">
                                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                    <canvas ref={canvasRef} width={160} height={160} className="w-40 h-40" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                            {summary.completionRate}%
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            Done
                                        </span>
                                    </div>
                                </div>

                                {/* Legend Detail */}
                                <div className="space-y-2 text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-200">Done ({summary.completedTasks})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-200">In Progress ({summary.inProgressTasks})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-200">To-do ({summary.todoTasks})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                                        <span className="text-red-600 dark:text-red-400">Overdue ({summary.overdueCount})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overdue Tasks Warning */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-red-600 dark:text-red-400 text-sm">Overdue Tasks Warning</h3>
                                <button
                                    type="button"
                                    onClick={() => router.post(route('debug.overdue'))}
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-900 transition"
                                    title="Generate simulated overdue task"
                                >
                                    + Simulate Overdue
                                </button>
                            </div>

                            <div className="space-y-2 divide-y divide-slate-200 dark:divide-slate-700 max-h-48 overflow-y-auto">
                                {overdueTasks.map((t) => (
                                    <div key={t.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{t.title}</div>
                                            <div className="text-slate-400">{t.project?.name}</div>
                                        </div>
                                        <span className="text-red-500 font-bold">{t.deadline ? t.deadline.substring(0, 10) : '-'}</span>
                                    </div>
                                ))}

                                {overdueTasks.length === 0 && (
                                    <div className="py-6 text-center text-xs text-slate-400">
                                        All tasks are on schedule!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Performance Breakdown */}
                    <div style={{ pageBreakInside: 'avoid', marginTop: '1.5rem' }}>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Project Performance Breakdown</h3>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-4 bg-slate-50 dark:bg-slate-800">
                            {projects.map((p) => {
                                const percent = p.tasks_count > 0 ? Math.round((p.completed_tasks_count / p.tasks_count) * 100) : 0;
                                return (
                                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="w-1/3 truncate font-bold text-sm text-slate-900 dark:text-white">{p.name}</div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 w-10 text-right">{percent}%</span>
                                        </div>
                                        <div className="text-xs text-slate-400 text-right w-20">{p.completed_tasks_count}/{p.tasks_count} done</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
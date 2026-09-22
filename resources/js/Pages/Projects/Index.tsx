import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

interface Project {
    id: number;
    name: string;
    description: string | null;
    deadline: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    tasks_count: number;
    completed_tasks_count: number;
    latest_task_deadline?: string | null;
}

interface Props {
    projects: {
        data: Project[];
        links: any[];
    };
    filters: { search?: string; status?: string };
}

export default function Index({ projects, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const handler = setTimeout(() => {
            router.get(
                route('projects.index'),
                { search, status },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [search, status]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        deadline: '',
        status: 'Pending' as 'Pending' | 'In-Progress' | 'Completed',
    });

    const openCreateModal = () => {
        setEditingProject(null);
        reset();
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (project: Project, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingProject(project);
        setData({
            name: project.name,
            description: project.description || '',
            deadline: project.deadline ? project.deadline.substring(0, 10) : '',
            status: project.status,
        });
        clearErrors();
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            put(route('projects.update', editingProject.id), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this project and all its tasks?')) {
            router.delete(route('projects.destroy', id));
        }
    };

    const statusBadge = (st: Project['status']) => {
        const styles = {
            'Pending': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            'In-Progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
            'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        };
        return <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${styles[st]}`}>{st}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Projects - Solvity" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Projects
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Click on any project to view its tasks and manage details.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
                    >
                        <span>+</span> New Project
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-11 px-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Projects Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-6">Name</th>
                                    <th className="py-3.5 px-6">Description</th>
                                    <th className="py-3.5 px-6">Deadline</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {projects.data.map((project) => (
                                    <tr
                                        key={project.id}
                                        onClick={() => router.get(route('projects.show', project.id))}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                                        title="Click to view tasks"
                                    >
                                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {project.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span>{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                            {project.description || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {project.deadline ? project.deadline.substring(0, 10) : '-'}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {statusBadge(project.status)}
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                                            <button
                                                onClick={(e) => openEditModal(project, e)}
                                                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(project.id, e)}
                                                className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {projects.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            No projects found. Click "+ New Project" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create / Edit Project */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter project name..."
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter project description..."
                                    className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                                {errors.description && <div className="text-xs text-red-500 mt-1">{errors.description}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        min={editingProject?.latest_task_deadline || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                                        required
                                    />
                                    {errors.deadline && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.deadline}</p>}
                                    {errors.deadline && <div className="text-xs text-red-500 mt-1">{errors.deadline}</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

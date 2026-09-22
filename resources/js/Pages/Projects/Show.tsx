import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    deadline: string;
    status: 'To-do' | 'In-Progress' | 'Done';
    file_path: string | null;
}

interface Project {
    id: number;
    name: string;
    description: string | null;
    deadline: string;
    status: string;
}

interface Props {
    project: Project;
    tasks: Task[];
    filters: { search?: string; status?: string; deadline?: string };
}

export default function Show({ project, tasks, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deadline, setDeadline] = useState(filters.deadline || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const handler = setTimeout(() => {
            router.get(
                route('projects.show', project.id),
                { search, status, deadline },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [search, status, deadline]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        title: string;
        description: string;
        deadline: string;
        status: 'To-do' | 'In-Progress' | 'Done';
        file: File | null;
        _method?: string;
    }>({
        title: '',
        description: '',
        deadline: '',
        status: 'To-do',
        file: null,
    });

        const openCreateModal = () => {
        setEditingTask(null);
        reset();
        clearErrors();
        setFileError(null);
        // Secara default deadline task terisi deadline project
        setData({
            title: '',
            description: '',
            deadline: project.deadline ? project.deadline.substring(0, 10) : new Date().toISOString().split('T')[0],
            status: 'To-do',
            file: null,
        });
        setModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setData({
            title: task.title,
            description: task.description || '',
            deadline: task.deadline ? task.deadline.substring(0, 10) : '',
            status: task.status,
            file: null,
        });
        clearErrors();
        setFileError(null);
        setModalOpen(true);
    };

    const processSelectedFile = (selectedFile: File) => {
        setFileError(null);
        // Validasi ukuran maks 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            setFileError('File size exceeds the 10 MB limit.');
            setData('file', null);
            return;
        }
        setData('file', selectedFile);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            processSelectedFile(selected);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processSelectedFile(droppedFile);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTask) {
            router.post(
                route('tasks.update', editingTask.id),
                {
                    _method: 'put',
                    ...data,
                },
                {
                    forceFormData: true,
                    onSuccess: () => setModalOpen(false),
                }
            );
        } else {
            post(route('projects.tasks.store', project.id), {
                forceFormData: true,
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this task and its attachment?')) {
            router.delete(route('tasks.destroy', id));
        }
    };

    const handleExportZip = () => {
        window.location.href = route('projects.export', project.id);
    };

    const columns: Array<'To-do' | 'In-Progress' | 'Done'> = ['To-do', 'In-Progress', 'Done'];

    const handleTaskDragStart = (id: number) => {
        setDraggedTaskId(id);
    };

    const handleTaskDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleTaskDrop = (newStatus: 'To-do' | 'In-Progress' | 'Done') => {
        if (!draggedTaskId) return;

        const currentTask = tasks.find((task) => task.id === draggedTaskId);
        if (currentTask && currentTask.status !== newStatus) {
            router.patch(
                route('tasks.updateStatus', draggedTaskId),
                { status: newStatus },
                { preserveScroll: true, preserveState: true }
            );
        }
        setDraggedTaskId(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${project.name} - Tasks`} />

            <div className="space-y-6">
                <div>
                    <Link
                        href={route('projects.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Projects
                    </Link>
                </div>

                {/* Project Header Info & Top Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {project.name}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            {project.description || 'Build and manage project tasks.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button
                            onClick={openCreateModal}
                            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
                        >
                            <span>+</span> New Task
                        </button>
                    </div>
                </div>

                {/* Filter Bar + Tombol Export ZIP */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-11 px-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 w-full sm:w-60 focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 px-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="To-do">To-do</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Done">Done</option>
                        </select>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="h-11 px-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleExportZip}
                        className="h-11 px-5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export ZIP
                    </button>
                </div>

                {/* Kanban Board 3 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                        <div
                            key={column}
                            onDragOver={handleTaskDragOver}
                            onDrop={() => handleTaskDrop(column)}
                            className="bg-slate-100/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    {column}
                                </h3>
                                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                                    {tasks.filter((t) => t.status === column).length}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1">
                                {tasks
                                    .filter((task) => task.status === column)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={() => handleTaskDragStart(task.id)}
                                            className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`h-2 w-2 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' :
                                                        task.status === 'In-Progress' ? 'bg-blue-500' : 'bg-slate-400'
                                                    }`} />
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            {task.description && (
                                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                                <span>Due: {task.deadline ? task.deadline.substring(0, 10) : '-'}</span>
                                                {task.file_path && (
                                                    <a
                                                        href={`/storage/${task.file_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        Attachment
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2 mt-3 pt-2">
                                                <button
                                                    onClick={() => openEditModal(task)}
                                                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Create / Edit Task dengan Drag & Drop File Upload + Display Attachment */}
            {modalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {editingTask ? 'Edit Task' : 'Create New Task'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    minLength={3}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter task title..."
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="Enter task description..."
                                    className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                    {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="To-do">To-do</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section Attachment: Status File Yang Sedang Terupload + Drag & Drop Box */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Attachment (Max 10 MB)
                                </label>

                                {/* 1. Menampilkan File Yang Sudah Ada di Server (Jika Sedang Edit) */}
                                {editingTask?.file_path && !data.file && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                {editingTask.file_path.split('/').pop()}
                                            </span>
                                        </div>
                                        <a
                                            href={`/storage/${editingTask.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
                                        >
                                            Download / View
                                        </a>
                                    </div>
                                )}

                                {/* 2. Area Drag and Drop File Upload */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                                    onDragLeave={() => setIsDraggingFile(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${isDraggingFile
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/70'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />

                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>

                                    {data.file ? (
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                                                {data.file.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {(data.file.size / (1024 * 1024)).toFixed(2)} MB - Click or drop to replace
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                Drop files here, or <span className="text-blue-600 dark:text-blue-400">click to browse</span>
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {editingTask?.file_path ? 'Upload new file to replace existing attachment' : 'Supports all file formats (Max 10 MB)'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {fileError && <p className="text-xs text-red-500 font-semibold">{fileError}</p>}
                                {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
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
                                    disabled={processing || !!fileError}
                                    className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
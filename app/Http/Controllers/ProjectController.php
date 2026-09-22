<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class ProjectController extends Controller
{
    /**
     * Dashboard Overview (Metrics + Recent Projects)
     */
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        $totalProjects = $user->projects()->count();
        $totalTasks = $user->projects()->withCount('tasks')->get()->sum('tasks_count');

        $inProgressTasks = $user->projects()
            ->withCount(['tasks' => fn($q) => $q->where('status', 'In-Progress')])
            ->get()
            ->sum('tasks_count');

        $completedTasks = $user->projects()
            ->withCount(['tasks' => fn($q) => $q->where('status', 'Done')])
            ->get()
            ->sum('tasks_count');

        $recentProjects = $user->projects()
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn($q) => $q->where('status', 'Done'),
            ])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProjects'   => $totalProjects,
                'totalTasks'      => $totalTasks,
                'inProgressTasks' => $inProgressTasks,
                'completedTasks'  => $completedTasks,
            ],
            'recentProjects' => $recentProjects,
        ]);
    }

    /**
     * Projects Management Table
     */
        public function index(Request $request): Response
    {
        $projects = $request->user()->projects()
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn ($query) => $query->where('status', 'Done'),
            ])
            ->withMax('tasks as latest_task_deadline', 'deadline') // <-- Tambahkan baris ini
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function store(ProjectRequest $request): RedirectResponse
    {
        $request->user()->projects()->create($request->validated());

        return back()->with('success', 'Project created successfully.');
    }

    public function show(Request $request, Project $project): Response
    {
        abort_if($project->user_id !== $request->user()->id, 403);

        $tasks = $project->tasks()
            ->when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->deadline, fn($q, $deadline) => $q->whereDate('deadline', $deadline))
            ->latest()
            ->get();

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks'   => $tasks,
            'filters' => $request->only(['search', 'status', 'deadline']),
        ]);
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        abort_if($project->user_id !== $request->user()->id, 403);

        $project->update($request->validated());

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        abort_if($project->user_id !== $request->user()->id, 403);

        foreach ($project->tasks as $task) {
            if ($task->file_path) {
                Storage::disk('public')->delete($task->file_path);
            }
        }

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }

    /**
     * Export Project Summary & Task Files as ZIP
     */
    public function export(Request $request, Project $project): BinaryFileResponse
    {
        abort_if($project->user_id !== $request->user()->id, 403);

        $zipFileName = 'project_' . str($project->name)->slug('_') . '_export.zip';
        $tempDir = storage_path('app/temp');

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipPath = $tempDir . '/' . $zipFileName;
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $summary = "PROJECT SUMMARY\n";
            $summary .= "========================================\n";
            $summary .= "Name        : {$project->name}\n";
            $summary .= "Status      : {$project->status}\n";
            $summary .= "Deadline    : {$project->deadline}\n";
            $summary .= "Description : {$project->description}\n\n";
            $summary .= "TASKS LIST\n";
            $summary .= "========================================\n";

            foreach ($project->tasks as $index => $task) {
                $num = $index + 1;
                $summary .= "{$num}. [{$task->status}] {$task->title}\n";
                $summary .= "   Deadline   : {$task->deadline}\n";
                if ($task->description) {
                    $summary .= "   Description: {$task->description}\n";
                }

                // File tetap dimasukkan ke dalam folder attachments/ di ZIP tanpa mencetak link di teks
                if ($task->file_path && Storage::disk('public')->exists($task->file_path)) {
                    $fileName = basename($task->file_path);
                    $fullPath = Storage::disk('public')->path($task->file_path);
                    $zip->addFile($fullPath, 'attachments/' . $fileName);
                }
                $summary .= "\n";
            }

            $zip->addFromString('project_summary.txt', $summary);
            $zip->close();
        }

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
    /**
     * Calendar View with Task Deadlines
     */
    public function calendar(Request $request): Response
    {
        $user = $request->user();

        $tasks = \App\Models\Task::whereHas('project', fn($q) => $q->where('user_id', $user->id))
            ->with('project:id,name')
            ->orderBy('deadline')
            ->get();

        $projects = $user->projects()->select('id', 'name')->get();

        return Inertia::render('Calendar', [
            'tasks'    => $tasks,
            'projects' => $projects,
        ]);
    }

        /**
     * Summary Report Page
     */
    public function report(Request $request): Response
    {
        $user = $request->user();

        $projects = $user->projects()
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'Done'),
                'tasks as in_progress_tasks_count' => fn ($q) => $q->where('status', 'In-Progress'),
                'tasks as todo_tasks_count' => fn ($q) => $q->where('status', 'To-do'),
            ])
            ->get();

        $totalProjects   = $projects->count();
        $totalTasks      = $projects->sum('tasks_count');
        $completedTasks  = $projects->sum('completed_tasks_count');
        $inProgressTasks = $projects->sum('in_progress_tasks_count');
        $todoTasks       = $projects->sum('todo_tasks_count');

        // Gunakan zona waktu lokal (Asia/Jakarta / WIB) agar pergantian hari akurat
        $timezone = config('app.timezone') && config('app.timezone') !== 'UTC'
            ? config('app.timezone')
            : 'Asia/Jakarta';
        $today = now()->setTimezone($timezone)->toDateString();

        // Query overdue task (status bukan Done dan deadline < hari ini)
        $overdueQuery = \App\Models\Task::whereHas('project', fn ($q) => $q->where('user_id', $user->id))
            ->where('status', '!=', 'Done')
            ->whereDate('deadline', '<', $today);

        // Hitung total seluruh overdue tanpa terpotong limit
        $overdueCount = (clone $overdueQuery)->count();

        // Ambil daftar overdue task diurutkan dari deadline paling baru
        $overdueTasks = $overdueQuery->with('project:id,name')
            ->orderBy('deadline', 'desc')
            ->take(15)
            ->get();

        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

        return Inertia::render('Report', [
            'summary' => [
                'totalProjects'   => $totalProjects,
                'totalTasks'      => $totalTasks,
                'completedTasks'  => $completedTasks,
                'inProgressTasks' => $inProgressTasks,
                'todoTasks'       => $todoTasks,
                'overdueCount'    => $overdueCount,
                'completionRate'  => $completionRate,
            ],
            'projects'     => $projects,
            'overdueTasks' => $overdueTasks,
        ]);
    }

    // Debug: Simulated Overdue task
    public function simulateOverdueTask(Request $request): RedirectResponse
    {
        $user = $request->user();
        $project = $user->projects()->first();

        if (!$project) {
            $project = $user->projects()->create([
                'name'        => 'Test Demo Project',
                'description' => 'Project created automatically for overdue testing.',
                'deadline'    => now()->addDays(7)->toDateString(),
                'status'      => 'In-Progress',
            ]);
        }

        $timezone = config('app.timezone') && config('app.timezone') !== 'UTC'
            ? config('app.timezone')
            : 'Asia/Jakarta';
        $yesterday = now()->setTimezone($timezone)->subDay()->toDateString();

        $project->tasks()->create([
            'title'       => 'Debug: Simulated Overdue task',
            'description' => 'la la la',
            'deadline'    => $yesterday,
            'status'      => 'To-do',
        ]);

        return back()->with('success', 'Test overdue task generated!');
    }
}
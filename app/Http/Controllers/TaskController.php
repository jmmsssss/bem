<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
        public function store(TaskRequest $request, Project $project): RedirectResponse
    {
        abort_if($project->user_id !== $request->user()->id, 403);
        $validated = $request->validated();

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('tasks', 'public');
        }

        $project->tasks()->create($validated);

        // Automatically synchronize status & deadline
        $project->syncDeadline();
        $project->syncStatus();

        return back()->with('success', 'Task added successfully.');
    }

    public function update(TaskRequest $request, Task $task): RedirectResponse
    {
        abort_if($task->project->user_id !== $request->user()->id, 403);
        $validated = $request->validated();

        if ($request->hasFile('file')) {
            if ($task->file_path) {
                Storage::disk('public')->delete($task->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('tasks', 'public');
        }

        $task->update($validated);

        // Automatically synchronize of status and deadlines to the parent project
        $task->project->syncDeadline();
        $task->project->syncStatus();

        return back()->with('success', 'Task updated successfully.');
    }
    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        abort_if($task->project->user_id !== $request->user()->id, 403);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['To-do', 'In-Progress', 'Done'])],
        ]);
        $task->update($validated);
        $task->project->syncStatus(); // Trigger syncronization
        return back();
    }
    public function destroy(Request $request, Task $task): RedirectResponse
    {
        abort_if($task->project->user_id !== $request->user()->id, 403);
        $project = $task->project;
        if ($task->file_path) {
            Storage::disk('public')->delete($task->file_path);
        }
        $task->delete();
        $project->syncStatus(); // Trigger syncronization
        return back()->with('success', 'Task deleted successfully.');
    }
}

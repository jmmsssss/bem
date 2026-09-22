<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'deadline',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'datetime:Y-m-d',
        ];
    }

    // Get project's owner
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get task
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // Sinkronisasi status proyek berdasarkan status tugas-tugasnya
    public function syncStatus(): void
    {
        $tasks = $this->tasks()->get();

        if ($tasks->isEmpty()) {
            $this->update(['status' => 'Pending']);
            return;
        }

        $totalTasks = $tasks->count();
        $doneTasks = $tasks->where('status', 'Done')->count();
        $inProgressTasks = $tasks->where('status', 'In-Progress')->count();

        if ($doneTasks === $totalTasks) {
            $this->update(['status' => 'Completed']);
        } elseif ($inProgressTasks > 0 || $doneTasks > 0) {
            $this->update(['status' => 'In-Progress']);
        } else {
            $this->update(['status' => 'Pending']);
        }
    }
    // Sinkronisasi deadline project jika ada task yang deadlinenya melebihi deadline project saat ini.
    public function syncDeadline(): void
    {
        $maxTaskDeadline = $this->tasks()->max('deadline');

        // Jika ada deadline task yang melebihi deadline project, update deadline project mengikuti task terjauh
        if ($maxTaskDeadline && $maxTaskDeadline > $this->deadline) {
            $this->update(['deadline' => $maxTaskDeadline]);
        }
    }
}

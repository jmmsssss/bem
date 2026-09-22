<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'deadline',
        'status',
        'file_path',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime:Y-m-d',
        ];
    }

    // Get task's project.
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

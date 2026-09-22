<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name'        => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'deadline'    => ['required', 'date'],
            'status'      => ['required', Rule::in(['Pending', 'In-Progress', 'Completed'])],
        ];

        // Saat UPDATE: deadline project tidak boleh lebih awal dari task terjauh
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $project = $this->route('project');
            if ($project) {
                $maxTaskDeadline = $project->tasks()->max('deadline');
                if ($maxTaskDeadline) {
                    $rules['deadline'][] = 'after_or_equal:' . $maxTaskDeadline;
                }
            }
        } else {
            // Saat CREATE: deadline tidak boleh sebelum hari ini
            $rules['deadline'][] = 'after_or_equal:today';
        }

        return $rules;
    }

    public function messages(): array
    {
        $project = $this->route('project');
        $maxTaskDeadline = $project ? $project->tasks()->max('deadline') : null;

        return [
            'name.required'           => 'Project name is required.',
            'deadline.required'       => 'Project deadline is required.',
            'deadline.after_or_equal' => $maxTaskDeadline
                ? "Project deadline cannot be earlier than its latest task deadline ({$maxTaskDeadline})."
                : "Project deadline cannot be before today.",
            'status.in'               => 'Invalid project status.',
        ];
    }
}
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'deadline'    => ['required', 'date', 'after_or_equal:today'],
            'status'      => ['required', Rule::in(['To-do', 'In-Progress', 'Done'])],
            'file'        => ['nullable', 'file', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'    => 'Judul tugas wajib diisi.',
            'title.min'         => 'Judul tugas minimal 3 karakter.',
            'deadline.required' => 'Tanggal deadline tugas wajib diisi.',
            'deadline.after_or_equal'   => 'Deadline tidak boleh sebelum hari ini.',
            'status.in'         => 'Status tugas tidak valid.',
            'file.max'          => 'Ukuran file lampiran maksimal adalah 10 MB.',
        ];
    }
}

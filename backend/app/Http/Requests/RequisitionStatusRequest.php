<?php

namespace App\Http\Requests;

use App\Models\Requisition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequisitionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Route is protected by role:admin middleware.
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(Requisition::STATUSES)],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

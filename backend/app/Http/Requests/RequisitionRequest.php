<?php

namespace App\Http\Requests;

use App\Models\Requisition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Validation for creating AND updating requisitions. */
class RequisitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // RequisitionPolicy handles ownership in the controller.
    }

    public function rules(): array
    {
        return [
            'item_id' => ['required', 'integer', 'exists:items,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'purpose' => ['required', 'string', 'min:5', 'max:255'],
            'priority' => ['required', Rule::in(Requisition::PRIORITIES)],
            'needed_by' => ['nullable', 'date', 'after_or_equal:today'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'item_id.exists' => 'Select a valid equipment item.',
            'needed_by.after_or_equal' => 'The needed-by date cannot be in the past.',
            'purpose.min' => 'State the mission purpose in at least 5 characters.',
        ];
    }
}

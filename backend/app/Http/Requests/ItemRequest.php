<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Validation for creating AND updating equipment items. */
class ItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization is handled by ItemPolicy in the controller.
    }

    public function rules(): array
    {
        $item = $this->route('item'); // Item model on update, null on create

        return [
            'name' => ['required', 'string', 'min:3', 'max:150'],
            'serial_number' => [
                'required', 'string', 'max:50',
                Rule::unique('items', 'serial_number')->ignore($item?->id),
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'depot_id' => ['required', 'integer', 'exists:depots,id'],
            'quantity' => ['required', 'integer', 'min:0', 'max:100000'],
            'reorder_level' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'status' => ['nullable', Rule::in(Item::STATUSES)],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'serial_number.unique' => 'This serial number is already in the inventory.',
            'category_id.exists' => 'Select a valid equipment category.',
            'depot_id.exists' => 'Select a valid depot.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Route is protected by role:admin middleware.
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(Item::STATUSES)],
        ];
    }
}

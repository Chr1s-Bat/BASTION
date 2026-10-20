<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'rank' => ['nullable', 'string', 'max:40'],
            'service_number' => ['nullable', 'string', 'max:30', 'unique:users,service_number'],
            'unit' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already enlisted in the system.',
            'password.confirmed' => 'Passcode confirmation does not match.',
            'service_number.unique' => 'This service number is already registered.',
        ];
    }
}

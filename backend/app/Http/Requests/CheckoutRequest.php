<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.gameId' => ['required', 'string', 'exists:games,id'],
            'items.*.amount' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required for purchase.',
            'items.*.gameId.exists' => 'The selected game does not exist.',
            'items.*.amount.min' => 'Item amount must be at least 1.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GameRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'coverImage' => ['nullable', 'url'],
            'screenshots' => ['nullable', 'array', 'max:5'],
            'screenshots.*' => ['url'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'exists:category_settings,name'],
            'description' => ['nullable', 'string'],
            'systemRequirements' => ['nullable', 'array'],
            'systemRequirements.os' => ['nullable', 'string'],
            'systemRequirements.processor' => ['nullable', 'string'],
            'systemRequirements.memory' => ['nullable', 'string'],
            'systemRequirements.graphics' => ['nullable', 'string'],
            'systemRequirements.storage' => ['nullable', 'string'],
        ];
    }

    /** Validated data with list columns defaulting to [] instead of null. */
    public function gameData(): array
    {
        return $this->validated() + ['screenshots' => [], 'categories' => []];
    }
}

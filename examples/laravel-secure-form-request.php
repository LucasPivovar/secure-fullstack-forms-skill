<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 1. Dedicated FormRequest — Prevents Mass Assignment & SQLi/XSS payloads
 */
class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'    => is_string($this->name) ? trim(strip_tags($this->name)) : $this->name,
            'email'   => is_string($this->email) ? strtolower(trim($this->email)) : $this->email,
            'message' => is_string($this->message) ? trim(strip_tags($this->message)) : $this->message,
        ]);
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'min:2', 'max:100', 'regex:/^[^<>]*$/'],
            'email'   => ['required', 'string', 'email:rfc,dns', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:2000', 'regex:/^[^<>]*$/'],
        ];
    }
}

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;

/**
 * 2. Controller — Uses $request->validated() ONLY (Never $request->all())
 * Route definition in routes/api.php:
 * Route::post('/v1/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
 */
class ContactController extends Controller
{
    public function store(StoreContactRequest $request): JsonResponse
    {
        // Strictly whitelisted payload: injected fields like 'role' or 'is_admin' are dropped
        $validated = $request->validated();

        // Eloquent uses PDO prepared statements under the hood (SQLi-safe)
        $submission = ContactSubmission::create([
            'name'    => $validated['name'],
            'email'   => $validated['email'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'         => $submission->id,
                'created_at' => $submission->created_at,
            ],
        ], 201);
    }
}

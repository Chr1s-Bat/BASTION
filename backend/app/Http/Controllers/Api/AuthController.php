<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** POST /api/register — create an account (always a regular "user" role). */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // hashed by the model cast
            'rank' => $data['rank'] ?? 'Private',
            'service_number' => $data['service_number'] ?? null,
            'unit' => $data['unit'] ?? null,
            'role' => User::ROLE_USER, // roles can never be self-assigned
        ]);

        $token = $user->createToken('bastion-spa')->plainTextToken;

        return response()->json([
            'message' => 'Enlistment successful.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /** POST /api/login — return a Sanctum token. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('bastion-spa')->plainTextToken;

        return response()->json([
            'message' => 'Access granted.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /** POST /api/logout — revoke the token used for this request. */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out. Token revoked.']);
    }

    /** GET /api/user — the currently authenticated user. */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}

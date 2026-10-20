<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /** GET /api/users?search=&role=&page= — personnel roster (admin only, via role:admin middleware). */
    public function index(Request $request)
    {
        $query = User::query()->withCount('requisitions');

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('unit', 'like', "%{$search}%")
                  ->orWhere('service_number', 'like', "%{$search}%");
            });
        }

        if (in_array($request->query('role'), [User::ROLE_ADMIN, User::ROLE_USER], true)) {
            $query->where('role', $request->query('role'));
        }

        $perPage = min(max((int) $request->query('per_page', 10), 3), 50);

        return UserResource::collection($query->orderBy('name')->paginate($perPage)->withQueryString());
    }
}

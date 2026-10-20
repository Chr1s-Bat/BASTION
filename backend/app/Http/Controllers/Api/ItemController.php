<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Http\Requests\ItemStatusRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ItemController extends Controller
{
    private const RELATIONS = ['category', 'depot', 'creator'];

    /** GET /api/items?search=&category_id=&depot_id=&status=&low_stock=&sort=&page=&per_page= */
    public function index(Request $request)
    {
        $query = Item::query()->with(self::RELATIONS); // eager loading: no N+1

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->filled('depot_id')) {
            $query->where('depot_id', $request->query('depot_id'));
        }
        if ($request->filled('status') && in_array($request->query('status'), Item::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }
        if ($request->boolean('low_stock')) {
            $query->whereColumn('quantity', '<=', 'reorder_level');
        }

        $sortable = ['name', 'quantity', 'created_at', 'status'];
        $sort = in_array($request->query('sort'), $sortable, true) ? $request->query('sort') : 'created_at';
        $dir = $request->query('dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $dir)->orderBy('id', 'desc');

        $perPage = min(max((int) $request->query('per_page', 9), 3), 50);

        return ItemResource::collection($query->paginate($perPage)->withQueryString());
    }

    /** POST /api/items */
    public function store(ItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $data['status'] = $data['status'] ?? 'operational';
        $data['reorder_level'] = $data['reorder_level'] ?? 5;

        // Only commanders may set a non-default status on creation.
        if (! $request->user()->isAdmin()) {
            $data['status'] = 'operational';
        }

        $item = Item::create($data)->load(self::RELATIONS);

        return (new ItemResource($item))->response()->setStatusCode(201);
    }

    /** GET /api/items/{item} */
    public function show(Item $item): ItemResource
    {
        return new ItemResource($item->load(self::RELATIONS));
    }

    /** PUT /api/items/{item} — owner or admin (ItemPolicy). */
    public function update(ItemRequest $request, Item $item): ItemResource
    {
        Gate::authorize('update', $item);

        $data = $request->validated();

        // Status changes belong to the dedicated PATCH endpoint (admin only).
        unset($data['status']);
        $data['reorder_level'] = $data['reorder_level'] ?? $item->reorder_level;

        $item->update($data);

        return new ItemResource($item->load(self::RELATIONS));
    }

    /** DELETE /api/items/{item} — admin only (route middleware + policy). */
    public function destroy(Item $item): Response
    {
        Gate::authorize('delete', $item);

        $item->delete();

        return response()->noContent(); // 204
    }

    /** PATCH /api/items/{item}/status — admin only. */
    public function updateStatus(ItemStatusRequest $request, Item $item): ItemResource
    {
        $item->update(['status' => $request->validated('status')]);

        return new ItemResource($item->load(self::RELATIONS));
    }
}

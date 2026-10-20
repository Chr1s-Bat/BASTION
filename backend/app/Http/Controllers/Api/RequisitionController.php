<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequisitionRequest;
use App\Http\Requests\RequisitionStatusRequest;
use App\Http\Resources\RequisitionResource;
use App\Models\Item;
use App\Models\Requisition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RequisitionController extends Controller
{
    private const RELATIONS = ['item.category', 'item.depot', 'user', 'reviewer'];

    /** GET /api/requisitions?search=&status=&priority=&page= (admins see all, users see their own) */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Requisition::query()->with(self::RELATIONS);

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhereHas('item', fn ($i) => $i->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && in_array($request->query('status'), Requisition::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('priority') && in_array($request->query('priority'), Requisition::PRIORITIES, true)) {
            $query->where('priority', $request->query('priority'));
        }

        $perPage = min(max((int) $request->query('per_page', 8), 3), 50);

        return RequisitionResource::collection(
            $query->latest()->orderBy('id', 'desc')->paginate($perPage)->withQueryString()
        );
    }

    /** POST /api/requisitions */
    public function store(RequisitionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $item = Item::findOrFail($data['item_id']);
        if ($item->status !== 'operational') {
            throw ValidationException::withMessages([
                'item_id' => ['This item is not operational and cannot be requisitioned.'],
            ]);
        }

        $requisition = Requisition::create($data + [
            'reference' => 'REQ-'.now()->format('ymd').'-'.strtoupper(Str::random(4)),
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return (new RequisitionResource($requisition->load(self::RELATIONS)))
            ->response()->setStatusCode(201);
    }

    /** GET /api/requisitions/{requisition} */
    public function show(Requisition $requisition): RequisitionResource
    {
        Gate::authorize('view', $requisition);

        return new RequisitionResource($requisition->load(self::RELATIONS));
    }

    /** PUT /api/requisitions/{requisition} — only while pending. */
    public function update(RequisitionRequest $request, Requisition $requisition): RequisitionResource
    {
        Gate::authorize('update', $requisition);

        $requisition->update($request->validated());

        return new RequisitionResource($requisition->load(self::RELATIONS));
    }

    /** DELETE /api/requisitions/{requisition} */
    public function destroy(Requisition $requisition): Response
    {
        Gate::authorize('delete', $requisition);

        $requisition->delete();

        return response()->noContent(); // 204
    }

    /**
     * PATCH /api/requisitions/{requisition}/status — admin only.
     * Workflow: pending -> approved -> issued -> returned   (or rejected)
     * Issuing deducts stock; returning adds it back.
     */
    public function updateStatus(RequisitionStatusRequest $request, Requisition $requisition): RequisitionResource
    {
        $next = $request->validated('status');

        DB::transaction(function () use ($request, $requisition, $next) {
            $requisition = Requisition::whereKey($requisition->id)->lockForUpdate()->firstOrFail();

            if (! $requisition->canMoveTo($next)) {
                throw ValidationException::withMessages([
                    'status' => ["A {$requisition->status} requisition cannot move to {$next}."],
                ]);
            }

            $item = Item::whereKey($requisition->item_id)->lockForUpdate()->firstOrFail();

            if ($next === 'issued') {
                if ($item->quantity < $requisition->quantity) {
                    throw ValidationException::withMessages([
                        'status' => ["Insufficient stock: {$item->quantity} on hand, {$requisition->quantity} requested."],
                    ]);
                }
                $item->decrement('quantity', $requisition->quantity);
            }

            if ($next === 'returned') {
                $item->increment('quantity', $requisition->quantity);
            }

            $requisition->update([
                'status' => $next,
                'remarks' => $request->validated('remarks') ?? $requisition->remarks,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        });

        return new RequisitionResource($requisition->fresh(self::RELATIONS));
    }
}

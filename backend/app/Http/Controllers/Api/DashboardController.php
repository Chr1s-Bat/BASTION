<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequisitionResource;
use App\Models\Category;
use App\Models\Item;
use App\Models\Requisition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** GET /api/dashboard — summary figures straight from the database. */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        // Admins see base-wide requisition figures; officers see their own.
        $requisitions = fn () => $user->isAdmin()
            ? Requisition::query()
            : Requisition::query()->where('user_id', $user->id);

        $byStatus = $requisitions()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recent = $requisitions()
            ->with(['item.category', 'item.depot', 'user', 'reviewer'])
            ->latest()->orderBy('id', 'desc')->limit(5)->get();

        return response()->json([
            'scope' => $user->isAdmin() ? 'base' : 'personal',
            'figures' => [
                'total_items' => Item::count(),
                'operational_items' => Item::where('status', 'operational')->count(),
                'maintenance_items' => Item::where('status', 'maintenance')->count(),
                'low_stock_items' => Item::whereColumn('quantity', '<=', 'reorder_level')->count(),
                'total_units' => (int) Item::sum('quantity'),
                'total_requisitions' => $requisitions()->count(),
                'pending_requisitions' => (int) ($byStatus['pending'] ?? 0),
                'issued_requisitions' => (int) ($byStatus['issued'] ?? 0),
                'requisitions_this_week' => $requisitions()
                    ->where('created_at', '>=', now()->startOfWeek())->count(),
            ],
            'items_by_category' => Category::withCount('items')->orderBy('name')->get()
                ->map(fn ($c) => ['name' => $c->name, 'code' => $c->code, 'total' => $c->items_count])->values(),
            'requisitions_by_status' => collect(Requisition::STATUSES)
                ->map(fn ($s) => ['status' => $s, 'total' => (int) ($byStatus[$s] ?? 0)])->values(),
            'recent_requisitions' => RequisitionResource::collection($recent)->resolve($request),
        ]);
    }
}

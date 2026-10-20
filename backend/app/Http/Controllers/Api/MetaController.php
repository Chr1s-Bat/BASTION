<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\DepotResource;
use App\Models\Category;
use App\Models\Depot;
use App\Models\Item;
use App\Models\Requisition;
use Illuminate\Http\JsonResponse;

class MetaController extends Controller
{
    /** GET /api/meta — lookup lists used by the React dropdowns. */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'categories' => CategoryResource::collection(Category::orderBy('name')->get())->resolve(),
            'depots' => DepotResource::collection(Depot::orderBy('name')->get())->resolve(),
            'item_statuses' => Item::STATUSES,
            'requisition_statuses' => Requisition::STATUSES,
            'priorities' => Requisition::PRIORITIES,
        ]);
    }
}

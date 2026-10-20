<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'quantity' => $this->quantity,
            'reorder_level' => $this->reorder_level,
            'low_stock' => $this->quantity <= $this->reorder_level,
            'status' => $this->status,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'depot_id' => $this->depot_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'depot' => new DepotResource($this->whenLoaded('depot')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            // Lets the React UI show/hide Edit and Delete buttons.
            'can' => [
                'update' => $user ? ($user->isAdmin() || $this->created_by === $user->id) : false,
                'delete' => $user ? $user->isAdmin() : false,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

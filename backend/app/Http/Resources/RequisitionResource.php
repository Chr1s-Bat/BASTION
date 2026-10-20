<?php

namespace App\Http\Resources;

use App\Models\Requisition;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user?->isAdmin() ?? false;
        $isOwner = $user && $this->user_id === $user->id;

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'quantity' => $this->quantity,
            'purpose' => $this->purpose,
            'priority' => $this->priority,
            'status' => $this->status,
            'needed_by' => $this->needed_by?->format('Y-m-d'),
            'remarks' => $this->remarks,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'item_id' => $this->item_id,
            'user_id' => $this->user_id,
            'item' => new ItemResource($this->whenLoaded('item')),
            'user' => new UserResource($this->whenLoaded('user')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'next_statuses' => Requisition::TRANSITIONS[$this->status] ?? [],
            'can' => [
                'update' => ($isAdmin || $isOwner) && $this->status === 'pending',
                'delete' => $isAdmin || ($isOwner && $this->status === 'pending'),
                'change_status' => $isAdmin,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

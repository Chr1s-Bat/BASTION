<?php

namespace App\Policies;

use App\Models\Requisition;
use App\Models\User;

class RequisitionPolicy
{
    public function view(User $user, Requisition $requisition): bool
    {
        return $user->isAdmin() || $requisition->user_id === $user->id;
    }

    /** Owners may edit only while the request is still pending; admins may always. */
    public function update(User $user, Requisition $requisition): bool
    {
        if ($user->isAdmin()) {
            return $requisition->status === 'pending';
        }

        return $requisition->user_id === $user->id && $requisition->status === 'pending';
    }

    /** Owners may withdraw a pending request; admins may delete any. */
    public function delete(User $user, Requisition $requisition): bool
    {
        return $user->isAdmin()
            || ($requisition->user_id === $user->id && $requisition->status === 'pending');
    }
}

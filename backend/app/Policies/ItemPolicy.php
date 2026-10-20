<?php

namespace App\Policies;

use App\Models\Item;
use App\Models\User;

class ItemPolicy
{
    /** Update: the officer who registered the item, or any admin. */
    public function update(User $user, Item $item): bool
    {
        return $user->isAdmin() || $item->created_by === $user->id;
    }

    /** Delete: admin only. */
    public function delete(User $user, Item $item): bool
    {
        return $user->isAdmin();
    }
}

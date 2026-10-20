<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    public const STATUSES = ['operational', 'maintenance', 'decommissioned'];

    protected $fillable = [
        'name', 'serial_number', 'category_id', 'depot_id', 'created_by',
        'quantity', 'reorder_level', 'status', 'description',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function depot(): BelongsTo
    {
        return $this->belongsTo(Depot::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function requisitions(): HasMany
    {
        return $this->hasMany(Requisition::class);
    }
}

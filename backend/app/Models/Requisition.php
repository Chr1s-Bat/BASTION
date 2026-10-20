<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Requisition extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'issued', 'returned', 'rejected'];
    public const PRIORITIES = ['routine', 'urgent', 'critical'];

    /** Allowed status workflow: current => [next states] */
    public const TRANSITIONS = [
        'pending' => ['approved', 'rejected'],
        'approved' => ['issued', 'rejected'],
        'issued' => ['returned'],
        'returned' => [],
        'rejected' => [],
    ];

    protected $fillable = [
        'reference', 'user_id', 'item_id', 'reviewed_by', 'quantity', 'purpose',
        'priority', 'status', 'needed_by', 'remarks', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'needed_by' => 'date:Y-m-d',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function canMoveTo(string $next): bool
    {
        return in_array($next, self::TRANSITIONS[$this->status] ?? [], true);
    }
}

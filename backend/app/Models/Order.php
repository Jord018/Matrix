<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * items: [{gameName, coverImage, keys: [...]}] stored as jsonb.
 */
class Order extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['userId', 'username', 'items', 'purchaseDate', 'status'];

    protected $casts = [
        'items' => 'array',
        'purchaseDate' => 'datetime',
    ];
}

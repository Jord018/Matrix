<?php

namespace App\Models;

use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Model;

/**
 * items: [{gameName, coverImage, keys: [...]}] stored as jsonb.
 */
class Order extends Model
{
    use AcceptsAnyStringId;

    protected $table = 'orders';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'userId',
        'username',
        'items',
        'purchaseDate',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'purchaseDate' => 'datetime',
    ];
}

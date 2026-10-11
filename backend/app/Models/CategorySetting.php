<?php

namespace App\Models;

use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Model;

class CategorySetting extends Model
{
    use AcceptsAnyStringId;

    protected $table = 'category_settings';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'isVisible',
    ];

    protected $casts = [
        'isVisible' => 'boolean',
    ];
}

<?php

namespace App\Models;

use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use AcceptsAnyStringId;

    protected $table = 'category_settings';

    public $timestamps = false;

    protected $fillable = ['name', 'isVisible'];

    protected $casts = ['isVisible' => 'boolean'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasUuids;

    protected $table = 'category_settings';

    public $timestamps = false;

    protected $fillable = ['name', 'isVisible'];

    protected $casts = ['isVisible' => 'boolean'];
}

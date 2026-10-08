<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Highlight extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['gameId', 'name', 'customImage', 'buttonColor'];

    public function game()
    {
        return $this->belongsTo(Game::class, 'gameId');
    }
}

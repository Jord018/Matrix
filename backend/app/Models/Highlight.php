<?php

namespace App\Models;

use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Model;

class Highlight extends Model
{
    use AcceptsAnyStringId;

    public $timestamps = false;

    protected $fillable = ['gameId', 'name', 'customImage', 'buttonColor'];

    public function game()
    {
        return $this->belongsTo(Game::class, 'gameId');
    }
}

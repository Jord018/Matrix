<?php

namespace App\Models;

use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Highlight extends Model
{
    use AcceptsAnyStringId;

    protected $table = 'highlights';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'gameId',
        'name',
        'customImage',
        'buttonColor',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'gameId');
    }
}

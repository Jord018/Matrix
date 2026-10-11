<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * New rows get a uuid, but rows migrated from the old Mongo store carry 24-char ids.
 * HasUuids would 404 any route-bound id that is not a uuid, so look the value up as-is.
 */
trait AcceptsAnyStringId
{
    use HasUuids;

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        return $query->where($field ?? $this->getRouteKeyName(), $value);
    }
}

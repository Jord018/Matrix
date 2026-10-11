<?php

// Only the keys that differ from Laravel's defaults.
return [

    'bcrypt' => [
        'rounds' => env('BCRYPT_ROUNDS', 12),
        // The old Node app (shared Account table) stores $2b$ bcrypt hashes;
        // strict verify only accepts PHP's $2y$ prefix and throws on login.
        'verify' => false,
    ],

    // Leave hashes untouched on login so the old Node app can still read them.
    'rehash_on_login' => false,

];

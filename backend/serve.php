<?php

// Dev server: same as `php artisan serve`, but with opcache on (~0.01s per request instead of ~0.13s)
// and without artisan serve's random ~0.35s stalls on Windows, which pile up when the shop and the
// back office are open together. Usage: `composer serve`, or `PORT=8123 composer serve`.
$port = getenv('PORT') ?: '8000';
$opcache = extension_loaded('Zend OPcache') ? '' : ' -d zend_extension=opcache';

chdir(__DIR__.'/public'); // Laravel's server.php treats the working directory as public/
passthru(
    escapeshellarg(PHP_BINARY).$opcache.' -d opcache.enable_cli=1 -S 127.0.0.1:'.$port.' '
    .escapeshellarg(__DIR__.'/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'),
    $exitCode
);
exit($exitCode);

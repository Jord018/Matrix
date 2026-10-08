<?php

use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // SPA (frontend/) authenticates with Sanctum session cookies.
        $middleware->statefulApi();
        $middleware->alias(['admin' => EnsureAdmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // JSON API only: never redirect to a login page.
        $exceptions->shouldRenderJsonWhen(fn () => true);
    })->create();

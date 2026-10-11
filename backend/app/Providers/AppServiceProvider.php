<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $flushCatalogCache = function (): void {
            Cache::flush();
        };

        Game::saved($flushCatalogCache);
        Game::deleted($flushCatalogCache);
        Category::saved($flushCatalogCache);
        Category::deleted($flushCatalogCache);
        CategorySetting::saved($flushCatalogCache);
        CategorySetting::deleted($flushCatalogCache);
        Highlight::saved($flushCatalogCache);
        Highlight::deleted($flushCatalogCache);
    }
}

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
    // Keep /image/... as plain public URLs.
    plugins: [vue({ template: { transformAssetUrls: { includeAbsolute: false } } }), tailwindcss()],
    // Same-origin in dev so Sanctum session cookies just work (no CORS).
    server: {
        proxy: {
            '/api': backend,
            '/sanctum': backend,
        },
    },
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{js,vue}'],
            exclude: ['src/main.js'],
        },
    },
});

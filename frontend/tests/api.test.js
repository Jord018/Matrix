import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, formatEndpoint, getBaseUrl } from '../src/api';

afterEach(() => {
    vi.unstubAllGlobals();
    delete window.__API_BASE_URL__;
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

describe('api() and helpers', () => {
    it('prefixes /api and returns JSON', async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ status: 'ok' }) });
        vi.stubGlobal('fetch', fetch);

        await expect(api('/health')).resolves.toEqual({ status: 'ok' });
        expect(fetch.mock.calls[0][0]).toBe('/api/health');
    });

    it('formats endpoints correctly without duplicates', () => {
        expect(formatEndpoint('https://api.example.com/test')).toBe('https://api.example.com/test');
        expect(formatEndpoint('/games', 'http://localhost:8000/api')).toBe('http://localhost:8000/api/games');
        expect(formatEndpoint('/api/games', 'http://localhost:8000/api')).toBe('http://localhost:8000/api/games');
        expect(formatEndpoint('/api', 'http://localhost:8000/api')).toBe('http://localhost:8000/api');
        expect(formatEndpoint('games', 'http://localhost:8000/api')).toBe('http://localhost:8000/api/games');
        expect(formatEndpoint('/games', '/api')).toBe('/api/games');
        expect(formatEndpoint('/api/games', '/api')).toBe('/api/games');
    });

    it('resolves base url under different environments', () => {
        expect(getBaseUrl({ MODE: 'production', VITE_API_BASE_URL: 'http://localhost:8000/api' })).toBe('http://localhost:8000/api');
        expect(getBaseUrl({ MODE: 'production' })).toBe('/api');
        expect(getBaseUrl({ MODE: 'test' })).toBe('/api');
    });

    it('supports configured base URL via window override', async () => {
        window.__API_BASE_URL__ = 'http://localhost:8000/api';
        expect(getBaseUrl()).toBe('http://localhost:8000/api');

        const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true }) });
        vi.stubGlobal('fetch', fetch);

        await expect(api('/orders')).resolves.toEqual({ success: true });
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8000/api/orders');
    });

    it('fetches csrf cookie on non-GET when XSRF-TOKEN is missing and appends token', async () => {
        document.cookie = 'other_cookie=123; path=/';
        const fetch = vi
            .fn()
            .mockImplementationOnce(() => {
                document.cookie = 'XSRF-TOKEN=test-token; path=/';
                return Promise.resolve({ ok: true, status: 204 });
            })
            .mockImplementationOnce(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 1 }) }));
        vi.stubGlobal('fetch', fetch);

        await expect(api('/orders', { method: 'POST', body: '{}' })).resolves.toEqual({ id: 1 });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch.mock.calls[0][0]).toBe('/sanctum/csrf-cookie');
        expect(fetch.mock.calls[1][1].headers['X-XSRF-TOKEN']).toBe('test-token');
    });

    it('uses full sanctum url when base URL is absolute', async () => {
        window.__API_BASE_URL__ = 'http://localhost:8000/api';
        const fetch = vi
            .fn()
            .mockImplementationOnce(() => Promise.resolve({ ok: true, status: 204 }))
            .mockImplementationOnce(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 2 }) }));
        vi.stubGlobal('fetch', fetch);

        await expect(api('/orders', { method: 'POST' })).resolves.toEqual({ id: 2 });
        expect(fetch.mock.calls[0][0]).toBe('http://localhost:8000/sanctum/csrf-cookie');
    });

    it('returns null on 204 No Content', async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });
        vi.stubGlobal('fetch', fetch);

        await expect(api('/item', { method: 'DELETE' })).resolves.toBeNull();
    });

    it('throws on non-2xx with parsed error data', async () => {
        const errorData = { message: 'Not found' };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve(errorData) }));

        const err = await api('/missing').catch((e) => e);
        expect(err.message).toBe('API 404: /missing');
        expect(err.status).toBe(404);
        expect(err.data).toEqual(errorData);
    });

    it('throws on non-2xx when json parsing fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.reject(new Error('fail')) }));

        const err = await api('/server-error').catch((e) => e);
        expect(err.message).toBe('API 500: /server-error');
        expect(err.status).toBe(500);
        expect(err.data).toBeNull();
    });
});

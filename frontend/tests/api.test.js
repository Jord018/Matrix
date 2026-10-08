import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';

afterEach(() => vi.unstubAllGlobals());

describe('api()', () => {
    it('prefixes /api and returns JSON', async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });
        vi.stubGlobal('fetch', fetch);

        await expect(api('/health')).resolves.toEqual({ status: 'ok' });
        expect(fetch.mock.calls[0][0]).toBe('/api/health');
    });

    it('throws on non-2xx', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

        await expect(api('/health')).rejects.toThrow('API 500');
    });
});

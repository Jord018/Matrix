import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import router, { adminGuard, routes } from '../src/router';
import { auth, loadUser } from '../src/auth';

describe('Router & Route Loaders', () => {
    beforeEach(() => {
        auth.user = null;
        auth.loaded = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads all lazy route components', async () => {
        for (const route of routes) {
            if (typeof route.component === 'function') {
                const mod = await route.component();
                expect(mod).toBeDefined();
            }
            if (route.children) {
                for (const child of route.children) {
                    if (typeof child.component === 'function') {
                        const childMod = await child.component();
                        expect(childMod).toBeDefined();
                    }
                }
            }
        }
    });

    it('allows public routes through adminGuard', async () => {
        const result = await adminGuard({ meta: {}, fullPath: '/' });
        expect(result).toBe(true);
    });

    it('redirects unauthenticated users from auth routes', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            json: () => Promise.resolve({}),
        }));
        const result = await adminGuard({ meta: { auth: true }, fullPath: '/cart' });
        expect(result).toEqual({ path: '/login', query: { redirect: '/cart' } });
    });

    it('allows authenticated users to auth routes', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ Role: 'customer' }),
        }));
        const result = await adminGuard({ meta: { auth: true }, fullPath: '/cart' });
        expect(result).toBe(true);
    });

    it('allows admin users to admin routes', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ Role: 'admin' }),
        }));
        const result = await adminGuard({ meta: { admin: true }, fullPath: '/admin/back-game' });
        expect(result).toBe(true);
    });

    it('redirects non-admin users from admin routes', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ Role: 'customer' }),
        }));
        const result = await adminGuard({ meta: { admin: true }, fullPath: '/admin/back-game' });
        expect(result).toEqual({ path: '/login', query: { redirect: '/admin/back-game' } });
    });

    it('has router instance defined with before hooks', () => {
        expect(router).toBeDefined();
        expect(router.getRoutes().length).toBeGreaterThan(0);
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import Login from '../src/pages/Login.vue';
import { adminGuard, routes } from '../src/router';
import { auth, loadUser, login, logout } from '../src/auth';

const reply = (status, body = {}) => ({ ok: status < 400, status, json: () => Promise.resolve(body) });
const stubFetch = (...responses) => {
    const f = vi.fn();
    responses.forEach((r) => f.mockResolvedValueOnce(r));
    vi.stubGlobal('fetch', f);
    return f;
};

beforeEach(() => {
    auth.user = null;
    auth.loaded = false;
    document.cookie = 'XSRF-TOKEN=tok%3D; path=/';
});
afterEach(() => vi.unstubAllGlobals());

describe('auth state', () => {
    it('loadUser stores the user once', async () => {
        const f = stubFetch(reply(200, { Role: 'admin' }));
        await loadUser();
        await loadUser();
        expect(auth.user.Role).toBe('admin');
        expect(f).toHaveBeenCalledTimes(1);
    });

    it('loadUser leaves user null on 401', async () => {
        stubFetch(reply(401));
        await loadUser();
        expect(auth.user).toBeNull();
        expect(auth.loaded).toBe(true);
    });

    it('login posts with the CSRF header, logout clears user', async () => {
        const f = stubFetch(reply(200, { Role: 'customer' }), reply(200));
        await login('a', 'b');
        expect(f.mock.calls[0][1].headers['X-XSRF-TOKEN']).toBe('tok=');
        expect(auth.user.Role).toBe('customer');
        await logout();
        expect(auth.user).toBeNull();
    });

    it('fetches the CSRF cookie first when it is missing', async () => {
        document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        const f = stubFetch(reply(204), reply(200, {}));
        await login('a', 'b');
        expect(f.mock.calls[0][0]).toBe('/sanctum/csrf-cookie');
        expect(f.mock.calls[1][1].headers['X-XSRF-TOKEN']).toBeUndefined();
    });
});

describe('admin route guard', () => {
    const to = (admin) => ({ meta: { admin }, fullPath: '/admin/back-game' });

    it('lets non-admin routes through', async () => {
        expect(await adminGuard(to(false))).toBe(true);
    });

    it('redirects guests to /login with the target', async () => {
        stubFetch(reply(401));
        expect(await adminGuard(to(true))).toEqual({ path: '/login', query: { redirect: '/admin/back-game' } });
    });

    it('redirects customers', async () => {
        stubFetch(reply(200, { Role: 'customer' }));
        expect((await adminGuard(to(true))).path).toBe('/login');
    });

    it('allows admins', async () => {
        stubFetch(reply(200, { Role: 'admin' }));
        expect(await adminGuard(to(true))).toBe(true);
    });

    it('marks the admin route', () => {
        expect(routes.find((r) => r.path === '/admin').meta.admin).toBe(true);
    });
});

describe('Login.vue', () => {
    const blank = { template: '<div/>' };
    const setup = async (query = '') => {
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', component: blank },
                { path: '/login', component: Login },
                { path: '/admin/back-game', component: blank },
                { path: '/somewhere', component: blank },
            ],
        });
        router.push('/login' + query);
        await router.isReady();
        const w = mount(Login, { global: { plugins: [router] } });
        await w.find('#username').setValue('u');
        await w.find('#password').setValue('p');
        return { w, router };
    };
    const submit = async (w) => {
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
    };

    it('sends admins to the back office', async () => {
        stubFetch(reply(200, { Role: 'admin' }));
        const { w, router } = await setup();
        await submit(w);
        expect(router.currentRoute.value.path).toBe('/admin/back-game');
    });

    it('sends customers home', async () => {
        stubFetch(reply(200, { Role: 'customer' }));
        const { w, router } = await setup();
        await submit(w);
        expect(router.currentRoute.value.path).toBe('/');
    });

    it('honours ?redirect=', async () => {
        stubFetch(reply(200, { Role: 'customer' }));
        const { w, router } = await setup('?redirect=/somewhere');
        await submit(w);
        expect(router.currentRoute.value.path).toBe('/somewhere');
    });

    it('shows an error for bad credentials', async () => {
        stubFetch(reply(401));
        const { w } = await setup();
        await submit(w);
        expect(w.find('[role=alert]').text()).toContain('Invalid');
    });

    it('shows a generic error otherwise', async () => {
        stubFetch(reply(500));
        const { w } = await setup();
        await submit(w);
        expect(w.find('[role=alert]').text()).toContain('try again');
    });
});

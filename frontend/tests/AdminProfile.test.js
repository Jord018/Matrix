import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminProfile from '../src/pages/AdminProfile.vue';
import { adminGuard, routes } from '../src/router';
import { auth } from '../src/auth';

document.cookie = 'XSRF-TOKEN=t; path=/';
const blank = { template: '<div/>' };

beforeEach(() => {
    auth.user = { Username: 'jerry', Role: 'admin' };
    auth.loaded = true;
});
afterEach(() => vi.unstubAllGlobals());

describe('AdminProfile', () => {
    const setup = async () => {
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/admin/back-profile', component: AdminProfile }, { path: '/login', component: blank }],
        });
        router.push('/admin/back-profile');
        await router.isReady();
        return { router, w: mount(AdminProfile, { global: { plugins: [router] } }) };
    };

    it('shows the signed-in admin', async () => {
        const { w } = await setup();
        expect(w.get('[data-test=name]').text()).toBe('jerry');
        expect(w.get('[data-test=role]').text()).toBe('ADMIN');
        expect(w.text()).toContain('Back-Office Full');
    });

    it('logout clears the user and goes to /login', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
        const { w, router } = await setup();
        await w.find('button').trigger('click');
        await flushPromises();
        expect(auth.user).toBeNull();
        expect(router.currentRoute.value.path).toBe('/login');
    });

    it('renders blanks if the user is missing', async () => {
        auth.user = null;
        const { w } = await setup();
        expect(w.get('[data-test=role]').text()).toBe('');
    });
});

describe('profile route', () => {
    const profile = routes.find((r) => r.path === '/admin').children.find((c) => c.path === 'back-profile');

    it('is registered under the admin guard', async () => {
        expect(profile).toBeDefined();
        const admin = routes.find((r) => r.path === '/admin');
        auth.user = { Role: 'customer' };
        expect(await adminGuard({ meta: admin.meta, fullPath: '/admin/back-profile' })).toEqual({
            path: '/login',
            query: { redirect: '/admin/back-profile' },
        });
    });
});

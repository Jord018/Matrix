import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminLayout from '../src/components/AdminLayout.vue';
import App from '../src/App.vue';
import { routes } from '../src/router';

const blank = { template: '<div data-test="page"/>' };
const makeRouter = () =>
    createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: blank },
            {
                path: '/admin',
                component: AdminLayout,
                meta: { admin: true },
                children: [{ path: 'back-game', component: blank }, { path: 'back-category', component: blank }],
            },
        ],
    });

const mountAt = async (path, component = { template: '<RouterView />' }) => {
    const router = makeRouter();
    router.push(path);
    await router.isReady();
    return { router, w: mount(component, { global: { plugins: [router] } }) };
};

describe('AdminLayout', () => {
    it('shows every back-office menu item', async () => {
        const { w } = await mountAt('/admin/back-game');
        for (const label of ['Game', 'Category', 'Highlight', 'Sale History']) expect(w.text()).toContain(label);
        expect(w.find('a[aria-label=Profile]').attributes('href')).toBe('/admin/back-profile');
    });

    it('marks the current page link active', async () => {
        const { w } = await mountAt('/admin/back-category');
        const active = w.findAll('a').filter((a) => a.classes().includes('font-bold') && a.text() === 'Category');
        expect(active).toHaveLength(1);
    });

    it('search goes to the game list with ?search=', async () => {
        const { w, router } = await mountAt('/admin/back-category');
        await w.find('input[type=search]').setValue('  zelda ');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(router.currentRoute.value.fullPath).toBe('/admin/back-game?search=zelda');
    });

    it('empty search clears the query', async () => {
        const { w, router } = await mountAt('/admin/back-game?search=x');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(router.currentRoute.value.fullPath).toBe('/admin/back-game');
    });

    it('toggles the mobile menu', async () => {
        const { w } = await mountAt('/admin/back-game');
        const panel = () => w.find('form').element.parentElement;
        expect(panel().className).toContain('hidden');
        await w.find('button[aria-label="Toggle navigation"]').trigger('click');
        expect(panel().className).toContain('flex ');
    });
});

describe('App shell', () => {
    it('hides the store navbar on admin pages only', async () => {
        const stub = { global: { stubs: { Navbar: { template: '<nav data-test="store-nav"/>' } } } };
        const router = makeRouter();
        router.push('/');
        await router.isReady();
        const w = mount(App, { global: { ...stub.global, plugins: [router] } });
        expect(w.find('[data-test=store-nav]').exists()).toBe(true);
        await router.push('/admin/back-game');
        await flushPromises();
        expect(w.find('[data-test=store-nav]').exists()).toBe(false);
    });

    it('real routes register the admin layout with children', () => {
        const admin = routes.find((r) => r.path === '/admin');
        expect(admin.children.map((c) => c.path)).toContain('back-game');
    });
});

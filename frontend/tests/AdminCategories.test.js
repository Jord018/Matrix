import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminCategories from '../src/pages/AdminCategories.vue';
import AdminCategoryGames from '../src/pages/AdminCategoryGames.vue';

document.cookie = 'XSRF-TOKEN=t; path=/';
const json = (body, ok = true, status = 200) => ({ ok, status, json: () => Promise.resolve(body) });
const CATS = () => [
    { id: 'c1', name: 'RPG', isVisible: true },
    { id: 'c2', name: 'Action', isVisible: false },
];
const stub = (...bodies) => {
    const f = vi.fn();
    bodies.forEach((b) => f.mockResolvedValueOnce(b));
    vi.stubGlobal('fetch', f);
    return f;
};
const mountAt = async (component, path, routePath) => {
    const blank = { template: '<div/>' };
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: routePath, component }, { path: '/admin/edit-game/:id', component: blank }, { path: '/admin/back-category/:name', component: blank }],
    });
    router.push(path);
    await router.isReady();
    return mount(component, { global: { plugins: [router] } });
};
const page = async (...bodies) => {
    const f = stub(json(CATS()), ...bodies);
    const w = await mountAt(AdminCategories, '/admin/back-category', '/admin/back-category');
    await flushPromises();
    return { w, f };
};

afterEach(() => vi.unstubAllGlobals());

describe('AdminCategories', () => {
    it('lists categories with view links and visibility icons', async () => {
        const { w } = await page();
        const rows = w.findAll('[data-test=cat-row]');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('RPG');
        expect(rows[0].find('a').attributes('href')).toBe('/admin/back-category/RPG');
        expect(rows[0].find('[data-test=eye]').text()).toBe('👁');
        expect(rows[1].find('[data-test=eye]').text()).toBe('🚫');
        expect(w.findAll('[data-test=cat-card]')).toHaveLength(2);
    });

    it('toggles visibility optimistically and persists it', async () => {
        const { w, f } = await page(json({}));
        await w.find('[data-test=eye]').trigger('click');
        expect(w.find('[data-test=eye]').text()).toBe('🚫');
        await flushPromises();
        expect(f.mock.calls[1][0]).toBe('/api/admin/categories/c1/visibility');
        expect(f.mock.calls[1][1].method).toBe('PATCH');
        expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ isVisible: false });
    });

    it('rolls back and alerts when saving visibility fails', async () => {
        const alert = vi.fn();
        vi.stubGlobal('alert', alert);
        const { w } = await page(json({}, false, 500));
        await w.find('[data-test=eye]').trigger('click');
        await flushPromises();
        expect(w.find('[data-test=eye]').text()).toBe('👁');
        expect(alert).toHaveBeenCalled();
    });

    it('adds a category through the modal and reloads', async () => {
        const { w, f } = await page(json({ id: 'c3' }, true, 201), json([...CATS(), { id: 'c3', name: 'Indie', isVisible: true }]));
        await w.find('button[aria-label="Add category"]').trigger('click');
        expect(w.find('[role=dialog]').text()).toContain('Add New Category');
        await w.find('#cat-name').setValue('Indie');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(f.mock.calls[1][1].method).toBe('POST');
        expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ name: 'Indie' });
        expect(w.find('[role=dialog]').exists()).toBe(false);
        expect(w.findAll('[data-test=cat-row]')).toHaveLength(3);
    });

    it('renames through the edit modal', async () => {
        const { w, f } = await page(json({}), json(CATS()));
        await w.findAll('button').find((b) => b.text() === 'Edit').trigger('click');
        expect(w.find('[role=dialog]').text()).toContain('Current Name: RPG');
        expect(w.find('#cat-name').element.value).toBe('RPG');
        await w.find('#cat-name').setValue('Role Playing');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(f.mock.calls[1][0]).toBe('/api/admin/categories/c1');
        expect(f.mock.calls[1][1].method).toBe('PUT');
    });

    it('shows the server error and keeps the modal open', async () => {
        const { w } = await page(json({ errors: { name: ['The name has already been taken.'] } }, false, 422));
        await w.find('button[aria-label="Add category"]').trigger('click');
        await w.find('#cat-name').setValue('RPG');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[role=alert]').text()).toContain('already been taken');
        await w.findAll('[role=dialog] button').at(0).trigger('click');
        expect(w.find('[role=dialog]').exists()).toBe(false);
    });

    it('falls back to the generic error message', async () => {
        const { w } = await page(json(null, false, 500));
        await w.find('button[aria-label="Add category"]').trigger('click');
        await w.find('#cat-name').setValue('X');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[role=alert]').text()).toContain('API 500');
    });

    it('deletes after confirmation only', async () => {
        const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
        vi.stubGlobal('confirm', confirm);
        const { w, f } = await page(json({}));
        const del = () => w.findAll('button').find((b) => b.text() === 'Delete');
        await del().trigger('click');
        expect(f).toHaveBeenCalledTimes(1);
        await del().trigger('click');
        await flushPromises();
        expect(f.mock.calls[1][0]).toBe('/api/admin/categories/c1');
        expect(f.mock.calls[1][1].method).toBe('DELETE');
        expect(w.findAll('[data-test=cat-row]')).toHaveLength(1);
    });
});

describe('AdminCategoryGames', () => {
    const GAMES = [{ id: 'g1', name: 'Zelda', price: 10, stock: 2, coverImage: 'http://x/z.png' }];
    const view = async (name, ...bodies) => {
        const f = stub(...bodies);
        const w = await mountAt(AdminCategoryGames, `/admin/back-category/${name}`, '/admin/back-category/:name');
        await flushPromises();
        return { w, f };
    };

    it('resolves the category by name and lists its games', async () => {
        const { w, f } = await view('RPG', json(CATS()), json(GAMES));
        expect(f.mock.calls[1][0]).toBe('/api/admin/categories/c1/games');
        expect(w.find('h1').text()).toBe('Category: RPG');
        expect(w.find('[data-test=game]').text()).toContain('Zelda');
        expect(w.find('a[href="/admin/edit-game/g1"]').exists()).toBe(true);
    });

    it('shows an empty state for an unknown category', async () => {
        const { w } = await view('Nope', json(CATS()));
        expect(w.find('[data-test=empty]').exists()).toBe(true);
    });

    it('deletes a game from the category', async () => {
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
        const { w, f } = await view('RPG', json(CATS()), json(GAMES), json({}));
        await w.find('button').trigger('click');
        await flushPromises();
        expect(f.mock.calls[2][0]).toBe('/api/admin/games/g1');
        expect(w.find('[data-test=empty]').exists()).toBe(true);
    });

    it('keeps the game when delete is cancelled', async () => {
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
        const { w, f } = await view('RPG', json(CATS()), json(GAMES));
        await w.find('button').trigger('click');
        expect(f).toHaveBeenCalledTimes(2);
        expect(w.findAll('[data-test=game]')).toHaveLength(1);
    });
});

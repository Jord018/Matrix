import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminGames from '../src/pages/AdminGames.vue';

const GAMES = [
    { id: '1', name: 'Zelda', price: 10, stock: 3, coverImage: 'http://x/z.png' },
    { id: '2', name: 'Mario', price: 20, stock: 0, coverImage: 'http://x/m.png' },
];
const json = (body) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });

document.cookie = 'XSRF-TOKEN=t; path=/';

const setup = async (url = '/admin/back-game', responses = [GAMES]) => {
    const fetch = vi.fn();
    responses.forEach((r) => fetch.mockResolvedValueOnce(json(r)));
    vi.stubGlobal('fetch', fetch);
    const blank = { template: '<div/>' };
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/admin/back-game', component: AdminGames },
            { path: '/admin/add-game', component: blank },
            { path: '/admin/edit-game/:id', component: blank },
        ],
    });
    router.push(url);
    await router.isReady();
    const w = mount(AdminGames, { global: { plugins: [router] } });
    await flushPromises();
    return { w, router, fetch };
};

afterEach(() => vi.unstubAllGlobals());

describe('AdminGames', () => {
    it('lists games as table rows and mobile cards', async () => {
        const { w, fetch } = await setup();
        expect(fetch.mock.calls[0][0]).toBe('/api/admin/games');
        expect(w.findAll('[data-test=game-row]')).toHaveLength(2);
        expect(w.findAll('[data-test=game-card]')).toHaveLength(2);
        expect(w.find('[data-test=game-row]').text()).toContain('10 baht');
        expect(w.find('a[href="/admin/edit-game/1"]').exists()).toBe(true);
        expect(w.find('a[aria-label="Add game"]').attributes('href')).toBe('/admin/add-game');
        expect(w.find('[data-test=search-banner]').exists()).toBe(false);
    });

    it('sends the search term and shows the banner', async () => {
        const { w, fetch } = await setup('/admin/back-game?search=zel%20da', [[GAMES[0]]]);
        expect(fetch.mock.calls[0][0]).toBe('/api/admin/games?search=zel%20da');
        expect(w.find('[data-test=search-banner]').text()).toContain('zel da');
        expect(w.find('a[href="/admin/back-game"]').text()).toBe('Clear Search');
    });

    it('alerts and clears the search when nothing is found', async () => {
        const alert = vi.fn();
        vi.stubGlobal('alert', alert);
        const { router } = await setup('/admin/back-game?search=ghost', [[], GAMES]);
        expect(alert).toHaveBeenCalledWith('Not found: "ghost"');
        expect(router.currentRoute.value.fullPath).toBe('/admin/back-game');
    });

    it('deletes after confirmation', async () => {
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
        const { w, fetch } = await setup();
        fetch.mockResolvedValueOnce(json({ message: 'Deleted.' }));
        await w.find('[data-test=game-row] button').trigger('click');
        await flushPromises();
        expect(fetch.mock.calls[1][0]).toBe('/api/admin/games/1');
        expect(fetch.mock.calls[1][1].method).toBe('DELETE');
        expect(w.findAll('[data-test=game-row]')).toHaveLength(1);
        expect(w.text()).not.toContain('Zelda');
    });

    it('does nothing when delete is cancelled', async () => {
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
        const { w, fetch } = await setup();
        await w.find('[data-test=game-row] button').trigger('click');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(w.findAll('[data-test=game-row]')).toHaveLength(2);
    });
});

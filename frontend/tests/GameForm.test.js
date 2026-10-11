import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import GameForm from '../src/components/GameForm.vue';
import AdminAddGame from '../src/pages/AdminAddGame.vue';
import AdminEditGame from '../src/pages/AdminEditGame.vue';
import { formatRequirements, parseRequirements } from '../src/requirements';

document.cookie = 'XSRF-TOKEN=t; path=/';
const json = (body, ok = true, status = 200) => ({ ok, status, json: () => Promise.resolve(body) });
const CATS = [{ name: 'RPG' }, { name: 'Action' }];
const GAME = {
    id: 'g1', name: 'Zelda', price: 10, stock: 3, coverImage: 'http://x/c.png',
    screenshots: ['http://x/1.png'], categories: ['RPG'], description: 'desc',
    systemRequirements: { os: 'Win', processor: 'i5' },
};

const router = () => {
    const blank = { template: '<div/>' };
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/admin/back-game', component: blank },
            { path: '/admin/add-game', component: blank },
            { path: '/admin/edit-game/:id', component: blank },
        ],
    });
};
const stub = (...bodies) => {
    const f = vi.fn();
    bodies.forEach((b) => f.mockResolvedValueOnce(b));
    vi.stubGlobal('fetch', f);
    return f;
};
const body = (f, i) => JSON.parse(f.mock.calls[i][1].body);

afterEach(() => vi.unstubAllGlobals());

describe('requirements helpers', () => {
    it('round-trips the 5 labelled lines', () => {
        expect(parseRequirements('OS: Win\nprocessor:i5\nMemory: 8\nGraphics: gtx\nStorage: 10')).toEqual({
            os: 'Win', processor: 'i5', memory: '8', graphics: 'gtx', storage: '10',
        });
        expect(formatRequirements({ os: 'Win' })).toBe('OS: Win\nProcessor: -\nMemory: -\nGraphics: -\nStorage: -');
    });

    it('skips empty values and tolerates missing input', () => {
        expect(parseRequirements('OS: \nProcessor: i5')).toEqual({ processor: 'i5' });
        expect(parseRequirements(undefined)).toEqual({});
        expect(formatRequirements(null)).toContain('OS: -');
    });
});

describe('GameForm', () => {
    const mountForm = async (game = null, save = vi.fn().mockResolvedValue()) => {
        stub(json(CATS));
        const r = router();
        const w = mount(GameForm, { props: { game, save }, global: { plugins: [r] } });
        await flushPromises();
        return { w, save };
    };

    it('submits the entered values', async () => {
        const { w, save } = await mountForm();
        await w.find('#name').setValue('New');
        await w.find('#price').setValue('5.5');
        await w.find('#stock').setValue('2');
        await w.find('#description').setValue('d');
        await w.find('#require').setValue('OS: Win\nProcessor: i5');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(save).toHaveBeenCalledWith({
            name: 'New', price: 5.5, stock: 2, coverImage: null, screenshots: [], categories: [],
            description: 'd', systemRequirements: { os: 'Win', processor: 'i5' },
        });
    });

    it('fills fields from an existing game', async () => {
        const { w } = await mountForm(GAME);
        expect(w.find('#name').element.value).toBe('Zelda');
        expect(w.find('img[alt="Main Image"]').attributes('src')).toBe('http://x/c.png');
        expect(w.findAll('img[alt=Screenshot]')).toHaveLength(1);
        expect(w.find('[data-test=tag]').text()).toContain('RPG');
        expect(w.find('#require').element.value).toContain('Processor: i5');
    });

    it('sets and removes cover and screenshots through the URL modal', async () => {
        const { w } = await mountForm();
        await w.find('button[aria-label="Add cover"]').trigger('click');
        await w.find('input[aria-label="Image URL"]').setValue('http://x/new.png');
        await w.findAll('[role=dialog] button').at(1).trigger('click');
        expect(w.find('img[alt="Main Image"]').attributes('src')).toBe('http://x/new.png');
        await w.find('button[aria-label="Remove cover"]').trigger('click');
        expect(w.find('img[alt="Main Image"]').exists()).toBe(false);

        await w.find('button[aria-label="Add screenshot 2"]').trigger('click');
        await w.find('input[aria-label="Image URL"]').setValue('http://x/s.png');
        await w.findAll('[role=dialog] button').at(1).trigger('click');
        expect(w.findAll('[data-test=slot]')[2].find('img').exists()).toBe(true);
        await w.find('button[aria-label="Remove screenshot 2"]').trigger('click');
        expect(w.find('img[alt=Screenshot]').exists()).toBe(false);
    });

    it('rejects an empty URL and can cancel the modal', async () => {
        const alert = vi.fn();
        vi.stubGlobal('alert', alert);
        const { w } = await mountForm();
        await w.find('button[aria-label="Add cover"]').trigger('click');
        await w.findAll('[role=dialog] button').at(1).trigger('click');
        expect(alert).toHaveBeenCalledWith('Please enter a valid URL');
        await w.findAll('[role=dialog] button').at(0).trigger('click');
        expect(w.find('[role=dialog]').exists()).toBe(false);
    });

    it('adds categories once and removes them', async () => {
        const alert = vi.fn();
        vi.stubGlobal('alert', alert);
        const { w } = await mountForm();
        const add = async (v) => {
            await w.find('select').setValue(v);
            await w.findAll('button').filter((b) => b.text() === '+').at(-1).trigger('click');
        };
        await add('');
        expect(w.findAll('[data-test=tag]')).toHaveLength(0);
        await add('RPG');
        await add('RPG');
        expect(alert).toHaveBeenCalledWith('This category has already been added');
        expect(w.findAll('[data-test=tag]')).toHaveLength(1);
        await w.find('button[aria-label="Remove RPG"]').trigger('click');
        expect(w.findAll('[data-test=tag]')).toHaveLength(0);
    });

    it('shows server validation errors', async () => {
        const err = Object.assign(new Error('x'), { data: { errors: { price: ['The price must be at least 0.'] } } });
        const { w } = await mountForm(null, vi.fn().mockRejectedValue(err));
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[data-test=errors]').text()).toContain('at least 0');
    });

    it('falls back to the error message', async () => {
        const { w } = await mountForm(null, vi.fn().mockRejectedValue(new Error('API 500')));
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[data-test=errors]').text()).toContain('API 500');
    });
});

describe('Add / Edit pages', () => {
    it('add page POSTs then returns to the list', async () => {
        const f = stub(json(CATS), json({ id: 'n' }, true, 201));
        const r = router();
        r.push('/admin/add-game');
        await r.isReady();
        const w = mount(AdminAddGame, { global: { plugins: [r] } });
        await flushPromises();
        await w.find('#name').setValue('N');
        await w.find('#price').setValue('1');
        await w.find('#stock').setValue('1');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(f.mock.calls[1][0]).toBe('/api/admin/games');
        expect(f.mock.calls[1][1].method).toBe('POST');
        expect(body(f, 1).name).toBe('N');
        expect(r.currentRoute.value.path).toBe('/admin/back-game');
    });

    it('edit page loads the game and PUTs the change', async () => {
        const f = stub(json(GAME), json(CATS), json(GAME));
        const r = router();
        r.push('/admin/edit-game/g1');
        await r.isReady();
        const w = mount(AdminEditGame, { global: { plugins: [r] } });
        await flushPromises();
        expect(f.mock.calls[0][0]).toBe('/api/admin/games/g1');
        await w.find('#name').setValue('Zelda 2');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(f.mock.calls[2][0]).toBe('/api/admin/games/g1');
        expect(f.mock.calls[2][1].method).toBe('PUT');
        expect(body(f, 2)).toMatchObject({ name: 'Zelda 2', categories: ['RPG'], screenshots: ['http://x/1.png'] });
        expect(r.currentRoute.value.path).toBe('/admin/back-game');
    });

    it('edit page shows not-found for an unknown game', async () => {
        stub(json({}, false, 404));
        const r = router();
        r.push('/admin/edit-game/nope');
        await r.isReady();
        const w = mount(AdminEditGame, { global: { plugins: [r] } });
        await flushPromises();
        expect(w.find('[role=alert]').text()).toBe('Game not found');
    });
});

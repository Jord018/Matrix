import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import AdminHighlights from '../src/pages/AdminHighlights.vue';

document.cookie = 'XSRF-TOKEN=t; path=/';
const json = (body, ok = true, status = 200) => ({ ok, status, json: () => Promise.resolve(body) });
const DATA = () => ({
    highlights: [{ id: 'h1', name: 'Zelda', customImage: 'http://x/b.png', buttonColor: '#ff0000' }],
    games: [{ id: 'g1', name: 'Zelda' }, { id: 'g2', name: 'Mario' }],
});
const page = async (...bodies) => {
    const f = vi.fn();
    [json(DATA()), ...bodies].forEach((b) => f.mockResolvedValueOnce(b));
    vi.stubGlobal('fetch', f);
    const w = mount(AdminHighlights);
    await flushPromises();
    return { w, f };
};

afterEach(() => vi.unstubAllGlobals());

describe('AdminHighlights', () => {
    it('lists highlights with colour swatch', async () => {
        const { w } = await page();
        expect(w.findAll('[data-test=hl-row]')).toHaveLength(1);
        expect(w.find('[data-test=hl-row]').text()).toContain('#ff0000');
        expect(w.find('[data-test=hl-row] span').attributes('style')).toContain('background-color');
        expect(w.findAll('[data-test=hl-card]')).toHaveLength(1);
        expect(w.find('[data-test=empty]').exists()).toBe(false);
    });

    it('shows the empty state', async () => {
        const f = vi.fn().mockResolvedValueOnce(json({ highlights: [], games: [] }));
        vi.stubGlobal('fetch', f);
        const w = mount(AdminHighlights);
        await flushPromises();
        expect(w.find('[data-test=empty]').text()).toBe('No Highlights Active');
    });

    it('creates a highlight and reloads', async () => {
        const { w, f } = await page(json({ id: 'h2' }, true, 201), json({ ...DATA(), highlights: [] }));
        await w.find('button[aria-label="Add highlight"]').trigger('click');
        expect(w.findAll('#hl-game option')).toHaveLength(3);
        await w.find('#hl-game').setValue('g2');
        await w.find('#hl-color').setValue('#00ff00');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(f.mock.calls[1][1].method).toBe('POST');
        expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ gameId: 'g2', customImage: null, buttonColor: '#00ff00' });
        expect(w.find('[role=dialog]').exists()).toBe(false);
        expect(w.find('[data-test=empty]').exists()).toBe(true);
    });

    it('sends a custom banner URL when given', async () => {
        const { w, f } = await page(json({}, true, 201), json(DATA()));
        await w.find('button[aria-label="Add highlight"]').trigger('click');
        await w.find('#hl-game').setValue('g1');
        await w.find('#hl-image').setValue('http://x/banner.png');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(JSON.parse(f.mock.calls[1][1].body).customImage).toBe('http://x/banner.png');
    });

    it('shows validation errors and can cancel', async () => {
        const { w } = await page(json({ errors: { customImage: ['The custom image must be a valid URL.'] } }, false, 422));
        await w.find('button[aria-label="Add highlight"]').trigger('click');
        await w.find('#hl-game').setValue('g1');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[role=alert]').text()).toContain('valid URL');
        await w.findAll('[role=dialog] button').at(0).trigger('click');
        expect(w.find('[role=dialog]').exists()).toBe(false);
    });

    it('falls back to the generic message', async () => {
        const { w } = await page(json(null, false, 500));
        await w.find('button[aria-label="Add highlight"]').trigger('click');
        await w.find('#hl-game').setValue('g1');
        await w.find('form').trigger('submit.prevent');
        await flushPromises();
        expect(w.find('[role=alert]').text()).toContain('API 500');
    });

    it('deletes after confirmation only', async () => {
        const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
        vi.stubGlobal('confirm', confirm);
        const { w, f } = await page(json({}));
        const del = () => w.find('[data-test=hl-row] button');
        await del().trigger('click');
        expect(f).toHaveBeenCalledTimes(1);
        await del().trigger('click');
        await flushPromises();
        expect(f.mock.calls[1][0]).toBe('/api/admin/highlights/h1');
        expect(f.mock.calls[1][1].method).toBe('DELETE');
        expect(w.find('[data-test=empty]').exists()).toBe(true);
    });
});

import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Home from '../src/pages/Home.vue';

afterEach(() => vi.unstubAllGlobals());

it('shows API status from /api/health', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: 'ok' }) }));
    const wrapper = mount(Home);
    await flushPromises();
    expect(wrapper.get('[data-test="api-status"]').text()).toBe('ok');
});

it('shows offline when API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const wrapper = mount(Home);
    await flushPromises();
    expect(wrapper.get('[data-test="api-status"]').text()).toBe('offline');
});

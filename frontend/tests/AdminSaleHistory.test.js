import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import AdminSaleHistory from '../src/pages/AdminSaleHistory.vue';

const ORDERS = [
    {
        id: 'o1', userId: '123456789abcdef', username: 'jerry', status: 'completed', purchaseDate: '2026-02-01T10:30:00Z',
        items: [{ gameName: 'Zelda', keys: ['A', 'B'] }, { gameName: 'Mario' }],
    },
    { id: 'o2', userId: null, username: 'tom', status: 'pending', purchaseDate: '2026-01-01T09:00:00Z', items: [] },
];
const page = async (orders) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(orders) }));
    const w = mount(AdminSaleHistory);
    await flushPromises();
    return w;
};

afterEach(() => vi.unstubAllGlobals());

describe('AdminSaleHistory', () => {
    it('renders orders with customer, quantities and status', async () => {
        const w = await page(ORDERS);
        const rows = w.findAll('[data-test=order-row]');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('jerry');
        expect(rows[0].text()).toContain('ID: 12345678...');
        expect(rows[0].text()).toContain('Zelda (x2)');
        expect(rows[0].text()).toContain('Mario (x1)');
        expect(rows[0].text()).toMatch(/Feb 2026/);
        expect(rows[0].text()).toContain('Completed');
        expect(rows[1].text()).toContain('pending');
        expect(rows[1].text()).toContain('ID: ...');
    });

    it('colours the status badge', async () => {
        const w = await page(ORDERS);
        const badges = w.findAll('[data-test=order-row] td:last-child span');
        expect(badges[0].classes()).toContain('bg-green-600');
        expect(badges[1].classes()).toContain('bg-yellow-400');
    });

    it('renders mobile cards too', async () => {
        const w = await page(ORDERS);
        const cards = w.findAll('[data-test=order-card]');
        expect(cards).toHaveLength(2);
        expect(cards[0].text()).toContain('Quantity: 2');
    });

    it('shows the empty state', async () => {
        const w = await page([]);
        expect(w.find('[data-test=empty]').text()).toBe('No sales history found.');
    });
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Purchase from '../src/pages/Purchase.vue'
import { useCartStore } from '../src/stores/cart'
import * as apiModule from '../src/api'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/checkout', component: Purchase },
        { path: '/success', component: { template: '<div>Success</div>' } }
    ]
})

describe('Purchase.vue', () => {
    beforeEach(async () => {
        setActivePinia(createPinia())
        await router.push('/checkout')
        await router.isReady()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    const mockGame = { id: 'g1', name: 'Test Game', price: 600, coverImage: '/test.jpg' }

    it('redirects to home if checkoutItems is empty', () => {
        const pushSpy = vi.spyOn(router, 'push')
        mount(Purchase, { global: { plugins: [router] } })

        // ควรเด้งกลับไปหน้าแรกทันทีเมื่อไม่มีรายการ
        expect(pushSpy).toHaveBeenCalledWith('/')
    })

    it('renders checkout summary correctly', () => {
        const store = useCartStore()
        // จำลองว่าผู้ใช้กด Buy Now
        store.prepareCheckout('single', mockGame, 2)

        const wrapper = mount(Purchase, { global: { plugins: [router] } })

        expect(wrapper.text()).toContain('Test Game')
        expect(wrapper.text()).toContain('Amount: 2')
        expect(wrapper.find('[data-test="checkout-price"]').text()).toBe('1,200 Baht')
        expect(wrapper.find('[data-test="checkout-count"]').text()).toBe('2 Item(s)')
    })

    it('clears cart and redirects to success on confirm (cart type)', async () => {
        const store = useCartStore()
        const pushSpy = vi.spyOn(router, 'push')

        const apiSpy = vi.spyOn(apiModule, 'api').mockResolvedValue({
            id: 'ORD-12345678',
            userId: 'guest',
            username: 'Guest',
            items: [
                {
                    gameId: 'g1',
                    gameName: 'Test Game',
                    coverImage: '/test.jpg',
                    price: 600,
                    amount: 1,
                    keys: ['ABCD-1234-WXYZ']
                }
            ]
        })

        // จำลองใส่ตะกร้าก่อน แล้วค่อยกด Checkout จากหน้าตะกร้า
        store.addToCart(mockGame, 1)
        store.prepareCheckout('cart')

        const wrapper = mount(Purchase, { global: { plugins: [router] } })
        const confirmBtn = wrapper.find('button.btn-confirm')

        await confirmBtn.trigger('click')
        await flushPromises()

        // ยืนยันว่าเรียก API พร้อม Payload ที่ถูกต้อง
        expect(apiSpy).toHaveBeenCalledWith('/orders', {
            method: 'POST',
            body: JSON.stringify({
                items: [{ gameId: 'g1', amount: 1 }]
            })
        })

        // ยืนยันว่าบันทึก LastOrder สำเร็จ
        expect(store.lastOrder).toHaveLength(1)
        expect(store.lastOrder[0].keys).toEqual(['ABCD-1234-WXYZ'])

        // ยืนยันสำเร็จต้องล้างทั้งคิวและตะกร้าหลัก
        expect(store.checkoutItems.length).toBe(0)
        expect(store.items.length).toBe(0)
        expect(pushSpy).toHaveBeenCalledWith('/success')
    })

    it('handles single checkout and res.data.items format', async () => {
        const store = useCartStore()
        const pushSpy = vi.spyOn(router, 'push')

        vi.spyOn(apiModule, 'api').mockResolvedValue({
            data: {
                items: [
                    {
                        gameId: 'g1',
                        gameName: 'Test Game',
                        coverImage: '/test.jpg',
                        keys: ['KEY1', 'KEY2']
                    }
                ]
            }
        })

        store.prepareCheckout('single', mockGame, 2)

        const wrapper = mount(Purchase, { global: { plugins: [router] } })
        const confirmBtn = wrapper.find('button.btn-confirm')

        await confirmBtn.trigger('click')
        await flushPromises()

        expect(store.lastOrder).toHaveLength(1)
        expect(store.lastOrder[0].keys).toEqual(['KEY1', 'KEY2'])
        expect(store.checkoutItems.length).toBe(0)
        expect(pushSpy).toHaveBeenCalledWith('/success')
    })

    it('handles error gracefully when API fails', async () => {
        const store = useCartStore()
        const pushSpy = vi.spyOn(router, 'push')
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        vi.spyOn(apiModule, 'api').mockRejectedValue(new Error('Network error'))

        store.prepareCheckout('single', mockGame, 1)

        const wrapper = mount(Purchase, { global: { plugins: [router] } })
        const confirmBtn = wrapper.find('button.btn-confirm')

        await confirmBtn.trigger('click')
        await flushPromises()

        expect(consoleSpy).toHaveBeenCalled()
        expect(pushSpy).not.toHaveBeenCalledWith('/success')
        expect(store.checkoutItems.length).toBe(1)
    })
})
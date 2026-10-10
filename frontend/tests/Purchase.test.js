import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Purchase from '../src/pages/Purchase.vue'
import { useCartStore } from '../src/stores/cart'

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

        // จำลองใส่ตะกร้าก่อน แล้วค่อยกด Checkout จากหน้าตะกร้า
        store.addToCart(mockGame, 1)
        store.prepareCheckout('cart')

        const wrapper = mount(Purchase, { global: { plugins: [router] } })
        const confirmBtn = wrapper.find('button.bg-primary')

        await confirmBtn.trigger('click')

        // ยืนยันสำเร็จต้องล้างทั้งคิวและตะกร้าหลัก
        expect(store.checkoutItems.length).toBe(0)
        expect(store.items.length).toBe(0)
        expect(pushSpy).toHaveBeenCalledWith('/success')
    })
})
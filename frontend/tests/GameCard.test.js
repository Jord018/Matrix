import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import GameCard from '../src/components/GameCard.vue'

// สร้าง Mock Router สำหรับ <router-link>
const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/product/:id', component: { template: '<div>Product</div>' } }]
})

describe('GameCard.vue', () => {
    const mockGame = {
        _id: 'game123',
        name: 'Epic Adventure 3',
        price: 1290,
        coverImage: 'https://example.com/cover.jpg'
    }

    it('renders game details correctly', () => {
        const wrapper = mount(GameCard, {
            props: { game: mockGame },
            global: { plugins: [router] }
        })

        // ตรวจสอบชื่อและราคา
        expect(wrapper.text()).toContain('Epic Adventure 3')
        expect(wrapper.text()).toContain('1290 Baht')

        // ตรวจสอบรูปภาพ
        const img = wrapper.find('img')
        expect(img.attributes('src')).toBe('https://example.com/cover.jpg')
        expect(img.attributes('alt')).toBe('Epic Adventure 3')
    })

    it('has correct view link', () => {
        const wrapper = mount(GameCard, {
            props: { game: mockGame },
            global: { plugins: [router] }
        })

        const viewLink = wrapper.find('a')
        // ตรวจสอบว่า vue-router แปลง <router-link> เป็น <a href="/product/game123">
        expect(viewLink.attributes('href')).toBe('/product/game123')
    })

    it('emits add-to-cart event with correct payload when cart button is clicked', async () => {
        const wrapper = mount(GameCard, {
            props: { game: mockGame },
            global: { plugins: [router] }
        })

        // จำลองการกดปุ่ม Add to Cart
        const cartBtn = wrapper.find('[data-test="add-to-cart-btn"]')
        await cartBtn.trigger('click')

        // ตรวจสอบว่ามีการ emit event 'add-to-cart'
        expect(wrapper.emitted()).toHaveProperty('add-to-cart')
        
        // ตรวจสอบข้อมูลที่แนบไปพร้อมกับ event (payload)
        const payload = wrapper.emitted('add-to-cart')[0][0]
        expect(payload).toEqual({ gameId: 'game123', amount: 1 })
    })
})
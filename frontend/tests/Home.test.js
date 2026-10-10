import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../src/pages/Home.vue'
import GameCard from '../src/components/GameCard.vue'

// Mock api.js
import * as apiModule from '../src/api'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/product/:id', component: { template: '<div>Product</div>' } }
    ]
})

describe('Home.vue', () => {
    beforeEach(() => {
        // Mock scrollIntoView ที่ถูกเรียกตอนเปลี่ยนหน้า
        Element.prototype.scrollIntoView = vi.fn()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('fetches data and renders components correctly', async () => {
        // จำลองข้อมูล 20 เกม
        const mockGames = Array.from({ length: 20 }, (_, i) => ({
            id: `game${i+1}`,
            name: `Test Game ${i+1}`,
            price: 500,
            coverImage: '/cover.jpg'
        }))
        const mockHighlights = [{ id: '1', gameId: 'game1', name: 'Highlight 1', customImage: '/hl.jpg' }]

        // จำลองการเรียก API
        vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
            if (path === '/games') return mockGames
            if (path === '/highlights') return mockHighlights
            return []
        })

        const wrapper = mount(Home, {
            global: { plugins: [router] }
        })

        // รอ API โหลดเสร็จและ DOM อัปเดต
        await flushPromises()

        // ตรวจสอบว่าโหลด Highlight มาแสดง
        expect(wrapper.find('img[alt="Highlight 1"]').exists()).toBe(true)

        // ตรวจสอบ GameCard (หน้าแรกต้องแสดงแค่ 15 เกมแรก ตาม itemsPerPage)
        const gameCards = wrapper.findAllComponents(GameCard)
        expect(gameCards.length).toBe(15)
        expect(wrapper.text()).toContain('Test Game 1')
        expect(wrapper.text()).toContain('Test Game 15')
        expect(wrapper.text()).not.toContain('Test Game 16') // เกมที่ 16 ไม่ควรแสดงในหน้าแรก
        
        // ตรวจสอบว่า Pagination ถูกเปิดขึ้นมา
        const pagination = wrapper.find('nav[aria-label="Game page navigation"]')
        expect(pagination.exists()).toBe(true)
    })

    it('navigates to next page and triggers scroll', async () => {
        const mockGames = Array.from({ length: 20 }, (_, i) => ({
            id: `game${i+1}`,
            name: `Test Game ${i+1}`,
            price: 500,
            coverImage: '/cover.jpg'
        }))

        vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
            if (path === '/games') return mockGames
            return []
        })

        const wrapper = mount(Home, {
            attachTo: document.body,
            global: { plugins: [router] }
        })
        await flushPromises()

        // จำลองการกดปุ่มหน้า 2
        const page2Button = wrapper.findAll('button').find(btn => btn.text() === '2')
        await page2Button.trigger('click')
        await flushPromises()

        // ควรแสดงเกมที่ 16 ถึง 20 แทน
        expect(wrapper.text()).not.toContain('Test Game 15')
        expect(wrapper.text()).toContain('Test Game 16')
        expect(wrapper.text()).toContain('Test Game 20')

        // ตรวจสอบว่าหน้าจอถูกสั่งให้ scroll กลับไปด้านบน
        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

        wrapper.unmount()
    })

    it('shows fallback UI when no games are fetched', async () => {
        vi.spyOn(apiModule, 'api').mockResolvedValue([])

        const wrapper = mount(Home, { global: { plugins: [router] } })
        await flushPromises()

        expect(wrapper.text()).toContain('No games available!')
    })
})
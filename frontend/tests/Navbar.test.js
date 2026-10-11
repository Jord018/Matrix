import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../src/components/Navbar.vue'
import { auth } from '../src/auth'

// สร้าง Mock Router 
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/search', component: { template: '<div>Search</div>' } },
        { path: '/category/:name', component: { template: '<div>Category</div>' } },
        { path: '/contact', component: { template: '<div>Contact</div>' } },
        { path: '/cart', component: { template: '<div>Cart</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
    ]
})

describe('Navbar.vue', () => {
    beforeEach(async () => {
        setActivePinia(createPinia())
        router.push('/')
        await router.isReady()
    })

    it('renders the brand name and logo correctly', () => {
        const wrapper = mount(Navbar, { global: { plugins: [router] } })
        expect(wrapper.text()).toContain('Mouse Jerry')
        expect(wrapper.find('img[alt="Logo-Jerry"]').exists()).toBe(true)
    })

    it('performs search and navigates to /search with query parameters', async () => {
        const wrapper = mount(Navbar, { global: { plugins: [router] } })
        
        // จำลองการพิมพ์ข้อความค้นหาบน Desktop
        const inputs = wrapper.findAll('input[type="search"]')
        await inputs[0].setValue('Action Game')
        
        // จำลองการกด Submit Form
        const forms = wrapper.findAll('form')
        await forms[0].trigger('submit.prevent')

        // รอ Router เปลี่ยนหน้าให้เสร็จก่อน
        await flushPromises() 

        // ตรวจสอบว่า Router มีการเปลี่ยนหน้าไปที่ /search พร้อม Query จริง
        expect(router.currentRoute.value.path).toBe('/search')
        expect(router.currentRoute.value.query.q).toBe('Action Game')
    })

    it('toggles mobile menu when hamburger button is clicked', async () => {
        const wrapper = mount(Navbar, { global: { plugins: [router] } })
        const toggleBtn = wrapper.find('button.lg\\:hidden')

        // เริ่มต้นต้องไม่มีเมนูมือถือแสดง (มีแค่ฟอร์มของ Desktop)
        expect(wrapper.findAll('form').length).toBe(1)

        // กดปุ่มแฮมเบอร์เกอร์
        await toggleBtn.trigger('click')

        // เมนูมือถือถูกกางออก (ฟอร์มค้นหาของมือถือปรากฏขึ้นมาเป็นอันที่ 2)
        expect(wrapper.findAll('form').length).toBe(2)
    })

    it('shows category dropdown on mouseover and hides on mouseleave when not pinned', async () => {
        const wrapper = mount(Navbar, { global: { plugins: [router] } })
        const categoryBtn = wrapper.find('button.text-white.font-bold')
        const categoryLi = wrapper.find('li.relative')
        
        // จำลองการเอาเมาส์ไปชี้
        await categoryBtn.trigger('mouseover')
        
        const dropdown = wrapper.find('ul.absolute')
        // ตรวจสอบว่าคลาสที่ใช้แสดงผลมีการทำงาน (v-show toggle เป็น true)
        expect(dropdown.attributes('style')).not.toContain('display: none')

        // เอาเมาส์ออกตอนยังไม่ pin ต้องปิด dropdown
        await categoryLi.trigger('mouseleave')
        expect(dropdown.attributes('style')).toContain('display: none')
    })

    it('pins category dropdown on click and closes on outside click', async () => {
        const wrapper = mount(Navbar, { attachTo: document.body, global: { plugins: [router] } })
        const categoryBtn = wrapper.find('button.text-white.font-bold')
        const dropdown = wrapper.find('ul.absolute')

        await categoryBtn.trigger('click')
        expect(dropdown.attributes('style')).not.toContain('display: none')

        // คลิกนอก dropdown ต้องปิด
        document.body.click()
        await flushPromises()
        expect(dropdown.attributes('style')).toContain('display: none')

        wrapper.unmount()
    })

    it('loads categories from /categories API or falls back to /games', async () => {
        const apiModule = await import('../src/api')
        const spy = vi.spyOn(apiModule, 'api')

        // Case 1: /categories returns data
        spy.mockImplementationOnce(async () => [
            { id: 10, name: 'Sci-Fi', isVisible: true },
            { id: 11, name: 'HiddenCat', isVisible: false }
        ])
        const w1 = mount(Navbar, { global: { plugins: [router] } })
        await flushPromises()
        expect(w1.text()).toContain('Sci-Fi')
        expect(w1.text()).not.toContain('HiddenCat')

        // Case 2: /categories fails, falls back to /games
        spy.mockImplementationOnce(async () => null)
        spy.mockImplementationOnce(async () => [
            { id: 1, categories: ['Horror', 'Survival'] },
            { id: 2, category: 'Puzzle' }
        ])
        const w2 = mount(Navbar, { global: { plugins: [router] } })
        await flushPromises()
        expect(w2.text()).toContain('Horror')
        expect(w2.text()).toContain('Puzzle')

        // Case 3: /categories returns wrapped { data: [...] }
        spy.mockImplementationOnce(async () => ({
            data: [{ id: 12, name: 'Cyberpunk', isVisible: true }]
        }))
        const w3 = mount(Navbar, { global: { plugins: [router] } })
        await flushPromises()
        expect(w3.text()).toContain('Cyberpunk')

        // Case 4: No categories found
        spy.mockImplementationOnce(async () => [])
        spy.mockImplementationOnce(async () => [])
        const w4 = mount(Navbar, { global: { plugins: [router] } })
        await flushPromises()
        expect(w4.text()).toContain('No Categories Found')

        spy.mockRestore()
    })

    it('links the user icon to login for guests and to the profile when signed in', async () => {
        auth.loaded = true
        auth.user = null
        const guest = mount(Navbar, { global: { plugins: [router] } })
        expect(guest.find('[data-test=login-link]').attributes('href')).toBe('/login')
        expect(guest.find('[data-test=profile-link]').exists()).toBe(false)

        auth.user = { Username: 'jerry' }
        const member = mount(Navbar, { global: { plugins: [router] } })
        const link = member.find('[data-test=profile-link]')
        expect(link.attributes('href')).toBe('/profile')
        expect(link.text()).toContain('jerry')
        auth.user = null
        auth.loaded = false
    })

    it('marks /profile as login-only', async () => {
        const { routes } = await import('../src/router')
        expect(routes.find((r) => r.path === '/profile').meta.auth).toBe(true)
    })
})

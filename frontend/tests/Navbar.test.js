import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../src/components/Navbar.vue'

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
    ]
})

describe('Navbar.vue', () => {
    beforeEach(async () => {
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

    it('shows category dropdown on mouseover', async () => {
        const wrapper = mount(Navbar, { global: { plugins: [router] } })
        const categoryBtn = wrapper.find('button.text-white.font-bold')
        
        // จำลองการเอาเมาส์ไปชี้
        await categoryBtn.trigger('mouseover')
        
        const dropdown = wrapper.find('ul.absolute')
        // ตรวจสอบว่าคลาสที่ใช้แสดงผลมีการทำงาน (v-show toggle เป็น true)
        expect(dropdown.attributes('style')).not.toContain('display: none')
    })
})
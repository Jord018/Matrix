import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Success from '../src/pages/Success.vue'
import MyKeys from '../src/pages/MyKeys.vue'
import { useCartStore } from '../src/stores/cart'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/my-keys', component: MyKeys }
    ]
})

describe('Success & MyKeys Pages', () => {
    beforeEach(async () => {
        setActivePinia(createPinia())
        // จำลองฟังก์ชัน Copy ลง Clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue()
            }
        })
    })

    it('renders Success page with random order number', () => {
        const wrapper = mount(Success, { global: { plugins: [router] } })
        expect(wrapper.text()).toContain('Payment Successful!')
        expect(wrapper.text()).toContain('Your Order Number')
        expect(wrapper.text()).toMatch(/ORD-[A-Z0-9]{6}/) // เช็ก format ORD-XXXXXX
    })

    it('renders MyKeys page empty state when no last order', async () => {
        const wrapper = mount(MyKeys, { global: { plugins: [router] } })
        expect(wrapper.text()).toContain('No keys found')
    })

    it('renders MyKeys page with purchased games and handles copy', async () => {
        const store = useCartStore()
        store.setLastOrder([
            {
                gameName: 'Cyber Battle',
                coverImage: '/cover.jpg',
                keys: ['ABCD-1234-WXYZ', '9876-QWER-TYUI']
            }
        ])

        const wrapper = mount(MyKeys, { global: { plugins: [router] } })
        await flushPromises()

        expect(wrapper.text()).toContain('Cyber Battle')
        expect(wrapper.text()).toContain('ABCD-1234-WXYZ')

        // กดปุ่ม Copy อันแรก
        const copyBtns = wrapper.findAll('button')
        await copyBtns[0].trigger('click')

        // เช็กว่าเรียกใช้ navigator.clipboard.writeText สำเร็จด้วยคีย์ที่ถูกต้อง
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABCD-1234-WXYZ')
        // ปุ่มเปลี่ยนข้อความเป็น Copied!
        expect(copyBtns[0].text()).toContain('Copied!')
    })
})
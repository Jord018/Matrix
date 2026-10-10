import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HighlightCarousel from '../src/components/HighlightCarousel.vue'

// สร้าง Mock Router เพราะใน Component มีการใช้ <router-link>
const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/product/:id', component: { template: '<div>Product</div>' } }]
})

describe('HighlightCarousel.vue', () => {
    it('renders welcome message when highlights array is empty', () => {
        const wrapper = mount(HighlightCarousel, {
            props: { highlights: [] },
            global: { plugins: [router] }
        })
        expect(wrapper.text()).toContain('Welcome to Mouse Jerry!')
    })

    it('renders swiper slides and SHOP NOW button when highlights are provided', () => {
        const mockHighlights = [
            { _id: '1', gameId: 'game123', name: 'Test Game', customImage: '/test.jpg', buttonColor: '#ff0000' }
        ]
        const wrapper = mount(HighlightCarousel, {
            props: { highlights: mockHighlights },
            global: { plugins: [router] }
        })
        
        // ต้องไม่มีข้อความ Welcome
        expect(wrapper.text()).not.toContain('Welcome to Mouse Jerry!')
        
        // ต้องมีปุ่ม SHOP NOW
        expect(wrapper.text()).toContain('SHOP NOW')
        
        // ตรวจสอบว่าสีปุ่มถูกนำมาใช้จริง (#ff0000 จะถูกแปลงเป็น rgb ใน DOM)
        const button = wrapper.find('a.px-8')
        expect(button.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
    })
})
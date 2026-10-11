import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../src/components/Pagination.vue'

describe('Pagination.vue', () => {
    it('does not render if totalPages is 1 or less', () => {
        const wrapper = mount(Pagination, {
            props: { currentPage: 1, totalPages: 1 }
        })
        expect(wrapper.find('nav').exists()).toBe(false)
    })

    it('renders correct number of pages and ellipses for large totalPages', () => {
        const wrapper = mount(Pagination, {
            props: { currentPage: 5, totalPages: 10 }
        })
        
        // ควรแสดงหน้าแบบ: < 1 ... 4 5 6 ... 10 >
        const text = wrapper.text()
        expect(text).toContain('1')
        expect(text).toContain('4')
        expect(text).toContain('5')
        expect(text).toContain('6')
        expect(text).toContain('10')
        expect(text).toContain('...')
    })

    it('emits page-changed event when clicking a page number', async () => {
        const wrapper = mount(Pagination, {
            props: { currentPage: 1, totalPages: 5 }
        })
        
        // หาปุ่มหมายเลข 2 (ลำดับอาร์เรย์: 0=prev, 1=page1, 2=page2)
        const buttons = wrapper.findAll('button')
        await buttons[2].trigger('click')

        expect(wrapper.emitted()).toHaveProperty('page-changed')
        // ตรวจสอบว่าพารามิเตอร์ที่แนบมากับ event คือหน้าที่ 2
        expect(wrapper.emitted('page-changed')[0]).toEqual([2])
    })

    it('disables prev button on first page and next button on last page', () => {
        const wrapperFirst = mount(Pagination, {
            props: { currentPage: 1, totalPages: 5 }
        })
        const buttonsFirst = wrapperFirst.findAll('button')
        expect(buttonsFirst[0].attributes('disabled')).toBeDefined() // Prev button disabled
        expect(buttonsFirst[buttonsFirst.length - 1].attributes('disabled')).toBeUndefined() // Next button enabled

        const wrapperLast = mount(Pagination, {
            props: { currentPage: 5, totalPages: 5 }
        })
        const buttonsLast = wrapperLast.findAll('button')
        expect(buttonsLast[0].attributes('disabled')).toBeUndefined() // Prev button enabled
        expect(buttonsLast[buttonsLast.length - 1].attributes('disabled')).toBeDefined() // Next button disabled
    })
})
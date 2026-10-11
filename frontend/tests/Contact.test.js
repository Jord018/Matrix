import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Contact from '../src/pages/Contact.vue'

describe('Contact.vue', () => {
    beforeEach(() => {
        vi.useFakeTimers() // สำหรับจำลอง setTimeout ของการแจ้งเตือนสำเร็จ
    })

    it('renders contact information and map', () => {
        const wrapper = mount(Contact)

        // ตรวจสอบว่าแสดงข้อมูลติดต่อครบถ้วน
        expect(wrapper.text()).toContain('support@mousejerry.com')
        expect(wrapper.text()).toContain('+66 12 345 6789')
        expect(wrapper.text()).toContain('Chiang Mai University')

        // ตรวจสอบว่ามี iframe แผนที่
        const iframe = wrapper.find('iframe')
        expect(iframe.exists()).toBe(true)
        expect(iframe.attributes('title')).toContain('Location Map')
    })

    it('submits the form and shows success message temporarily', async () => {
        // ดักจับ console.log ไว้ไม่ให้รกหน้าจอ Test
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        const wrapper = mount(Contact)

        // กรอกข้อมูลลงฟอร์ม
        await wrapper.find('#name').setValue('Tony Stark')
        await wrapper.find('#email').setValue('tony@stark.com')
        await wrapper.find('#subject').setValue('Feedback')
        await wrapper.find('#message').setValue('Great store!')

        // กดปุ่ม Submit
        await wrapper.find('form').trigger('submit.prevent')

        // ตรวจสอบว่าข้อมูลถูกส่ง (mock console.log)
        expect(consoleSpy).toHaveBeenCalledWith('Contact form submitted:', {
            name: 'Tony Stark',
            email: 'tony@stark.com',
            subject: 'Feedback',
            message: 'Great store!'
        })

        // ตรวจสอบว่าข้อความสำเร็จปรากฏขึ้น
        expect(wrapper.text()).toContain('Message Sent!')

        // ตรวจสอบว่าฟอร์มถูกเคลียร์กลับเป็นค่าว่าง
        expect(wrapper.find('#name').element.value).toBe('')

        // เร่งเวลาไปข้างหน้า 3 วินาที (3000ms)
        vi.advanceTimersByTime(3000)
        await wrapper.vm.$nextTick() // รอให้ Vue อัปเดต DOM

        // ตรวจสอบว่าข้อความสำเร็จหายไปแล้ว
        expect(wrapper.text()).not.toContain('Message Sent!')

        consoleSpy.mockRestore()
    })
})
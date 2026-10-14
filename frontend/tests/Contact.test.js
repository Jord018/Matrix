import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Contact from '../src/pages/Contact.vue'

describe('Contact.vue', () => {
    it('renders contact information and social links', () => {
        const wrapper = mount(Contact)

        // ตรวจสอบหัวข้อ
        expect(wrapper.text()).toContain('Contact us')
        expect(wrapper.text()).toContain('Address')

        // ตรวจสอบ Social Links
        const instagramLink = wrapper.find('a[href="https://instagram.com"]')
        expect(instagramLink.exists()).toBe(true)
        expect(instagramLink.text()).toContain('Instagram')

        const facebookLink = wrapper.find('a[href="https://facebook.com"]')
        expect(facebookLink.exists()).toBe(true)
        expect(facebookLink.text()).toContain('Facebook')

        const phoneLink = wrapper.find('a[href="tel:+66123456789"]')
        expect(phoneLink.exists()).toBe(true)
        expect(phoneLink.text()).toContain('+66 123 456 789')
    })

    it('renders headquarters address correctly', () => {
        const wrapper = mount(Contact)

        expect(wrapper.text()).toContain('Mouse Jerry Keys HQ')
        expect(wrapper.text()).toContain('Cyber Gaming Tower')
        expect(wrapper.text()).toContain('Nimmanhaemin Road')
        expect(wrapper.text()).toContain('Chiang Mai, Thailand 50200')
    })

    it('renders map iframe correctly', () => {
        const wrapper = mount(Contact)

        const iframe = wrapper.find('iframe')
        expect(iframe.exists()).toBe(true)
        expect(iframe.attributes('title')).toBe('Location Map')
        expect(iframe.attributes('src')).toContain('Male%20Dormitory%201')
    })
})
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Register from '../src/pages/Register.vue'
import * as apiModule from '../src/api'

const makeRouter = () => createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/register', component: Register },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/', component: { template: '<div>Home</div>' } },
    ],
})

const fill = async (wrapper, confirm) => {
    await wrapper.find('#username').setValue('jerry')
    await wrapper.find('#email').setValue('j@x.com')
    await wrapper.find('#password').setValue('secret')
    await wrapper.find('#confirmPassword').setValue(confirm)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
}

describe('Register.vue', () => {
    afterEach(() => vi.restoreAllMocks())

    it('blocks mismatched passwords without calling the API', async () => {
        const spy = vi.spyOn(apiModule, 'api')
        const wrapper = mount(Register, { global: { plugins: [makeRouter()] } })
        await fill(wrapper, 'other')
        expect(spy).not.toHaveBeenCalled()
        expect(wrapper.find('[role=alert]').text()).toContain('รหัสผ่านไม่ตรงกัน')
    })

    it('posts the form and sends the user to log in', async () => {
        const router = makeRouter()
        const spy = vi.spyOn(apiModule, 'api').mockResolvedValue({ Username: 'jerry' })
        const wrapper = mount(Register, { global: { plugins: [router] } })
        await fill(wrapper, 'secret')
        expect(spy).toHaveBeenCalledWith('/register', expect.objectContaining({ method: 'POST' }))
        expect(router.currentRoute.value.path).toBe('/login')
    })

    it('shows the taken message on 409 and a generic one otherwise', async () => {
        const spy = vi.spyOn(apiModule, 'api').mockRejectedValueOnce({ status: 409 }).mockRejectedValueOnce({ status: 500 })
        const wrapper = mount(Register, { global: { plugins: [makeRouter()] } })
        await fill(wrapper, 'secret')
        expect(wrapper.find('[role=alert]').text()).toContain('ถูกใช้งานแล้ว')
        await wrapper.find('form').trigger('submit')
        await flushPromises()
        expect(wrapper.find('[role=alert]').text()).toContain('ไม่สามารถสร้างบัญชีได้')
        expect(spy).toHaveBeenCalledTimes(2)
    })
})

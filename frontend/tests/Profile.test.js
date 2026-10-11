import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../src/pages/Profile.vue'
import * as apiModule from '../src/api'
import { auth } from '../src/auth'

const makeRouter = () => createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/profile', component: Profile },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/', component: { template: '<div>Home</div>' } },
    ],
})

describe('Profile.vue', () => {
    afterEach(() => { vi.restoreAllMocks(); auth.user = null })

    it('shows the account and every purchased key', async () => {
        auth.user = { Username: 'jerry', Email: 'j@x.com', Role: 'customer' }
        vi.spyOn(apiModule, 'api').mockResolvedValue([
            { id: 'ORD-1', purchaseDate: '2026-10-01', items: [{ gameName: 'Hades', keys: ['AAAA-BBBB-CCCC', 'DDDD-EEEE-FFFF'] }] },
        ])
        const wrapper = mount(Profile, { global: { plugins: [makeRouter()] } })
        await flushPromises()
        expect(wrapper.find('[data-test=username]').text()).toBe('jerry')
        expect(wrapper.find('[data-test=email]').text()).toBe('j@x.com')
        expect(wrapper.findAll('[data-test=order]')).toHaveLength(1)
        expect(wrapper.text()).toContain('Order #ORD-1')
        expect(wrapper.findAll('.digital-key').map((k) => k.text())).toEqual(['AAAA-BBBB-CCCC', 'DDDD-EEEE-FFFF'])
        expect(wrapper.find('[data-test=empty]').exists()).toBe(false)
    })

    it('shows the empty state when there are no orders or the request fails', async () => {
        auth.user = { Username: 'jerry' }
        vi.spyOn(apiModule, 'api').mockRejectedValue(new Error('down'))
        const wrapper = mount(Profile, { global: { plugins: [makeRouter()] } })
        await flushPromises()
        expect(wrapper.find('[data-test=empty]').text()).toContain('No purchases yet!')
    })

    it('logs out and goes to /login', async () => {
        auth.user = { Username: 'jerry' }
        const router = makeRouter()
        const spy = vi.spyOn(apiModule, 'api').mockResolvedValue([])
        const wrapper = mount(Profile, { global: { plugins: [router] } })
        await flushPromises()
        await wrapper.find('button.btn-logout').trigger('click')
        await flushPromises()
        expect(spy).toHaveBeenCalledWith('/logout', { method: 'POST' })
        expect(auth.user).toBeNull()
        expect(router.currentRoute.value.path).toBe('/login')
    })
})

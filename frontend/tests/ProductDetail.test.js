import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ProductDetail from '../src/pages/ProductDetail.vue'
import * as apiModule from '../src/api'

vi.mock('../src/api', () => ({
  api: vi.fn()
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/product/:id', component: ProductDetail }
  ]
})

describe('ProductDetail.vue', () => {
  const mockGame = {
    id: '123',
    name: 'Cyber Battle',
    price: 1500,
    stock: 5,
    coverImage: '/cover.jpg',
    screenshots: ['/ss1.jpg', '/ss2.jpg'],
    categories: ['Action', 'RPG'],
    description: 'An epic cyber game.',
    systemRequirements: {
      os: 'Windows 10',
      processor: 'Intel i5',
      memory: '8GB RAM',
      graphics: 'GTX 1060',
      storage: '50GB'
    }
  }

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    await router.push('/product/123')
    await router.isReady()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders product details correctly', async () => {
    apiModule.api.mockResolvedValue(mockGame)
    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Cyber Battle')
    expect(wrapper.text()).toContain('1500 Baht')
    expect(wrapper.text()).toContain('An epic cyber game.')
    expect(wrapper.text()).toContain('Windows 10')
    expect(wrapper.text()).toContain('(5 available in stock)')
    expect(apiModule.api).toHaveBeenCalledWith('/games/123')
  })

  it('updates quantity within stock limits', async () => {
    apiModule.api.mockResolvedValue(mockGame)
    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    const minusBtn = wrapper.find('.fa-minus').element.parentElement
    const plusBtn = wrapper.find('.fa-plus').element.parentElement
    const qtyInput = wrapper.find('input[type="number"]')

    // เริ่มต้นที่ 1
    expect(qtyInput.element.value).toBe('1')

    // กดลบ (ไม่ควรต่ำกว่า 1)
    await minusBtn.click()
    expect(qtyInput.element.value).toBe('1')

    // กดเพิ่ม
    await plusBtn.click()
    expect(qtyInput.element.value).toBe('2')

    // กดเพิ่มจนเกิน stock (stock = 5)
    await plusBtn.click()
    await plusBtn.click()
    await plusBtn.click()
    await plusBtn.click() // พยายามทำให้เป็น 6
    expect(qtyInput.element.value).toBe('5') // ควรตันที่ 5
  })

  it('changes main image when clicking thumbnails', async () => {
    apiModule.api.mockResolvedValue(mockGame)
    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    const thumbnails = wrapper.findAll('.custom-scrollbar img')
    // thumbnail รูปแรกคือ cover, รูปที่สองคือ ss1
    expect(thumbnails.length).toBe(3)

    // กดรูปที่ 2 (index 1)
    await thumbnails[1].trigger('click')
    const mainImage = wrapper.find('.group.cursor-pointer img')
    expect(mainImage.attributes('src')).toBe('/ss1.jpg')
  })

  it('redirects to home if API fails', async () => {
    apiModule.api.mockRejectedValue(new Error('Not found'))
    const pushSpy = vi.spyOn(router, 'push')

    mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('prepares checkout and navigates to checkout on buy now', async () => {
    apiModule.api.mockResolvedValue(mockGame)
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    const buyBtn = wrapper.findAll('button').find(btn => btn.text().includes('Buy now'))
    await buyBtn.trigger('click')

    expect(pushSpy).toHaveBeenCalledWith('/checkout')
  })

  it('navigates slides, adds to cart, and toggles lightbox', async () => {
    apiModule.api.mockResolvedValue(mockGame)
    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    const nextBtn = wrapper.find('button[aria-label="Next screenshot"]')
    const prevBtn = wrapper.find('button[aria-label="Previous screenshot"]')

    await nextBtn.trigger('click')
    expect(wrapper.find('#mainSliderImage').attributes('src')).toBe('/ss1.jpg')

    await prevBtn.trigger('click')
    expect(wrapper.find('#mainSliderImage').attributes('src')).toBe('/cover.jpg')

    await prevBtn.trigger('click')
    expect(wrapper.find('#mainSliderImage').attributes('src')).toBe('/ss2.jpg')

    const addBtn = wrapper.findAll('button').find(btn => btn.text().includes('Add to cart'))
    await addBtn.trigger('click')

    const openLightboxBtn = wrapper.find('button[aria-label="Open full size preview"]')
    await openLightboxBtn.trigger('click')
    expect(wrapper.find('button[aria-label="Close Lightbox"]').exists()).toBe(true)

    // Close via close button
    await wrapper.find('button[aria-label="Close"]').trigger('click')
    expect(wrapper.find('button[aria-label="Close Lightbox"]').exists()).toBe(false)

    // Reopen and close via backdrop button
    await openLightboxBtn.trigger('click')
    await wrapper.find('button[aria-label="Close Lightbox"]').trigger('click')
    expect(wrapper.find('button[aria-label="Close Lightbox"]').exists()).toBe(false)
  })

  it('renders minimal game without screenshots and categories', async () => {
    apiModule.api.mockResolvedValue({
      id: 'simple-1',
      name: 'Simple Game',
      price: 100,
    })
    const wrapper = mount(ProductDetail, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Simple Game')
    expect(wrapper.text()).toContain('No screenshots available')
  })
})
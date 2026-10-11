import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Category from '../src/pages/Category.vue'
import * as apiModule from '../src/api'

// Mock API
vi.mock('../src/api', () => ({
  api: vi.fn(),
  onCatalogChange: vi.fn(() => () => {})
}))

// สร้าง Router เสมือน
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/category/:name', component: Category },
    { path: '/search', component: Category },
  ]
})

describe('Category.vue', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders category page with data successfully', async () => {
    // ให้ Mock ทะลุข้อมูลออกมา
    apiModule.api.mockResolvedValue([
      { id: '1', name: 'RPG Game', price: 500, coverImage: '/test.jpg' }
    ])

    // จำลองเข้า URL /category/RPG
    await router.push('/category/RPG')
    await router.isReady()

    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()

    // ตรวจสอบชื่อหน้าและข้อมูล
    expect(wrapper.text()).toContain('RPG Games')
    expect(wrapper.text()).toContain('1 products found')
    expect(wrapper.text()).toContain('RPG Game') // ชื่อเกมใน GameCard
    expect(apiModule.api).toHaveBeenCalledWith('/games?category=RPG')
  })

  it('refreshes in place when the back office changes something in another tab', async () => {
    apiModule.api.mockResolvedValue([
      { id: '1', name: 'Pinball A', price: 100, coverImage: '/a.jpg' },
      { id: '2', name: 'Pinball B', price: 100, coverImage: '/b.jpg' }
    ])
    await router.push('/category/Pinball')
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.text()).toContain('2 products found')

    // Pinball hidden in the back office -> the other tab fires the change callback
    apiModule.api.mockResolvedValue([])
    apiModule.onCatalogChange.mock.calls.at(-1)[0]()
    await flushPromises()
    expect(wrapper.text()).toContain('0 products found')
    expect(apiModule.api).toHaveBeenLastCalledWith('/games?category=Pinball')
  })

  it('renders search results based on query', async () => {
    apiModule.api.mockResolvedValue([
      { id: '2', name: 'Shooter XYZ', price: 900, coverImage: '/test2.jpg' }
    ])

    // จำลองเข้า URL /search?q=Shooter
    await router.push('/search?q=Shooter')
    await router.isReady()

    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Search Results for: "Shooter"')
    expect(wrapper.text()).toContain('Shooter XYZ')
    expect(apiModule.api).toHaveBeenCalledWith('/search?q=Shooter')
  })

  it('shows fallback UI when no games match', async () => {
    apiModule.api.mockResolvedValue([])

    await router.push('/search?q=UnknownGame')
    await router.isReady()

    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()

    // หน้าจอผี (ไม่พบข้อมูล)
    expect(wrapper.text()).toContain('0 products found')
    expect(wrapper.text()).toContain('No games found!')
    expect(wrapper.find('a.bg-accent-red').exists()).toBe(true) // ปุ่ม Back
  })
})
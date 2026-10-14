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

  it('refetches when navigating to another category', async () => {
    apiModule.api.mockImplementation(async (url) => {
      if (url.includes('Pinball')) return [{ id: '1', name: 'Pinball A', price: 100, coverImage: '/a.jpg' }]
      if (url.includes('RPG')) return [{ id: '2', name: 'RPG B', price: 200, coverImage: '/b.jpg' }]
      return []
    })
    await router.push('/category/Pinball')
    await router.isReady()
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Pinball Games')
    expect(wrapper.text()).toContain('Pinball A')

    await router.push('/category/RPG')
    await flushPromises()
    expect(wrapper.text()).toContain('RPG Games')
    expect(wrapper.text()).toContain('RPG B')
    expect(apiModule.api).toHaveBeenLastCalledWith('/games?category=RPG')
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

  it('handles res.data format and unexpected object format', async () => {
    apiModule.api.mockResolvedValue({
      data: [{ id: '10', name: 'Data Game', price: 300, coverImage: '/d.jpg' }]
    })
    await router.push('/category/Action')
    await router.isReady()
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Data Game')

    apiModule.api.mockResolvedValue({ unexpected: true })
    await router.push('/category/Puzzle')
    await flushPromises()
    expect(wrapper.text()).toContain('0 products found')
  })

  it('handles error in fetchGames gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    apiModule.api.mockImplementationOnce(() => { throw new Error('Crash') })
    await router.push('/category/RPG')
    await router.isReady()
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch category data:', expect.any(Error))
  })

  it('changes page via pagination and scrolls', async () => {
    const mockGames = Array.from({ length: 25 }, (_, i) => ({
      id: `game-${i + 1}`,
      name: `Game ${i + 1}`,
      price: 100,
      coverImage: '/g.jpg'
    }))
    apiModule.api.mockResolvedValue(mockGames)
    await router.push('/category/RPG')
    await router.isReady()
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()

    const pagination = wrapper.findComponent({ name: 'Pagination' })
    expect(pagination.exists()).toBe(true)
    pagination.vm.$emit('page-changed', 2)
    await flushPromises()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('adds game to cart when logged in and ignores when not', async () => {
    const mockGames = [
      { id: 'g1', name: 'Game 1', price: 100, coverImage: '/g1.jpg' },
      { _id: 'g2', name: 'Game 2', price: 200, coverImage: '/g2.jpg' }
    ]
    apiModule.api.mockResolvedValue(mockGames)
    await router.push('/category/RPG')
    await router.isReady()

    const authModule = await import('../src/auth')
    const cartStore = (await import('../src/stores/cart')).useCartStore()

    // 1. Guest: requireLogin returns false
    vi.spyOn(authModule, 'requireLogin').mockResolvedValueOnce(false)
    const wrapper = mount(Category, { global: { plugins: [router] } })
    await flushPromises()

    const gameCards = wrapper.findAllComponents({ name: 'GameCard' })
    gameCards[0].vm.$emit('add-to-cart', { gameId: 'g1', amount: 1 })
    await flushPromises()
    expect(cartStore.items).toHaveLength(0)

    // 2. User logged in: requireLogin returns true, add by id
    vi.spyOn(authModule, 'requireLogin').mockResolvedValueOnce(true)
    gameCards[0].vm.$emit('add-to-cart', { gameId: 'g1', amount: 2 })
    await flushPromises()
    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].quantity).toBe(2)

    // 3. Add game by _id
    vi.spyOn(authModule, 'requireLogin').mockResolvedValueOnce(true)
    gameCards[1].vm.$emit('add-to-cart', { gameId: 'g2', amount: 1 })
    await flushPromises()
    expect(cartStore.items).toHaveLength(2)
  })
})
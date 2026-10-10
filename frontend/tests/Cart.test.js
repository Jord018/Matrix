import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Cart from '../src/pages/Cart.vue'
import { useCartStore } from '../src/stores/cart'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/checkout', component: { template: '<div>Checkout</div>' } }
  ]
})

describe('Cart.vue & Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia()) // เปิดใช้งาน Pinia สำหรับ Test
    router.push('/cart')
    await router.isReady()
  })

  const mockGame = {
    id: 'game1',
    name: 'Test Game',
    price: 500,
    coverImage: '/test.jpg',
    stock: 5,
    categories: ['Action']
  }

  it('renders empty state initially', () => {
    const wrapper = mount(Cart, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Your cart is empty!')
    expect(wrapper.find('button[disabled]').exists()).toBe(true) // ปุ่ม Checkout ควรโดน Disable
  })

  it('adds item to store and updates cart display', async () => {
    const store = useCartStore()
    store.addToCart(mockGame, 2) // เพิ่มเกม 2 ชิ้น (500 x 2 = 1000)

    const wrapper = mount(Cart, { global: { plugins: [router] } })
    
    // ไม่ควรเห็น Empty state แล้ว
    expect(wrapper.text()).not.toContain('Your cart is empty!')
    
    // ตรวจสอบชื่อเกมและราคา
    expect(wrapper.text()).toContain('Test Game')
    
    // ตรวจสอบ Summary
    expect(wrapper.find('[data-test="summary-count"]').text()).toBe('2')
    expect(wrapper.find('[data-test="summary-price"]').text()).toBe('1,000')
    
    // ปุ่ม Checkout ต้องกดได้
    const checkoutBtn = wrapper.find('button.bg-primary')
    expect(checkoutBtn.attributes('disabled')).toBeUndefined()
  })

  it('updates quantity and prevents exceeding stock', async () => {
    const store = useCartStore()
    store.addToCart(mockGame, 1)

    const wrapper = mount(Cart, { global: { plugins: [router] } })
    const plusBtn = wrapper.find('.fa-plus').element.parentElement
    
    // กดเพิ่ม 1 ชิ้น
    await plusBtn.click()
    expect(store.items[0].quantity).toBe(2)

    // กดจนเกิน stock (stock=5)
    await plusBtn.click()
    await plusBtn.click()
    await plusBtn.click()
    await plusBtn.click() 
    expect(store.items[0].quantity).toBe(5) // ต้องตันที่ 5
  })

  it('removes item from cart', async () => {
    const store = useCartStore()
    store.addToCart(mockGame, 1)

    const wrapper = mount(Cart, { global: { plugins: [router] } })
    const removeBtn = wrapper.find('.fa-trash-can').element.parentElement
    
    await removeBtn.click()
    expect(store.items.length).toBe(0)
  })

  it('navigates to checkout on click', async () => {
    const store = useCartStore()
    store.addToCart(mockGame, 1)
    
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(Cart, { global: { plugins: [router] } })
    
    const checkoutBtn = wrapper.find('button.bg-primary')
    await checkoutBtn.trigger('click')
    
    expect(pushSpy).toHaveBeenCalledWith('/checkout')
  })
})
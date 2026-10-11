import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// The old store kept the cart in the server session; keep it across reloads here.
const STORAGE_KEY = 'mj-cart'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export const useCartStore = defineStore('cart', () => {
  const saved = load()
  const items = ref(saved.items ?? [])

  // --- เพิ่ม State สำหรับ Checkout ---
  const checkoutItems = ref(saved.checkoutItems ?? [])
  const checkoutType = ref(saved.checkoutType ?? null)
  const lastOrder = ref(saved.lastOrder ?? null)

  watch([items, checkoutItems, checkoutType, lastOrder], () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        items: items.value, checkoutItems: checkoutItems.value, checkoutType: checkoutType.value, lastOrder: lastOrder.value,
      }))
    } catch {
      // Storage full or blocked: the cart still works for this page view.
    }
  }, { deep: true, flush: 'sync' })

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.game.price * item.quantity), 0)
  })

  const addToCart = (game, amount = 1) => {
    const existingItem = items.value.find(item => item.game.id === game.id)
    if (existingItem) {
      const newQty = existingItem.quantity + amount
      existingItem.quantity = Math.min(newQty, game.stock || 99)
    } else {
      items.value.push({ game, quantity: amount })
    }
  }

  const updateQuantity = (gameId, change) => {
    const item = items.value.find(item => item.game.id === gameId)
    if (item) {
      const newQty = item.quantity + change
      if (newQty >= 1 && newQty <= (item.game.stock || 99)) {
        item.quantity = newQty
      }
    }
  }

  const removeFromCart = (gameId) => {
    items.value = items.value.filter(item => item.game.id !== gameId)
  }

  const clearCart = () => {
    items.value = []
  }

  // --- เพิ่ม Action สำหรับเตรียม Checkout ---
  const prepareCheckout = (type, game = null, amount = 1) => {
    checkoutType.value = type
    if (type === 'cart') {
      // โคลนข้อมูลตะกร้ามาไว้ที่ checkout เพื่อไม่ให้ผูกกับตะกร้าหลัก (เผื่อแก้ตะกร้าทีหลัง)
      checkoutItems.value = items.value.map(item => ({
        game: { ...item.game },
        quantity: item.quantity
      }))
    } else if (type === 'single' && game) {
      checkoutItems.value = [{ game, quantity: amount }]
    }
  }

  const setLastOrder = (orderData) => {
    lastOrder.value = orderData
  }

  // Logout empties everything, like the old store destroying the session.
  const reset = () => {
    items.value = []
    checkoutItems.value = []
    checkoutType.value = null
    lastOrder.value = null
  }

  return {
    items, checkoutItems, checkoutType, lastOrder,
    totalItems, totalPrice, addToCart, updateQuantity, removeFromCart, clearCart, prepareCheckout, setLastOrder, reset
  }
})
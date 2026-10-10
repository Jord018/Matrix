import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // --- เพิ่ม State สำหรับ Checkout ---
  const checkoutItems = ref([])
  const checkoutType = ref(null)

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
      checkoutItems.value = JSON.parse(JSON.stringify(items.value))
    } else if (type === 'single' && game) {
      checkoutItems.value = [{ game, quantity: amount }]
    }
  }

  return {
    items,
    checkoutItems,
    checkoutType,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    prepareCheckout
  }
})
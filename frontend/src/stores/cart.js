import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // คำนวณจำนวนชิ้นทั้งหมด
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  // คำนวณราคารวม
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.game.price * item.quantity), 0)
  })

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = (game, amount = 1) => {
    const existingItem = items.value.find(item => item.game.id === game.id)
    if (existingItem) {
      const newQty = existingItem.quantity + amount
      existingItem.quantity = Math.min(newQty, game.stock || 99)
    } else {
      items.value.push({ game, quantity: amount })
    }
  }

  // ปรับลด/เพิ่มจำนวน
  const updateQuantity = (gameId, change) => {
    const item = items.value.find(item => item.game.id === gameId)
    if (item) {
      const newQty = item.quantity + change
      if (newQty >= 1 && newQty <= (item.game.stock || 99)) {
        item.quantity = newQty
      }
    }
  }

  // ลบสินค้า
  const removeFromCart = (gameId) => {
    items.value = items.value.filter(item => item.game.id !== gameId)
  }

  // ล้างตะกร้า
  const clearCart = () => {
    items.value = []
  }

  return { 
    items, 
    totalItems, 
    totalPrice, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  }
})
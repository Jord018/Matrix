import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '../src/stores/cart'

const freshStore = () => {
    setActivePinia(createPinia())
    return useCartStore()
}

describe('cart persistence', () => {
    it('keeps the cart and checkout across a page reload', () => {
        const before = freshStore()
        before.addToCart({ id: 'g1', price: 100, stock: 5 }, 2)
        before.prepareCheckout('cart')
        before.setLastOrder([{ gameName: 'Hades', keys: ['AAAA'] }])

        const after = freshStore() // new Pinia = what a browser refresh does
        expect(after.items).toEqual([{ game: { id: 'g1', price: 100, stock: 5 }, quantity: 2 }])
        expect(after.totalPrice).toBe(200)
        expect(after.checkoutType).toBe('cart')
        expect(after.checkoutItems).toHaveLength(1)
        expect(after.lastOrder[0].gameName).toBe('Hades')
    })

    it('reset empties everything, also after a reload', () => {
        const store = freshStore()
        store.addToCart({ id: 'g1', price: 100 }, 1)
        store.reset()
        expect(freshStore().items).toEqual([])
    })

    it('starts empty when storage holds garbage', () => {
        localStorage.setItem('mj-cart', '{not json')
        expect(freshStore().items).toEqual([])
    })
})

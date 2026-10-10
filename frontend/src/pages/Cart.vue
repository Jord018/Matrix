<script setup>
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";

const router = useRouter();
const cartStore = useCartStore();

const handleCheckout = () => {
  cartStore.prepareCheckout("cart");
  router.push("/checkout");
};
</script>

<template>
  <div class="container mx-auto px-4 mt-12 mb-12 min-h-[60vh]">
    <h2 class="text-3xl font-bold text-primary mb-8">
      <i class="fa-solid fa-cart-shopping mr-2"></i> Your Cart
    </h2>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Left Column: Cart Items -->
      <div class="w-full lg:w-8/12">
        <div v-if="cartStore.items.length > 0" class="space-y-6">
          <div
            v-for="item in cartStore.items"
            :key="item.game.id"
            class="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <!-- Product Image -->
            <div class="w-full sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0">
              <img
                :src="item.game.coverImage"
                :alt="item.game.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Product Details -->
            <div class="p-5 flex flex-col justify-between flex-grow">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="text-xl font-bold text-gray-800">
                    {{ item.game.name }}
                  </h4>
                  <span
                    v-if="item.game.categories?.length > 0"
                    class="text-sm text-gray-500"
                  >
                    <i class="fa-solid fa-tag mr-1"></i>
                    {{ item.game.categories[0] }}
                  </span>
                </div>
                <div class="text-xl font-bold text-primary">
                  {{ item.game.price }} Baht
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-end mt-4">
                <!-- Quantity Selector -->
                <div
                  class="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    @click="cartStore.updateQuantity(item.game.id, -1)"
                    class="px-3 py-1 text-primary hover:bg-gray-200 transition-colors focus:outline-none"
                  >
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <label :for="'quantity-' + item.game.id" class="sr-only"
                    >Quantity</label
                  >
                  <input
                    :id="'quantity-' + item.game.id"
                    type="number"
                    :value="item.quantity"
                    readonly
                    class="w-10 text-center font-bold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    @click="cartStore.updateQuantity(item.game.id, 1)"
                    class="px-3 py-1 text-primary hover:bg-gray-200 transition-colors focus:outline-none"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>

                <!-- Remove Button -->
                <button
                  type="button"
                  @click="cartStore.removeFromCart(item.game.id)"
                  class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors focus:outline-none"
                  title="Remove from cart"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <i
            class="fa-solid fa-cart-arrow-down text-6xl text-gray-300 mb-4"
          ></i>
          <h3 class="text-2xl font-bold text-primary mb-2">
            Your cart is empty!
          </h3>
          <p class="text-gray-500 mb-6">
            Looks like you haven't added any epic games yet.
          </p>
          <router-link
            to="/"
            class="inline-block border-2 border-primary text-primary font-bold px-8 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Browse Games
          </router-link>
        </div>
      </div>

      <!-- Right Column: Summary -->
      <div class="w-full lg:w-4/12">
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24"
        >
          <h4 class="text-xl font-bold text-primary mb-6">Order Summary</h4>

          <div class="flex justify-between items-center mb-4 text-gray-600">
            <span>Total Items</span>
            <span class="font-bold text-gray-800" data-test="summary-count">{{
              cartStore.totalItems
            }}</span>
          </div>

          <div
            class="flex justify-between items-end border-t border-gray-100 pt-4 mb-8"
          >
            <span class="text-lg font-semibold text-gray-800">Total</span>
            <div class="text-right">
              <span
                class="text-3xl font-extrabold text-primary"
                data-test="summary-price"
                >{{ cartStore.totalPrice.toLocaleString() }}</span
              >
              <span class="text-gray-500 ml-1">Baht</span>
            </div>
          </div>

          <button
            @click="handleCheckout"
            :disabled="cartStore.totalItems === 0"
            class="w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
            :class="
              cartStore.totalItems === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-twilight shadow-md hover:shadow-lg'
            "
          >
            <i class="fa-solid fa-lock"></i> Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

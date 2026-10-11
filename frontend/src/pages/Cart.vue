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
  <div class="store-container mt-12 mb-12 min-h-[60vh]">
    <h2 class="mb-6 text-3xl font-extrabold text-primary">
      <i class="fa-solid fa-cart-shopping me-2"></i> Your Cart
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Cart Items (8 cols) -->
      <div class="lg:col-span-8">
        <div v-if="cartStore.items.length > 0">
          <div
            v-for="item in cartStore.items"
            :key="item.game.id || item.game._id"
            class="relative overflow-hidden bg-white rounded-[15px] p-6 flex flex-col md:flex-row items-stretch md:items-center gap-6 border border-[#eaeaea] shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_25px_rgba(54,1,133,0.08)] hover:-translate-y-0.5 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[5px] before:bg-secondary before:opacity-0 hover:before:opacity-100 before:transition-opacity mb-4 text-center md:text-left"
            :data-price="item.game.price"
          >
            <!-- Strict Image Boundaries -->
            <div class="shrink-0 w-[150px] md:w-[130px] mx-auto md:mx-0 rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-[#1a1a1a]">
              <img
                :src="item.game.coverImage"
                :alt="item.game.name"
                class="w-full aspect-[3/4] object-contain block"
              />
            </div>

            <!-- Details & Actions -->
            <div class="grow flex flex-col justify-between min-h-[150px]">
              <div class="mb-auto">
                <h4 class="text-primary font-extrabold text-[1.35rem] mb-[0.2rem]">{{ item.game.name }}</h4>
                <span
                  v-if="item.game.categories && item.game.categories.length > 0"
                  class="text-gray-500 text-sm"
                >
                  <i class="fa-solid fa-tag me-1 text-accent-yellow"></i>
                  {{ item.game.categories[0] }}
                </span>
              </div>

              <div class="flex flex-col md:flex-row justify-between items-center md:items-end gap-3 mt-6">
                <div class="text-accent-red text-[1.25rem] font-extrabold mb-[0.2rem]">{{ item.game.price }} Baht</div>

                <div class="flex items-center md:items-end justify-center md:justify-end gap-7">
                  <div class="inline-flex items-center bg-[#f8f9fa] border border-[#dee2e6] rounded-lg overflow-hidden shadow-xs">
                    <button
                      type="button"
                      class="bg-transparent border-0 px-3 py-1.5 text-primary font-bold cursor-pointer transition-colors hover:bg-[#e9ecef]"
                      @click="cartStore.updateQuantity(item.game.id || item.game._id, -1)"
                      aria-label="Decrease quantity"
                    >
                      <i class="fa-solid fa-minus"></i>
                    </button>
                    <label :for="'quantity-' + (item.game.id || item.game._id)" class="sr-only">Quantity</label>
                    <input
                      :id="'quantity-' + (item.game.id || item.game._id)"
                      type="number"
                      class="w-[45px] text-center border-0 bg-transparent font-bold pointer-events-none text-[#212529] outline-none"
                      :value="item.quantity"
                      readonly
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      class="bg-transparent border-0 px-3 py-1.5 text-primary font-bold cursor-pointer transition-colors hover:bg-[#e9ecef]"
                      @click="cartStore.updateQuantity(item.game.id || item.game._id, 1)"
                      aria-label="Increase quantity"
                    >
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  <button
                    type="button"
                    class="text-[#adb5bd] bg-transparent border-0 text-[1.8rem] transition-all duration-300 cursor-pointer p-0 flex items-center hover:text-accent-red hover:scale-110 hover:rotate-6"
                    title="Remove from cart"
                    @click="cartStore.removeFromCart(item.game.id || item.game._id)"
                    aria-label="Remove item"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12 bg-white rounded-2xl shadow-sm border p-8"
        >
          <i
            class="fa-solid fa-cart-arrow-down mb-3 block text-[4rem] text-[#dee2e6]"
          ></i>
          <h3 class="font-extrabold text-2xl mb-2 text-primary">
            Your cart is empty!
          </h3>
          <p class="text-gray-500 mb-6">
            Looks like you haven't added any epic games yet.
          </p>
          <router-link
            to="/"
            class="text-primary border border-primary transition-all duration-300 bg-transparent rounded-md px-6 py-2.5 font-bold inline-block hover:bg-primary hover:text-white"
          >
            Browse Games
          </router-link>
        </div>
      </div>

      <!-- Right Column: Summary (4 cols) -->
      <div class="lg:col-span-4">
        <div class="bg-white rounded-[15px] border-t-[5px] border-t-primary border border-[#eaeaea] shadow-xs p-6 sticky top-[100px]">
          <h4 class="font-extrabold mb-4 text-xl text-primary">
            Order Summary
          </h4>

          <div class="flex justify-between mb-4 text-[1.1rem] text-[#4a4a4a]">
            <span class="text-gray-600">Total Items</span>
            <span
              id="summaryItemCount"
              data-test="summary-count"
              class="font-bold text-gray-800"
            >
              {{ cartStore.totalItems }}
            </span>
          </div>

          <div class="flex justify-between items-center text-[1.8rem] font-black text-primary border-t-2 border-dashed border-[#dee2e6] pt-4 mt-4">
            <span>Total</span>
            <div>
              <span id="summaryTotalPrice" data-test="summary-price">
                {{ cartStore.totalPrice.toLocaleString() }}
              </span>
              <span class="text-[1.2rem] text-gray-500 ml-1">Baht</span>
            </div>
          </div>

          <button
            type="button"
            class="bg-primary w-full mt-6 bg-gradient-to-r from-accent-red to-secondary text-white text-[1.2rem] font-extrabold uppercase tracking-[1px] p-[15px] rounded-lg border-0 shadow-[0_10px_20px_rgba(143,1,119,0.2)] transition-all duration-300 cursor-pointer flex items-center justify-center hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_12px_25px_rgba(222,26,88,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            id="checkoutBtn"
            :disabled="cartStore.items.length === 0"
            @click="handleCheckout"
          >
            <i class="fa-solid fa-lock mr-2"></i> Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

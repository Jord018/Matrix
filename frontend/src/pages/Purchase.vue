<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { api } from "../api";

const router = useRouter();
const cartStore = useCartStore();

onMounted(() => {
  if (cartStore.checkoutItems.length === 0) {
    router.push("/");
  }
});

const checkoutTotalItems = computed(() => {
  return cartStore.checkoutItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
});

const checkoutTotalPrice = computed(() => {
  return cartStore.checkoutItems.reduce(
    (total, item) => total + item.game.price * item.quantity,
    0,
  );
});

const confirmPurchase = async () => {
  try {
    const payload = {
      items: cartStore.checkoutItems.map((item) => ({
        gameId: item.game.id || item.game._id,
        amount: item.quantity,
      })),
    };

    const res = await api("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const itemsWithKeys = res?.data?.items ?? res?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
    cartStore.setLastOrder(itemsWithKeys);

    if (cartStore.checkoutType === "cart") {
      cartStore.clearCart();
    }
    cartStore.checkoutItems = [];
    cartStore.checkoutType = null;

    router.push("/success");
  } catch (error) {
    console.error("Purchase failed:", error);
  }
};
</script>

<template>
  <div class="store-container mt-6 mb-12 min-h-[60vh] max-w-[850px]">
    <h2 class="mb-5 text-3xl font-extrabold text-primary">
      <i class="fa-solid fa-money-check-dollar me-2"></i> Complete Your Purchase
    </h2>

    <div id="checkoutItemsContainer">
      <div
        v-for="item in cartStore.checkoutItems"
        :key="item.game.id || item.game._id"
        class="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-stretch"
      >
        <div
          class="shrink-0 w-[130px] rounded-lg overflow-hidden bg-[#f0f0f0] shadow-sm"
        >
          <img
            :src="item.game.coverImage"
            :alt="item.game.name"
            class="w-full aspect-[3/4] object-contain block"
          />
        </div>

        <div
          class="flex-1 w-full md:w-auto bg-[#e9ecef] rounded-lg p-6 flex flex-col justify-between shadow-sm"
        >
          <div
            class="text-primary font-extrabold text-[1.3rem] mb-2 border-b border-dotted border-[#ccc] pb-2"
          >
            {{ item.game.name }}
          </div>

          <div class="flex justify-between items-center mt-4">
            <div class="font-bold text-[#555]">Amount: {{ item.quantity }}</div>
            <div class="text-[1.2rem] font-bold text-accent-red">
              {{ (item.game.price * item.quantity).toLocaleString() }} Baht
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="border-t-2 border-[#ccc] my-10" />

    <div>
      <div class="flex justify-between text-[1.5rem] mb-4 text-[#333]">
        <span class="font-semibold uppercase">Total Amount</span>
        <span data-test="checkout-price" class="font-extrabold">
          {{ checkoutTotalPrice.toLocaleString() }} Baht
        </span>
      </div>

      <div class="flex justify-between text-[1.5rem] mb-4 text-[#333]">
        <span class="font-semibold uppercase">Item Count</span>
        <span data-test="checkout-count" class="font-extrabold">
          {{ checkoutTotalItems }} Item(s)
        </span>
      </div>

      <div class="text-right mt-4">
        <button
          type="button"
          @click="confirmPurchase"
          class="btn-confirm bg-primary text-white text-[1.3rem] font-bold py-[15px] px-[50px] border-0 rounded-[6px] transition-all duration-300 cursor-pointer hover:bg-secondary hover:shadow-[0_4px_12px_rgba(143,1,119,0.3)]"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

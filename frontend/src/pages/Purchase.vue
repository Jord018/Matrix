<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { api } from "../api";

const router = useRouter();
const cartStore = useCartStore();

onMounted(() => {
  // หากเข้ามาหน้านี้โดยที่ไม่มีสินค้าเตรียมรอไว้เลย ให้ดีดกลับหน้า Home
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
    // TODO: เตรียมเชื่อม API /orders ในการส่งข้อมูลสั่งซื้อจริง
    // const res = await api('/orders', { method: 'POST', body: JSON.stringify({...}) });

    // จำลองเมื่อสั่งซื้อสำเร็จ
    if (cartStore.checkoutType === "cart") {
      cartStore.clearCart(); // ล้างตะกร้าหลักเมื่อซื้อจากตะกร้าสำเร็จ
    }
    cartStore.checkoutItems = []; // ล้างคิวการซื้อ
    cartStore.checkoutType = null;

    router.push("/success"); // เตรียมรับหน้าที่ 10
  } catch (error) {
    console.error("Purchase failed:", error);
  }
};
</script>

<template>
  <div class="container mx-auto px-4 mt-12 mb-12 min-h-[60vh] max-w-4xl">
    <h2 class="text-3xl font-bold text-primary mb-10">
      <i class="fa-solid fa-money-check-dollar mr-2"></i> Complete Your Purchase
    </h2>

    <div class="space-y-4">
      <div
        v-for="item in cartStore.checkoutItems"
        :key="item.game.id"
        class="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
      >
        <div
          class="w-24 h-32 shrink-0 rounded-md overflow-hidden bg-gray-100 mr-6"
        >
          <img
            :src="item.game.coverImage"
            :alt="item.game.name"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="flex-grow flex flex-col justify-center">
          <h4 class="text-xl font-bold text-gray-800 mb-2">
            {{ item.game.name }}
          </h4>
          <div class="flex justify-between items-center mt-4">
            <span class="text-gray-600 font-medium"
              >Amount: {{ item.quantity }}</span
            >
            <span class="text-xl font-bold text-primary"
              >{{
                (item.game.price * item.quantity).toLocaleString()
              }}
              Baht</span
            >
          </div>
        </div>
      </div>
    </div>

    <hr class="my-8 border-gray-200" />

    <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
      <div class="flex justify-between items-center mb-4 text-lg">
        <span class="text-gray-600 font-semibold">Total Amount</span>
        <span class="font-bold text-gray-800" data-test="checkout-price"
          >{{ checkoutTotalPrice.toLocaleString() }} Baht</span
        >
      </div>

      <div class="flex justify-between items-center text-lg mb-8">
        <span class="text-gray-600 font-semibold">Item Count</span>
        <span class="font-bold text-gray-800" data-test="checkout-count"
          >{{ checkoutTotalItems }} Item(s)</span
        >
      </div>

      <div class="text-right">
        <button
          @click="confirmPurchase"
          class="bg-primary text-white font-bold px-10 py-3 rounded-lg shadow-md hover:bg-twilight hover:shadow-lg transition-all text-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

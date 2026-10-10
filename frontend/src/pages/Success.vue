<script setup>
import { ref } from "vue";

// สร้างเลข Order จำลองแบบสุ่ม (ORD-XXXXXX)
const randomValues = new Uint8Array(6);
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
window.crypto.getRandomValues(randomValues);
const randomCode = Array.from(
  randomValues,
  (byte) => characters[byte % characters.length]
).join("");

const orderNumber = ref(`ORD-${randomCode}`);
</script>

<template>
  <div
    class="container mx-auto px-4 mt-20 mb-20 flex justify-center min-h-[50vh]"
  >
    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-lg w-full text-center flex flex-col items-center animate-fade-in-up"
    >
      <!-- Check Icon -->
      <div
        class="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm animate-bounce-short"
      >
        <i class="fa-solid fa-check"></i>
      </div>

      <h1 class="text-3xl font-extrabold text-primary mb-4">
        Payment Successful!
      </h1>
      <p class="text-gray-600 mb-8 leading-relaxed">
        Thank you for your purchase. Your payment has been processed securely,
        and your game keys are ready to be claimed.
      </p>

      <!-- Order Number Box -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full mb-8">
        <small
          class="text-gray-500 font-bold uppercase tracking-wider block mb-1"
          >Your Order Number</small
        >
        <span class="text-xl font-bold text-gray-800">{{ orderNumber }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 w-full">
        <router-link
          to="/"
          class="flex-1 border-2 border-primary text-primary font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-gamepad"></i> Keep Shopping
        </router-link>
        <router-link
          to="/my-keys"
          class="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-twilight transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <i class="fa-solid fa-key"></i> View My Keys
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
.animate-bounce-short {
  animation: bounceShort 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes bounceShort {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

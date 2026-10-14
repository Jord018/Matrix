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
  <div class="min-h-[80vh] flex items-center justify-center py-8 px-4">
    <div class="bg-white rounded-[20px] p-6 sm:p-12 md:py-16 md:px-12 max-w-[600px] w-full text-center shadow-[0_20px_50px_rgba(54,1,133,0.08)] border-t-[8px] border-secondary relative overflow-hidden animate-slide-fade">
      <!-- Animated Gradient Checkmark Icon -->
      <div class="w-[120px] h-[120px] bg-gradient-to-br from-secondary to-accent-red rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_15px_30px_rgba(222,26,88,0.3)]">
        <i class="fa-solid fa-check text-[4rem] text-white"></i>
      </div>

      <h1 class="text-primary font-black text-4xl mb-4">Payment Successful!</h1>
      <p class="text-[#6c757d] text-[1.2rem] mb-8 leading-[1.6]">
        Thank you for your purchase. Your payment has been processed securely,
        and your game keys are ready to be claimed.
      </p>

      <!-- Order Number Box -->
      <div class="bg-[#f8f9fa] border-2 border-dashed border-[#dee2e6] rounded-xl p-6 mb-10">
        <small class="text-gray-500 font-bold uppercase tracking-wider block">
          Your Order Number
        </small>
        <span class="block text-primary text-[1.5rem] font-extrabold tracking-[2px] mt-2">{{ orderNumber }}</span>
      </div>

      <!-- Action Buttons -->
      <div>
        <router-link to="/" class="bg-primary text-white py-[15px] px-[40px] rounded-full font-bold text-[1.1rem] transition-all duration-300 no-underline inline-block shadow-[0_10px_20px_rgba(54,1,133,0.2)] hover:bg-secondary hover:-translate-y-1 hover:text-white block sm:inline-block">
          <i class="fa-solid fa-gamepad mr-2"></i> Keep Shopping
        </router-link>
        <router-link to="/my-keys" class="bg-transparent text-primary py-[15px] px-[40px] rounded-full font-bold text-[1.1rem] transition-all duration-300 no-underline inline-block border-2 border-primary hover:bg-[#f8f9fa] block sm:inline-block sm:ml-4 mt-4 sm:mt-0">
          <i class="fa-solid fa-key mr-2"></i> View My Keys
        </router-link>
      </div>
    </div>
  </div>
</template>

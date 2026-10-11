<script setup>
import { ref } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const copiedKey = ref(null);

const copyKey = async (keyString) => {
  try {
    await navigator.clipboard.writeText(keyString);
    copiedKey.value = keyString;

    // รีเซ็ตข้อความ "Copied!" กลับเป็นปกติหลังจาก 2 วินาที
    setTimeout(() => {
      copiedKey.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy key: ", err);
  }
};
</script>

<template>
  <div class="container mx-auto px-4 mt-12 mb-12 min-h-[60vh] max-w-4xl">
    <h2 class="text-3xl font-bold text-primary mb-8">
      <i class="fa-solid fa-key mr-2"></i> Your Game Keys
    </h2>

    <div
      v-if="cartStore.lastOrder && cartStore.lastOrder.length > 0"
      class="space-y-6"
    >
      <div
        v-for="item in cartStore.lastOrder"
        :key="item.gameName"
        class="flex flex-col sm:flex-row bg-primary rounded-xl overflow-hidden shadow-md text-white"
      >
        <!-- Game Cover -->
        <img
          :src="item.coverImage"
          :alt="item.gameName"
          class="w-full sm:w-48 h-48 sm:h-auto object-cover opacity-90"
        />

        <!-- Key Details -->
        <div class="p-6 flex-grow flex flex-col justify-center">
          <h3 class="text-2xl font-bold mb-6 text-accent-yellow">
            {{ item.gameName }}
          </h3>

          <div class="space-y-3">
            <div
              v-for="(key, index) in item.keys"
              :key="index"
              class="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/10"
            >
              <span class="font-mono text-lg tracking-widest">{{ key }}</span>
              <button
                @click="copyKey(key)"
                class="px-4 py-1.5 rounded-md font-bold transition-all"
                :class="
                  copiedKey === key
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                "
              >
                <i
                  :class="
                    copiedKey === key
                      ? 'fa-solid fa-check'
                      : 'fa-regular fa-copy'
                  "
                ></i>
                {{ copiedKey === key ? "Copied!" : "Copy" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-10">
        <router-link
          to="/"
          class="inline-block border-2 border-primary text-primary font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Store
        </router-link>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
    >
      <i class="fa-solid fa-ghost text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-2xl font-bold text-gray-400 mb-2">No keys found</h3>
      <p class="text-gray-500 mb-6">You haven't purchased anything recently!</p>
      <router-link
        to="/"
        class="inline-block bg-primary text-white font-bold px-8 py-2.5 rounded-lg hover:bg-twilight transition-colors"
      >
        Go Shopping
      </router-link>
    </div>
  </div>
</template>

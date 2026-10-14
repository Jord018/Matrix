<script setup>
import { ref } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const copiedKey = ref(null);

const copyKey = async (keyString) => {
  try {
    await navigator.clipboard.writeText(keyString);
    copiedKey.value = keyString;

    setTimeout(() => {
      copiedKey.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy key: ", err);
  }
};
</script>

<template>
  <div class="store-container mt-12 mb-12 min-h-[60vh] max-w-[800px]">
    <h2 class="mb-4 text-3xl font-extrabold text-primary">
      <i class="fa-solid fa-key me-2"></i> Your Game Keys
    </h2>

    <div
      v-if="cartStore.lastOrder && cartStore.lastOrder.length > 0"
      class="space-y-6"
    >
      <div
        v-for="item in cartStore.lastOrder"
        :key="item.gameName"
        class="bg-white rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-6 border border-[#eaeaea] shadow-[0_5px_15px_rgba(0,0,0,0.03)] items-center sm:items-start text-center sm:text-left"
      >
        <!-- Game Cover -->
        <img
          :src="item.coverImage"
          :alt="item.gameName"
          class="w-[100px] rounded-lg aspect-[3/4] object-contain bg-[#1a1a1a] shrink-0 shadow-xs"
        />

        <!-- Key Details -->
        <div class="grow w-full">
          <div class="text-primary font-extrabold text-[1.3rem] mb-4 border-b-2 border-[#f0f0f0] pb-2">
            {{ item.gameName }}
          </div>

          <div
            v-for="(key, index) in item.keys"
            :key="index"
            class="bg-[#1a1a1a] text-[#00ff41] font-mono py-3 px-5 rounded-[6px] text-[1.2rem] font-bold tracking-[2px] mb-2 flex justify-between items-center border-l-4 border-accent-red shadow-sm"
          >
            <span class="truncate mr-3">{{ key }}</span>
            <button
              type="button"
              class="bg-white/10 text-white border-0 py-1.5 px-3 rounded text-[0.9rem] cursor-pointer transition-colors duration-200 flex items-center shrink-0 hover:bg-primary"
              :style="copiedKey === key ? { background: '#28a745' } : {}"
              @click="copyKey(key)"
            >
              <i
                :class="
                  copiedKey === key
                    ? 'fa-solid fa-check mr-1'
                    : 'fa-regular fa-copy mr-1'
                "
              ></i>
              {{ copiedKey === key ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <router-link
          to="/"
          class="text-primary border-2 border-primary transition-all duration-300 bg-transparent rounded-[6px] px-6 py-2.5 font-bold inline-block hover:bg-primary hover:text-white"
        >
          Back to Store
        </router-link>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12 bg-white rounded-2xl shadow-sm border p-8"
    >
      <i
        class="fa-solid fa-ghost mb-3 block text-[4rem] text-[#dee2e6]"
      ></i>
      <h3 class="font-extrabold text-2xl text-gray-400 mb-2">No keys found</h3>
      <p class="text-gray-400 mb-6">You haven't purchased anything yet!</p>
      <router-link
        to="/"
        class="bg-[#0d6efd] text-white px-3 py-1.5 rounded-md inline-block transition-colors hover:bg-[#0b5ed7]"
      >
        Go Shopping
      </router-link>
    </div>
  </div>
</template>

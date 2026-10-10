<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const router = useRouter();

const game = ref(null);
const loading = ref(true);
const amount = ref(1);
const currentImageIndex = ref(0);
const isLightboxOpen = ref(false);

const fetchProduct = async () => {
  try {
    loading.value = true;
    // จำลองเรียก API ดึงข้อมูลเกมเดียว (Backend ต้องเตรียม /api/games/{id})
    const res = await api(`/games/${route.params.id}`);
    game.value = res;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    // หากไม่พบเกม ให้กลับไปหน้า Home
    router.push('/');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProduct();
});

// รวบรวมรูปภาพทั้งหมด (Cover + Screenshots) มาไว้ใน Array เดียว
const displayShots = computed(() => {
  if (!game.value) return [];
  const shots = [];
  if (game.value.coverImage) shots.push(game.value.coverImage);
  if (game.value.screenshots && game.value.screenshots.length > 0) {
    shots.push(...game.value.screenshots);
  }
  return shots;
});

// ฟังก์ชันเปลี่ยนรูป
const setMainImage = (index) => {
  currentImageIndex.value = index;
};

// ฟังก์ชันปรับลด/เพิ่มจำนวนสินค้า
const updateQty = (change) => {
  if (!game.value) return;
  const newVal = amount.value + change;
  if (newVal >= 1 && newVal <= game.value.stock) {
    amount.value = newVal;
  }
};

const addToCart = () => {
  console.log("Add to cart:", { gameId: game.value.id, amount: amount.value });
  // TODO: เพิ่มลง Pinia Store ใน PR ถัดไป
};

const buyNow = () => {
  console.log("Buy now:", { gameId: game.value.id, amount: amount.value });
  // TODO: บันทึกข้อมูลและพาไปหน้า Checkout ใน PR ถัดไป
};
</script>

<template>
  <div class="container mx-auto px-4 mt-8 mb-12 min-h-[60vh]">
    
    <!-- Skeleton Loaders -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div class="flex flex-col lg:flex-row gap-10">
        <div class="w-full lg:w-7/12 h-[400px] bg-gray-200 rounded-xl"></div>
        <div class="w-full lg:w-5/12 h-[300px] bg-gray-200 rounded-xl"></div>
      </div>
    </div>

    <div v-else-if="game" class="fade-in">
      
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-8 text-gray-500 text-sm">
        <ol class="flex items-center space-x-2">
          <li><router-link to="/" class="hover:text-accent-red transition-colors">Home</router-link></li>
          <li><i class="fa-solid fa-chevron-right text-[10px]"></i></li>
          <li v-if="game.categories?.length > 0">
            <router-link :to="`/category/${encodeURIComponent(game.categories[0])}`" class="hover:text-accent-red transition-colors">
              {{ game.categories[0] }}
            </router-link>
          </li>
          <li><i v-if="game.categories?.length > 0" class="fa-solid fa-chevron-right text-[10px]"></i></li>
          <li class="font-semibold text-gray-800">{{ game.name }}</li>
        </ol>
      </nav>

      <div class="flex flex-col lg:flex-row gap-12 mb-12">
        
        <!-- Left Column: Visuals (Slider) -->
        <div class="w-full lg:w-7/12">
          <div v-if="displayShots.length > 0">
            <button 
                 type="button"
                 class="relative w-full block rounded-xl overflow-hidden shadow-md mb-4 bg-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary" 
                 @click="isLightboxOpen = true"
                 aria-label="View full size image">
              <img :src="displayShots[currentImageIndex]" :alt="game.name" class="w-full h-auto max-h-[450px] object-contain transition-opacity duration-300 block">
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <i class="fa-solid fa-magnifying-glass-plus text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </button>

            <!-- Thumbnail Scroller -->
            <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                v-for="(shot, index) in displayShots" 
                :key="index"
                type="button"
                @click="setMainImage(index)"
                class="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                :aria-label="`View thumbnail ${index + 1}`"
              >
                <img 
                  :src="shot" 
                  class="h-20 w-32 object-cover rounded-md transition-all duration-200 border-2 block"
                  :class="currentImageIndex === index ? 'border-primary shadow-md opacity-100' : 'border-transparent opacity-60 hover:opacity-100'"
                  :alt="`Thumbnail ${index + 1}`"
                >
              </button>
            </div>
          </div>
          <div v-else class="bg-gray-100 rounded-xl h-[450px] flex items-center justify-center">
            <span class="text-gray-400">No screenshots available</span>
          </div>
        </div>

        <!-- Right Column: Purchase Info -->
        <div class="w-full lg:w-5/12 flex flex-col">
          <img :src="game.coverImage" :alt="game.name" class="w-auto max-h-[250px] object-contain rounded-lg shadow-sm border-2 border-primary mb-6 self-start">
          
          <h1 class="text-4xl font-extrabold text-primary mb-2">{{ game.name }}</h1>
          <div class="text-4xl font-extrabold text-primary mb-8">{{ game.price }} Baht</div>

          <!-- Add to Cart & Buy Now Buttons -->
          <div class="flex gap-4 mb-6">
            <button @click="addToCart" class="flex-1 bg-secondary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-cart-plus"></i> Add to cart
            </button>
            <button @click="buyNow" class="flex-1 bg-gradient-to-r from-accent-red to-accent-yellow text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-bolt"></i> Buy now
            </button>
          </div>

          <!-- Amount Selector -->
          <div>
            <label for="amount" class="block text-gray-500 font-bold mb-2">Amount</label>
            <div class="flex items-center gap-4">
              <div class="flex items-center bg-white border-2 border-gray-200 rounded-lg overflow-hidden w-max">
                <button @click="updateQty(-1)" class="px-4 py-2 bg-gray-50 text-primary hover:bg-gray-100 transition-colors focus:outline-none">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <input id="amount" type="number" v-model="amount" readonly class="w-12 text-center font-bold text-lg border-x-0 focus:outline-none" :max="game.stock" aria-label="Amount">
                <button @click="updateQty(1)" class="px-4 py-2 bg-gray-50 text-primary hover:bg-gray-100 transition-colors focus:outline-none">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <span class="text-gray-500 text-sm">({{ game.stock }} available in stock)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Column -->
      <div class="w-full lg:w-8/12 space-y-12">
        <!-- Categories -->
        <div>
          <h3 class="text-2xl font-extrabold text-primary border-b-2 border-gray-100 pb-2 mb-4">Category</h3>
          <div class="flex flex-wrap gap-2">
            <router-link 
              v-for="cat in game.categories" 
              :key="cat"
              :to="`/category/${encodeURIComponent(cat)}`" 
              class="px-4 py-1.5 bg-gray-100 text-primary border border-gray-200 rounded-full hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              {{ cat }}
            </router-link>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-2xl font-extrabold text-primary border-b-2 border-gray-100 pb-2 mb-4">About Game</h3>
          <div class="bg-white rounded-xl p-8 shadow-sm border-l-4 border-secondary text-gray-700 leading-relaxed whitespace-pre-line">
            {{ game.description }}
          </div>
        </div>

        <!-- System Requirements -->
        <div v-if="game.systemRequirements && Object.keys(game.systemRequirements).length > 0">
          <h3 class="text-2xl font-extrabold text-primary border-b-2 border-gray-100 pb-2 mb-4">System Requirements</h3>
          <div class="bg-white rounded-xl p-8 shadow-sm border-l-4 border-secondary text-gray-700">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><span class="block text-gray-500 text-sm font-bold uppercase mb-1">OS</span><span>{{ game.systemRequirements.os }}</span></div>
              <div><span class="block text-gray-500 text-sm font-bold uppercase mb-1">Processor</span><span>{{ game.systemRequirements.processor }}</span></div>
              <div><span class="block text-gray-500 text-sm font-bold uppercase mb-1">Memory</span><span>{{ game.systemRequirements.memory }}</span></div>
              <div><span class="block text-gray-500 text-sm font-bold uppercase mb-1">Graphics</span><span>{{ game.systemRequirements.graphics }}</span></div>
              <div class="sm:col-span-2 pt-4 border-t border-gray-100 mt-2">
                <span class="block text-gray-500 text-sm font-bold uppercase mb-1">Storage</span>
                <span><i class="fa-solid fa-hard-drive text-primary mr-2"></i> {{ game.systemRequirements.storage }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lightbox Modal -->
      <div v-if="isLightboxOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <!-- จุดที่ 3: ใช้ปุ่มเปล่าบังเต็มจอแทนการดักคลิกที่ div พื้นหลัง -->
        <button type="button" class="absolute inset-0 w-full h-full cursor-default focus:outline-none" @click="isLightboxOpen = false" aria-label="Close Lightbox"></button>
        <button type="button" class="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 focus:outline-none z-10" @click="isLightboxOpen = false" aria-label="Close">&times;</button>
        
        <img :src="displayShots[currentImageIndex]" :alt="game.name" class="relative z-10 max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-md">
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
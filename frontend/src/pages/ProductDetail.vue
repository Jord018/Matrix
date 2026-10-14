<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api";
import { useCartStore } from "../stores/cart";
import { requireLogin } from "../auth";

const cartStore = useCartStore();
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
    const res = await api(`/games/${route.params.id}`);
    game.value = res;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    router.push("/");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProduct();
});

const displayShots = computed(() => {
  if (!game.value) return [];
  const shots = [];
  if (game.value.coverImage) shots.push(game.value.coverImage);
  if (game.value.screenshots && game.value.screenshots.length > 0) {
    shots.push(...game.value.screenshots);
  }
  return shots;
});

const setMainImage = (index) => {
  currentImageIndex.value = index;
};

const prevSlide = () => {
  if (displayShots.value.length === 0) return;
  let newIndex = currentImageIndex.value - 1;
  if (newIndex < 0) newIndex = displayShots.value.length - 1;
  setMainImage(newIndex);
};

const nextSlide = () => {
  if (displayShots.value.length === 0) return;
  let newIndex = currentImageIndex.value + 1;
  if (newIndex >= displayShots.value.length) newIndex = 0;
  setMainImage(newIndex);
};

const updateQty = (change) => {
  if (!game.value) return;
  const newVal = amount.value + change;
  if (newVal >= 1 && newVal <= (game.value.stock || 99)) {
    amount.value = newVal;
  }
};

const addToCart = async () => {
  if (!(await requireLogin(router, route.fullPath))) return;
  if (game.value) {
    cartStore.addToCart(game.value, amount.value);
  }
};

const buyNow = async () => {
  if (!(await requireLogin(router, route.fullPath))) return;
  cartStore.prepareCheckout("single", game.value, amount.value);
  router.push("/checkout");
};
</script>

<template>
  <div class="store-container mt-6 mb-12 min-h-[60vh]">
    <!-- Skeleton Loaders -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-6 bg-white/10 rounded w-1/3 mb-8"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 h-[450px] bg-white/10 rounded-xl"></div>
        <div class="lg:col-span-5 h-[350px] bg-white/10 rounded-xl"></div>
      </div>
    </div>

    <div v-else-if="game" class="fade-in">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-6">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <router-link to="/" class="text-secondary no-underline transition-colors duration-300 hover:text-accent-red">Home</router-link>
          </li>
          <li class="text-gray-400">/</li>
          <li v-if="game.categories?.length > 0">
            <router-link
              :to="`/category/${encodeURIComponent(game.categories[0])}`"
              class="text-secondary no-underline transition-colors duration-300 hover:text-accent-red"
            >
              {{ game.categories[0] }}
            </router-link>
          </li>
          <li v-if="game.categories?.length > 0" class="text-gray-400">/</li>
          <li class="font-semibold text-gray-400" aria-current="page">
            {{ game.name }}
          </li>
        </ol>
      </nav>

      <!-- Main Visuals & Purchase Row -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <!-- Visuals Column (Left, col-lg-7) -->
        <div class="lg:col-span-7">
          <div v-if="displayShots.length > 0">
            <div class="relative overflow-hidden bg-[#111] rounded-lg shadow-sm mb-3 group cursor-pointer">
              <button
                type="button"
                class="w-full block border-0 p-0 bg-transparent cursor-pointer focus:outline-none"
                aria-label="Open full size preview"
                @click="isLightboxOpen = true"
              >
                <img
                  id="mainSliderImage"
                  :src="displayShots[currentImageIndex]"
                  :alt="game.name"
                  class="w-full h-[450px] object-contain cursor-pointer transition-opacity duration-150 block"
                />
              </button>

              <button
                v-if="displayShots.length > 1"
                type="button"
                class="absolute top-1/2 -translate-y-1/2 left-[15px] bg-black/60 text-white border-0 w-[45px] h-[45px] rounded-full cursor-pointer z-10 transition-all duration-200 flex items-center justify-center text-[1.2rem] hover:bg-primary hover:-translate-y-1/2 hover:scale-110"
                @click.stop="prevSlide"
                aria-label="Previous screenshot"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                v-if="displayShots.length > 1"
                type="button"
                class="absolute top-1/2 -translate-y-1/2 right-[15px] bg-black/60 text-white border-0 w-[45px] h-[45px] rounded-full cursor-pointer z-10 transition-all duration-200 flex items-center justify-center text-[1.2rem] hover:bg-primary hover:-translate-y-1/2 hover:scale-110"
                @click.stop="nextSlide"
                aria-label="Next screenshot"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <!-- Thumbnail Scroller -->
            <div class="flex gap-2 pb-2 overflow-x-auto [scrollbar-width:thin] custom-scrollbar py-2.5">
              <button
                v-for="(shot, index) in displayShots"
                :key="shot"
                type="button"
                class="shrink-0 p-0 border-0 bg-transparent rounded-[6px] cursor-pointer focus:outline-none"
                :aria-label="`View thumbnail ${index + 1}`"
                @click="setMainImage(index)"
              >
                <img
                  :src="shot"
                  :class="[
                    'w-[120px] h-[68px] object-cover rounded-[6px] cursor-pointer border-2 transition-all duration-200 shrink-0 block hover:opacity-80',
                    index === currentImageIndex
                      ? 'opacity-100 border-primary scale-105 shadow-[0_4px_10px_rgba(0,0,0,0.2)]'
                      : 'opacity-50 border-transparent'
                  ]"
                  :alt="`Thumbnail ${index + 1}`"
                />
              </button>
            </div>
          </div>
          <div
            v-else
            class="bg-black/20 rounded-xl h-[450px] flex items-center justify-center"
          >
            <span class="text-gray-400">No screenshots available</span>
          </div>
        </div>

        <!-- Purchase Column (Right, col-lg-5) -->
        <div class="lg:col-span-5 flex flex-col">
          <img
            :src="game.coverImage"
            :alt="game.name"
            class="rounded shadow-sm mb-4 self-start max-h-[250px] w-auto border-2 border-primary"
          />

          <h1 class="font-bold mb-2 text-primary text-[2.5rem] leading-tight">
            {{ game.name }}
          </h1>
          <div class="text-primary text-[2.5rem] font-extrabold mb-4">
            {{ game.price }} Baht
          </div>

          <!-- Add to Cart & Buy Now Buttons -->
          <div class="flex gap-3 mb-4">
            <button
              type="button"
              @click="addToCart"
              class="flex-1 py-2 flex items-center justify-center bg-secondary text-white border-2 border-secondary font-bold rounded-[6px] transition-all duration-300 text-base hover:bg-transparent hover:text-secondary cursor-pointer"
            >
              <i class="fa-solid fa-cart-plus mr-2"></i> Add to cart
            </button>

            <button
              type="button"
              @click="buyNow"
              class="flex-1 py-2 flex items-center justify-center bg-gradient-to-r from-accent-red to-accent-yellow text-white font-bold border-0 rounded-[6px] shadow-[0_4px_15px_rgba(244,179,66,0.4)] transition-all duration-300 text-base hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(222,26,88,0.5)] hover:text-white cursor-pointer"
            >
              <i class="fa-solid fa-bolt mr-2"></i> Buy now
            </button>
          </div>

          <!-- Amount Selector -->
          <div class="mb-3">
            <label for="amount" class="block font-bold text-gray-400 text-sm mb-2">Amount</label>
            <div class="flex items-center gap-3">
              <div class="flex items-center bg-white border-2 border-[#e0e0e0] rounded-lg overflow-hidden w-max">
                <button
                  type="button"
                  class="bg-[#f8f9fa] border-0 px-[15px] py-[5px] text-[1.2rem] text-primary transition-colors cursor-pointer hover:bg-[#e9ecef]"
                  @click="updateQty(-1)"
                  aria-label="Decrease quantity"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>
                <input
                  id="amount"
                  type="number"
                  v-model="amount"
                  class="w-[50px] text-center border-0 font-bold text-[1.1rem] outline-none bg-transparent text-[#212529] pointer-events-none"
                  readonly
                  :max="game.stock || 99"
                  aria-label="Amount"
                />
                <button
                  type="button"
                  class="bg-[#f8f9fa] border-0 px-[15px] py-[5px] text-[1.2rem] text-primary transition-colors cursor-pointer hover:bg-[#e9ecef]"
                  @click="updateQty(1)"
                  aria-label="Increase quantity"
                >
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <span class="text-gray-400 text-sm">({{ game.stock }} available in stock)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Column (Bottom, col-lg-8) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8">
          <!-- Category Section -->
          <div class="mb-8">
            <h3 class="text-primary font-extrabold text-[1.5rem] mb-4 relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[50px] after:h-1 after:bg-accent-yellow after:rounded-[2px]">Category</h3>
            <div class="flex gap-2 flex-wrap mt-3">
              <router-link
                v-for="cat in game.categories"
                :key="cat"
                :to="`/category/${encodeURIComponent(cat)}`"
                class="rounded-full inline-block px-3 py-2 text-sm font-semibold leading-none text-center whitespace-nowrap bg-[#e9ecef] text-primary no-underline border border-[#dee2e6]"
              >
                {{ cat }}
              </router-link>
            </div>
          </div>

          <!-- About Game Section -->
          <div class="mb-8">
            <h3 class="text-primary font-extrabold text-[1.5rem] mb-4 relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[50px] after:h-1 after:bg-accent-yellow after:rounded-[2px]">About Game</h3>
            <div class="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 border-l-4 border-secondary mt-3">
              <p class="leading-[1.8] text-[#4a4a4a] m-0 whitespace-pre-line">
                {{ game.description }}
              </p>
            </div>
          </div>

          <!-- System Requirements Section -->
          <div
            v-if="
              game.systemRequirements &&
              Object.keys(game.systemRequirements).length > 0
            "
            class="mb-8"
          >
            <h3 class="text-primary font-extrabold text-[1.5rem] mb-4 relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[50px] after:h-1 after:bg-accent-yellow after:rounded-[2px]">System Requirements</h3>
            <div class="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 border-l-4 border-secondary mt-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-500 block uppercase tracking-wider mb-1 font-bold text-[0.95rem]">OS</span>
                  <span class="text-gray-700 font-medium">{{ game.systemRequirements.os }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block uppercase tracking-wider mb-1 font-bold text-[0.95rem]">Processor</span>
                  <span class="text-gray-700 font-medium">{{ game.systemRequirements.processor }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block uppercase tracking-wider mb-1 font-bold text-[0.95rem]">Memory</span>
                  <span class="text-gray-700 font-medium">{{ game.systemRequirements.memory }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block uppercase tracking-wider mb-1 font-bold text-[0.95rem]">Graphics</span>
                  <span class="text-gray-700 font-medium">{{ game.systemRequirements.graphics }}</span>
                </div>
                <div class="sm:col-span-2 pt-3 border-t border-gray-100 mt-2">
                  <span class="text-gray-500 block uppercase tracking-wider mb-1 font-bold text-[0.95rem]">Storage</span>
                  <span class="text-gray-700 font-medium">
                    <i class="fa-solid fa-hard-drive mr-2 text-primary"></i>
                    {{ game.systemRequirements.storage }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <button
          type="button"
          class="absolute inset-0 w-full h-full cursor-default focus:outline-none"
          @click="isLightboxOpen = false"
          aria-label="Close Lightbox"
        ></button>
        <button
          type="button"
          class="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 focus:outline-none z-10 cursor-pointer"
          @click="isLightboxOpen = false"
          aria-label="Close"
        >
          &times;
        </button>
        <img
          :src="displayShots[currentImageIndex]"
          :alt="game.name"
          class="relative z-10 max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-md"
        />
      </div>
    </div>
  </div>
</template>

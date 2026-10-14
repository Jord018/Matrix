<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { requireLogin } from "../auth";
import { api } from "../api";
import GameCard from "../components/GameCard.vue";
import Pagination from "../components/Pagination.vue";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const router = useRouter();
const games = ref([]);
const loading = ref(true);
const cartStore = useCartStore();

const currentPage = ref(1);
const itemsPerPage = 15; // อิงตามโปรเจกต์เดิม

// Like the old category.ejs: breadcrumb shows the label, heading adds " Games".
const pageLabel = computed(() => {
  if (route.path === "/search") {
    return `Search Results for: "${route.query.q || ""}"`;
  }
  return route.params.name || "All";
});
const pageTitle = computed(() => `${pageLabel.value} Games`);

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => {
  if (!Array.isArray(games.value) || games.value.length === 0) return 0;
  return Math.ceil(games.value.length / itemsPerPage);
});

// ตัด Array ของเกมเพื่อแสดงผลตามหน้า
const paginatedGames = computed(() => {
  if (!Array.isArray(games.value)) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return games.value.slice(start, end);
});

// ดึงข้อมูลจาก API ตามพารามิเตอร์ของ URL
const fetchGames = async () => {
  loading.value = true;
  games.value = [];
  currentPage.value = 1;

  try {
    let endpoint = "/games";

    if (route.path === "/search" && route.query.q) {
      endpoint = `/search?q=${encodeURIComponent(route.query.q)}`;
    } else if (route.params.name) {
      endpoint = `/games?category=${encodeURIComponent(route.params.name)}`;
    }

    const res = await api(endpoint).catch(() => []);
    if (Array.isArray(res)) {
      games.value = res;
    } else if (Array.isArray(res?.data)) {
      games.value = res.data;
    } else {
      games.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch category data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGames();
});

watch(
  () => [route.path, route.query, route.params],
  () => {
    fetchGames();
  },
  { deep: true },
);

const handlePageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleAddToCart = async (payload) => {
  if (!(await requireLogin(router, route.fullPath))) return;
  const gameToAdd = games.value.find((g) => (g.id || g._id) === payload.gameId);
  if (gameToAdd) {
    cartStore.addToCart(gameToAdd, payload.amount);
  }
};
</script>

<template>
  <div class="store-container mt-6 mb-12 min-h-[60vh]">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="flex items-center space-x-2">
        <li>
          <router-link to="/" class="text-secondary hover:text-accent-red transition-colors no-underline font-medium">Home</router-link>
        </li>
        <li class="text-[#6c757d]">/</li>
        <li class="text-[#6c757d]" aria-current="page">
          {{ pageLabel }}
        </li>
      </ol>
    </nav>

    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="font-bold text-[2.5rem] leading-tight text-primary border-b-[3px] border-accent-yellow inline-block pb-2">
        {{ pageTitle }}
      </h1>
      <span class="text-[#6c757d]">{{ games.length }} products found</span>
    </div>

    <!-- Skeletons -->
    <div
      v-if="loading"
      class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-12"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="animate-pulse bg-white/10 h-96 rounded-2xl"
      ></div>
    </div>

    <!-- Product Grid -->
    <div v-else-if="paginatedGames.length > 0">
      <div id="productGrid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-12">
        <div
          v-for="game in paginatedGames"
          :key="game.id || game._id"
          class="game-card-wrapper h-full"
        >
          <GameCard
            :game="game"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>

      <Pagination
        full
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="handlePageChange"
      />
    </div>

    <!-- Fallback State -->
    <div v-else class="text-center py-20 bg-white/95 rounded-2xl shadow-sm border p-8">
      <i class="fa-solid fa-ghost text-6xl text-gray-300 mb-4 block"></i>
      <h3 class="text-2xl font-bold text-gray-400 mb-2">No games found!</h3>
      <router-link
        to="/"
        class="bg-accent-red text-white font-bold px-6 py-2.5 rounded-md hover:bg-accent-yellow hover:text-primary hover:-translate-y-0.5 transition-all inline-block mt-4"
      >
        Back to Main Page
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api, getCachedData, setCachedData } from "../api";
import HighlightCarousel from "../components/HighlightCarousel.vue";
import GameCard from "../components/GameCard.vue";
import Pagination from "../components/Pagination.vue";
import { useCartStore } from "../stores/cart";
import { useRouter } from "vue-router";
import { requireLogin } from "../auth";

const cartStore = useCartStore();
const router = useRouter();

// SWR Snapshot: โหลดข้อมูลจาก LocalStorage ทันทีตั้งแต่เสี้ยววินาทีแรก (0ms)
const initialGames = getCachedData("/games");
const initialHighlights = getCachedData("/highlights");

const highlights = ref(Array.isArray(initialHighlights) ? initialHighlights : []);
const allGames = ref(Array.isArray(initialGames) ? initialGames : []);
const currentPage = ref(1);
const itemsPerPage = 15; // อิงตามโปรเจกต์เดิม
// ถ้ามีข้อมูล Snapshot ในแคชอยู่แล้ว ไม่ต้องแสดง Skeleton
const loading = ref(allGames.value.length === 0);

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => {
  if (!Array.isArray(allGames.value) || allGames.value.length === 0) return 0;
  return Math.ceil(allGames.value.length / itemsPerPage);
});

// ตัด Array ของเกมเพื่อแสดงผลเฉพาะหน้าที่เลือก
const paginatedGames = computed(() => {
  if (!Array.isArray(allGames.value)) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allGames.value.slice(start, end);
});

const extractArrayData = (res) => {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
};

// ดึงข้อมูลเกมและไฮไลท์จาก API ในพื้นหลัง (Stale-While-Revalidate)
const fetchHomeData = async () => {
  try {
    if (allGames.value.length === 0) {
      loading.value = true;
    }
    const [gamesRes, highlightsRes] = await Promise.all([
      api("/games", { forceRefresh: true }).catch(() => null),
      api("/highlights", { forceRefresh: true }).catch(() => null),
    ]);

    if (gamesRes !== null) {
      const freshGames = extractArrayData(gamesRes);
      allGames.value = freshGames;
      if (freshGames.length > 0) {
        setCachedData("/games", freshGames);
      }
    }

    if (highlightsRes !== null) {
      const freshHighlights = extractArrayData(highlightsRes);
      highlights.value = freshHighlights;
      if (freshHighlights.length > 0) {
        setCachedData("/highlights", freshHighlights);
      }
    }
  } catch (error) {
    console.error("Failed to fetch home data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHomeData();
});

// เมื่อกดเปลี่ยนหน้า
const handlePageChange = (page) => {
  currentPage.value = page;

  // เลื่อนหน้าจอกลับไปที่หัวข้อ All Games
  const gridElement = document.getElementById("game-section");
  if (gridElement) {
    gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleAddToCart = async (payload) => {
  if (!(await requireLogin(router, "/"))) return;
  const gameToAdd = allGames.value.find((g) => (g.id || g._id) === payload.gameId);
  if (gameToAdd) {
    cartStore.addToCart(gameToAdd, payload.amount);
  }
};
</script>

<template>
  <div class="container mx-auto px-4 mt-4 mb-12 max-w-7xl">
    <!-- Skeleton Loaders สำหรับ Carousel -->
    <div
      v-if="loading"
      class="animate-pulse w-full max-w-[1200px] mx-auto h-[350px] bg-white/10 rounded-2xl mb-8"
    ></div>
    <HighlightCarousel v-else :highlights="highlights" />

    <!-- Section Title -->
    <h3
      id="game-section"
      class="mb-4 font-bold text-[1.75rem] tracking-[-0.02em] text-primary scroll-mt-20 page-header"
    >
      All Games
    </h3>

    <!-- Skeleton Loaders สำหรับ Game Grid -->
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

    <!-- Game Grid -->
    <div
      v-else-if="paginatedGames.length > 0"
      id="productGrid"
      class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-12"
    >
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

    <!-- Fallback State: ไม่มีเกม -->
    <div v-else class="text-center py-16 bg-white/95 rounded-2xl shadow-sm border p-8">
      <i class="fa-solid fa-ghost text-5xl text-gray-300 mb-4 block"></i>
      <h3 class="text-xl font-bold text-gray-400">No games available!</h3>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="!loading && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-changed="handlePageChange"
    />
  </div>
</template>

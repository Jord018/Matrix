<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api';
import GameCard from '../components/GameCard.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const games = ref([]);
const loading = ref(true);

const currentPage = ref(1);
const itemsPerPage = 15; // อิงตามโปรเจกต์เดิม

// คำนวณหัวข้อหน้า (Title) จาก Path หรือ Query
const pageTitle = computed(() => {
  if (route.path === '/search') {
    return `Search Results for: "${route.query.q || ''}"`;
  } else if (route.params.name) {
    return `${route.params.name} Games`;
  }
  return 'All Games';
});

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => Math.ceil(games.value.length / itemsPerPage));

// ตัด Array ของเกมเพื่อแสดงผลตามหน้า
const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return games.value.slice(start, end);
});

// ดึงข้อมูลจาก API ตามพารามิเตอร์ของ URL
const fetchGames = async () => {
  loading.value = true;
  games.value = []; // เคลียร์ของเก่า
  currentPage.value = 1; // กลับไปหน้าแรกเสมอเมื่อค้นหาใหม่

  try {
    let endpoint = '/games';
    
    // จำลองการต่อ String สำหรับ API
    // ใน Backend จริง (Laravel) เราจะทำ /api/games?category=xxx หรือ /api/search?q=xxx
    if (route.path === '/search' && route.query.q) {
      endpoint = `/search?q=${encodeURIComponent(route.query.q)}`;
    } else if (route.params.name) {
      endpoint = `/games?category=${encodeURIComponent(route.params.name)}`;
    }

    const res = await api(endpoint).catch(() => []);
    games.value = res || [];
  } catch (error) {
    console.error("Failed to fetch category data:", error);
  } finally {
    loading.value = false;
  }
};

// สั่งทำงานครั้งแรกเมื่อเปิดหน้า
onMounted(() => {
  fetchGames();
});

// ดักจับการเปลี่ยนแปลงของ URL เพื่อให้โหลดข้อมูลใหม่ (เช่น พิมพ์ค้นหาคำใหม่ซ้ำๆ)
watch(
  () => [route.path, route.query, route.params],
  () => {
    fetchGames();
  },
  { deep: true }
);

const handlePageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleAddToCart = (payload) => {
  console.log("Add to cart from category:", payload);
  // TODO: เชื่อมกับ Pinia Store ในอนาคต
};
</script>

<template>
  <div class="container mx-auto px-4 mt-8 mb-12 min-h-[60vh]">
    
    <!-- Breadcrumb & Title Header -->
    <nav aria-label="breadcrumb" class="mb-4 text-gray-500 text-sm">
      <ol class="flex items-center space-x-2">
        <li><router-link to="/" class="hover:text-accent-red transition-colors">Home</router-link></li>
        <li><i class="fa-solid fa-chevron-right text-[10px]"></i></li>
        <li class="font-semibold text-gray-800" aria-current="page">{{ pageTitle }}</li>
      </ol>
    </nav>

    <div class="flex justify-between items-center mb-8 border-b-2 border-accent-yellow pb-2">
      <h1 class="text-3xl font-bold text-primary">{{ pageTitle }}</h1>
      <span class="text-gray-500">{{ games.length }} products found</span>
    </div>

    <!-- Skeletons -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
      <div v-for="i in 10" :key="i" class="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
    </div>

    <!-- Product Grid -->
    <div v-else-if="paginatedGames.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
        <GameCard 
          v-for="game in paginatedGames" 
          :key="game.id" 
          :game="game"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <Pagination 
        v-if="totalPages > 1"
        :current-page="currentPage" 
        :total-pages="totalPages"
        @page-changed="handlePageChange"
      />
    </div>

    <!-- Fallback State -->
    <div v-else class="text-center py-20">
      <i class="fa-solid fa-ghost text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-2xl font-bold text-gray-400">No games found!</h3>
      <router-link to="/" class="mt-6 inline-block bg-accent-red text-white font-bold px-6 py-2 rounded-md hover:brightness-110 transition-all">
        Back to Main Page
      </router-link>
    </div>

  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api';
import HighlightCarousel from '../components/HighlightCarousel.vue';
import GameCard from '../components/GameCard.vue';
import Pagination from '../components/Pagination.vue';

const highlights = ref([]);
const allGames = ref([]);
const currentPage = ref(1);
const itemsPerPage = 15; // อิงตามโปรเจกต์เดิม
const loading = ref(true);

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => Math.ceil(allGames.value.length / itemsPerPage));

// ตัด Array ของเกมเพื่อแสดงผลเฉพาะหน้าที่เลือก
const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allGames.value.slice(start, end);
});

// ดึงข้อมูลเกมและไฮไลท์จาก API
const fetchHomeData = async () => {
  try {
    loading.value = true;
    // รอ Backend ของ Laravel เราเลยทำจำลองเรียกแยก 2 endpoint ไปก่อน
    const [gamesRes, highlightsRes] = await Promise.all([
      api('/games').catch(() => []),
      api('/highlights').catch(() => [])
    ]);
    
    allGames.value = gamesRes || [];
    highlights.value = highlightsRes || [];
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
  
  // เลื่อนหน้าจอกลับไปที่หัวข้อ All Games อย่างนุ่มนวล
  const gridElement = document.getElementById('game-section');
  if (gridElement) {
    gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleAddToCart = (payload) => {
  console.log("Add to cart triggered:", payload);
  // TODO: เตรียมเชื่อมต่อกับ Pinia store หรือ Context สำหรับจัดการตะกร้าใน PR ถัดไป
};
</script>

<template>
  <div class="container mx-auto px-4 mt-8 mb-12">
    <!-- Skeleton Loaders สำหรับ Carousel -->
    <div v-if="loading" class="animate-pulse w-full max-w-[1200px] mx-auto h-[300px] bg-gray-200 rounded-2xl mb-8"></div>
    <HighlightCarousel v-else :highlights="highlights" />

    <!-- Section Title -->
    <h3 id="game-section" class="mb-6 font-bold text-2xl text-primary scroll-mt-20">All Games</h3>

    <!-- Skeleton Loaders สำหรับ Game Grid -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
      <div v-for="i in 10" :key="i" class="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
    </div>
    
    <!-- Game Grid -->
    <div v-else-if="paginatedGames.length > 0" id="productGrid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
      <GameCard 
        v-for="game in paginatedGames" 
        :key="game.id" 
        :game="game"
        @add-to-cart="handleAddToCart"
      />
    </div>
    
    <!-- Fallback State: ไม่มีเกม -->
    <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border">
      <i class="fa-solid fa-ghost text-5xl text-gray-300 mb-4"></i>
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
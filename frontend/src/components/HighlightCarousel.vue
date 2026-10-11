<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

defineProps({
  highlights: {
    type: Array,
    default: () => []
  }
});

const modules = [EffectCoverflow, Autoplay, Navigation];
</script>

<template>
  <div class="carousel-container mb-8 w-full max-w-[1200px] mx-auto">
    <!-- แสดง Carousel เมื่อมีข้อมูล -->
    <swiper
      v-if="highlights && highlights.length > 0"
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="'auto'"
      :loop="true"
      :speed="800"
      :spaceBetween="30"
      :autoplay="{ delay: 4500, disableOnInteraction: false }"
      :navigation="true"
      :modules="modules"
      class="highlightSwiper w-full py-5"
    >
      <swiper-slide 
        v-for="item in highlights" 
        :key="item._id || item.gameId" 
        class="w-[300px] sm:w-[450px] md:w-[600px] bg-twilight rounded-2xl shadow-xl overflow-hidden group"
      >
        <!-- Background เบลอๆ ด้านหลัง -->
        <div class="absolute inset-0 bg-cover bg-center blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
             :style="{ backgroundImage: `url(${item.customImage})` }">
        </div>
        
        <!-- เนื้อหาหลัก -->
        <div class="relative z-10 flex flex-col items-center p-6 h-full justify-between">
          <router-link :to="`/product/${item.gameId}`" class="block w-full h-[200px] sm:h-[250px] overflow-hidden rounded-xl shadow-lg">
            <img :src="item.customImage" :alt="item.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </router-link>
          
          <div class="mt-5">
            <router-link 
              :to="`/product/${item.gameId}`" 
              class="px-8 py-2.5 text-white font-bold rounded-md shadow-md hover:-translate-y-1 hover:shadow-lg transition-all inline-block"
              :style="{ backgroundColor: item.buttonColor || '#8b0000' }"
            >
              SHOP NOW
            </router-link>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- Fallback State: กรณีไม่มีเกมไฮไลท์ (เหมือนโค้ดเดิม) -->
    <div v-else class="w-full h-[300px] bg-secondary flex items-center justify-center rounded-2xl shadow-lg">
      <h2 class="text-white font-bold text-3xl">Welcome to Mouse Jerry!</h2>
    </div>
  </div>
</template>

<style scoped>
.swiper-slide {
  background-position: center;
  background-size: cover;
}
/* ปรับแต่งปุ่ม Navigation ของ Swiper ให้เป็นสีขาว */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
</style>
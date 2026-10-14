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
  <div class="w-full shadow-lg carousel mb-6">
    <!-- แสดง Carousel เมื่อมีข้อมูล -->
    <swiper
      v-if="highlights && highlights.length > 0"
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="'auto'"
      :initialSlide="0"
      :loop="true"
      :speed="800"
      :spaceBetween="30"
      :autoplay="{ delay: 4500, disableOnInteraction: false }"
      :navigation="true"
      :coverflowEffect="{
        rotate: 0,
        stretch: 0,
        depth: 150,
        modifier: 1.5,
        slideShadows: false
      }"
      :modules="modules"
      class="highlightSwiper"
    >
      <swiper-slide 
        v-for="item in highlights" 
        :key="item.id || item._id || item.gameId"
      >
        <!-- Background เบลอๆ ด้านหลัง -->
        <div 
          class="absolute -top-[10%] -left-[10%] -right-[10%] -bottom-[10%] bg-cover bg-center blur-[20px] brightness-40 z-0" 
          :style="{ backgroundImage: `url(${item.customImage})` }"
        ></div>
        
        <!-- เนื้อหาหลัก -->
        <div class="relative z-10 w-full h-full flex justify-center">
          <router-link :to="`/product/${item.gameId || item.id || item._id}`" class="block w-full h-full cursor-pointer">
            <img :src="item.customImage" :alt="item.name" class="w-full h-full object-contain" />
          </router-link>
          
          <router-link 
            :to="`/product/${item.gameId || item.id || item._id}`" 
            class="px-8 absolute top-5 right-5 text-white font-extrabold text-[0.9rem] py-2.5 rounded-full tracking-[1px] border-2 border-white/20 transition-all duration-300 no-underline shadow-[0_4px_15px_rgba(0,0,0,0.3)] z-10 hover:scale-105 hover:text-white hover:brightness-125 hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)] max-md:top-2.5 max-md:right-2.5 max-md:px-[15px] max-md:py-1.5 max-md:text-[0.75rem]"
            :style="{ backgroundColor: item.buttonColor || '#8b0000' }"
          >
            SHOP NOW
          </router-link>
        </div>
      </swiper-slide>
    </swiper>

    <!-- Fallback State: กรณีไม่มีไฮไลท์ -->
    <div v-else class="w-full h-[300px] bg-secondary flex items-center justify-center rounded-2xl shadow-lg">
      <h2 class="text-white font-bold text-3xl">Welcome to Mouse Jerry!</h2>
    </div>
  </div>
</template>
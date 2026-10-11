<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = (gameId) => {
  // ส่ง event พร้อมข้อมูล gameId และจำนวน (amount = 1) กลับไปให้ component แม่
  emit('add-to-cart', { gameId, amount: 1 })
}
</script>

<template>
  <div class="flex flex-col bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden h-full group">
    <!-- Image Wrapper -->
    <div class="overflow-hidden h-[200px] w-full bg-gray-100">
      <img :src="game.coverImage" :alt="game.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
    </div>

    <!-- Card Body -->
    <div class="p-4 flex flex-col flex-grow">
      <h5 class="text-lg font-bold truncate text-gray-800 mb-1" :title="game.name">
        {{ game.name }}
      </h5>
      <p class="text-xl text-primary font-semibold mb-4">
        {{ game.price }} Baht
      </p>

      <!-- Action Buttons -->
      <div class="flex gap-2 mt-auto">
        <router-link :to="`/product/${game._id}`" 
                     class="flex-grow border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold text-center rounded-md py-1.5 transition-colors">
          View
        </router-link>
        
        <button @click="handleAddToCart(game._id)" 
                class="bg-accent-yellow text-white hover:brightness-105 font-bold rounded-md px-4 py-1.5 transition-all shadow-sm"
                title="Add to Cart"
                data-test="add-to-cart-btn">
          <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>
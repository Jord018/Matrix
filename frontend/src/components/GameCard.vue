<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-to-cart']);

const handleAddToCart = (gameId) => {
  emit('add-to-cart', { gameId, amount: 1 });
};
</script>

<template>
  <div class="group card game-card border border-white/10 rounded-2xl bg-white/5 backdrop-blur-[10px] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-4px_-4px_12px_rgba(255,255,255,0.05)] hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(255,255,255,0.1),0_0_20px_rgba(143,1,119,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] overflow-hidden flex flex-col h-full md:min-h-[450px]">
    <!-- Image Wrapper -->
    <div class="img-wrapper w-full overflow-hidden bg-transparent">
      <img
        :src="game.coverImage"
        :alt="game.name"
        class="card-img-top w-full aspect-[3/4] object-contain transition-transform duration-600 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
      />
    </div>

    <!-- Card Body -->
    <div class="card-body p-4 md:p-5 bg-gradient-to-t from-bg-light via-bg-light/70 to-transparent flex flex-col flex-grow">
      <h5 class="card-title font-bold text-gray-900 text-sm md:text-[1.15rem] mb-1 md:mb-2 truncate" :title="game.name">
        {{ game.name }}
      </h5>
      <p class="card-text text-accent-red font-bold text-base md:text-[1.2rem] mb-2 md:mb-4">
        {{ game.price }} Baht
      </p>

      <!-- Action Buttons -->
      <div class="flex gap-2 mt-auto">
        <router-link
          :to="`/product/${game.id || game._id}`"
          class="flex-grow text-primary border border-primary hover:bg-primary hover:text-white hover:shadow-[0_4px_10px_rgba(54,1,133,0.3)] transition-all py-1.5 px-3 rounded-md font-semibold text-xs md:text-sm text-center flex items-center justify-center no-underline"
        >
          View
        </router-link>

        <button
          type="button"
          @click="handleAddToCart(game.id || game._id)"
          class="bg-gradient-to-br from-accent-red to-accent-yellow hover:from-accent-yellow hover:to-accent-red hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(222,26,88,0.4)] text-white border-0 rounded-lg w-10 md:w-[45px] min-h-[36px] md:min-h-[38px] flex items-center justify-center cursor-pointer transition-all shadow-sm"
          title="Add to Cart"
          data-test="add-to-cart-btn"
        >
          <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>
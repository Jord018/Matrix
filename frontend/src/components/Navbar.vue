<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const isCategoryOpen = ref(false)
const isMobileMenuOpen = ref(false)

const categories = ref([
  { id: 1, name: 'Action' },
  { id: 2, name: 'RPG' }
])
const cartItemCount = ref(0)

const search = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
    isMobileMenuOpen.value = false
  }
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-primary shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
    <div class="container mx-auto px-4 flex justify-between items-center h-16">
      <!-- Logo & Brand -->
      <router-link to="/" class="flex items-center text-decoration-none">
        <img class="h-[45px] rounded-full hover:scale-105 transition-transform" src="/image/logo.png" alt="Logo-Jerry">
        <span class="text-white font-bold ml-2 hidden sm:block text-xl" style="font-family: 'Expletus Sans', sans-serif;">Mouse Jerry</span>
      </router-link>

      <!-- Middle: Search Bar (Desktop) -->
      <div class="hidden lg:flex flex-1 max-w-[400px] mx-8 order-2">
        <form @submit.prevent="search" class="relative w-full">
          <input v-model="searchQuery" 
                 class="w-full border-0 shadow-sm rounded-full pl-4 pr-10 py-2 bg-white/95 focus:outline-none text-gray-800" 
                 type="search" 
                 placeholder="Search epic games...">
          <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"></i>
        </form>
      </div>

      <!-- Right: Menus -->
      <div class="flex items-center gap-4 lg:gap-5 order-3">
        <!-- Desktop Nav Links -->
        <ul class="hidden lg:flex items-center gap-6 m-0 p-0 list-none mr-2">
          <!-- Category Dropdown -->
          <li class="relative" @mouseleave="isCategoryOpen = false">
            <button @mouseover="isCategoryOpen = true" class="text-white font-bold flex items-center hover:text-accent-yellow transition-colors py-2">
              <i class="fa-solid fa-gamepad text-accent-yellow mr-2"></i> Category
            </button>
            <ul v-show="isCategoryOpen" class="absolute top-full left-0 mt-0 w-48 bg-white rounded-xl shadow-lg overflow-hidden py-2 z-50 list-none p-0">
              <li v-for="cat in categories" :key="cat.id">
                <router-link :to="'/category/' + encodeURIComponent(cat.name)" class="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100">
                  {{ cat.name }}
                </router-link>
              </li>
              <li v-if="categories.length === 0" class="px-4 py-2 text-gray-500">No Categories Found</li>
            </ul>
          </li>
          <li>
            <router-link to="/contact" class="text-white font-bold flex items-center hover:text-accent-yellow transition-colors py-2">
              <i class="fa-solid fa-envelope text-accent-yellow mr-2"></i> Contact
            </router-link>
          </li>
        </ul>

        <!-- Cart -->
        <router-link to="/cart" class="text-white text-xl relative hover:scale-110 transition-transform">
          <i class="fa-solid fa-cart-shopping"></i>
          <span v-if="cartItemCount > 0" class="absolute -top-2 -right-3 bg-red-600 text-white text-[0.65rem] px-2 py-0.5 rounded-full border-2 border-primary">
            {{ cartItemCount }}
          </span>
        </router-link>

        <!-- User Icon (Placeholder for Login) -->
        <router-link to="/login" class="text-white text-xl hover:scale-110 transition-transform">
          <i class="fa-solid fa-user"></i>
        </router-link>

        <!-- Mobile Menu Toggle -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="lg:hidden text-white text-2xl ml-1 focus:outline-none">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Collapse -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-primary px-4 pb-4">
      <form @submit.prevent="search" class="relative w-full mt-2 mb-4">
        <input v-model="searchQuery" class="w-full border-0 shadow-sm rounded-full pl-4 pr-10 py-2 bg-white/95 focus:outline-none text-gray-800" type="search" placeholder="Search epic games...">
        <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"></i>
      </form>
      <div class="flex flex-col gap-3">
        <div class="text-white font-bold flex items-center"><i class="fa-solid fa-gamepad text-accent-yellow mr-2"></i> Category</div>
        <router-link to="/contact" class="text-white font-bold flex items-center"><i class="fa-solid fa-envelope text-accent-yellow mr-2"></i> Contact</router-link>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { api } from "../api";
import { auth, loadUser } from "../auth";

const router = useRouter();
const cartStore = useCartStore();

const searchQuery = ref("");
const categoryDropdownRef = ref(null);
const isCategoryOpen = ref(false);
const isCategoryPinned = ref(false);
const isMobileMenuOpen = ref(false);

const toggleCategory = (e) => {
  e?.stopPropagation();
  isCategoryPinned.value = !isCategoryPinned.value;
  isCategoryOpen.value = isCategoryPinned.value;
};

const handleMouseOver = () => {
  isCategoryOpen.value = true;
};

const handleMouseLeave = () => {
  if (!isCategoryPinned.value) {
    isCategoryOpen.value = false;
  }
};

const closeCategory = (e) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target)) {
    isCategoryOpen.value = false;
    isCategoryPinned.value = false;
  }
};

const categories = ref([]);

const extractCategoriesFromGames = (games) => {
  const catSet = new Set();
  for (const g of games) {
    if (Array.isArray(g.categories)) {
      g.categories.forEach((c) => catSet.add(c));
    } else if (typeof g.category === "string") {
      catSet.add(g.category);
    }
  }
  return Array.from(catSet, (name, i) => ({ id: i + 1, name }));
};

const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return null;
};

const fetchCategories = async () => {
  const res = await api("/categories").catch(() => null);
  const list = extractList(res);
  if (Array.isArray(list) && list.length > 0) {
    categories.value = list.filter((c) => c.isVisible !== false);
    return;
  }

  const games = await api("/games").catch(() => []);
  const gamesList = extractList(games) || [];
  if (Array.isArray(gamesList) && gamesList.length > 0) {
    const extracted = extractCategoriesFromGames(gamesList);
    if (extracted.length > 0) {
      categories.value = extracted;
    }
  }
};

onMounted(() => {
  fetchCategories();
  loadUser();
  window.addEventListener("click", closeCategory);
});

onUnmounted(() => {
  window.removeEventListener("click", closeCategory);
});

const search = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: "/search", query: { q: searchQuery.value.trim() } });
    isMobileMenuOpen.value = false;
  }
};
</script>

<template>
  <nav class="sticky top-0 z-50 custom-navbar bg-primary shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
    <div class="store-container flex justify-between items-center py-2">
      <!-- Left side: Brand + Nav Links (Category, Contact) -->
      <div class="flex items-center">
        <!-- Logo & Brand -->
        <router-link to="/" class="flex items-center no-underline group me-4">
          <img
            class="h-[45px] w-auto rounded-full transition-all duration-300 hover:scale-105 hover:-rotate-5 hover:shadow-[0_0_15px_#F4B342]"
            src="/image/logo.png"
            alt="Logo-Jerry"
          />
          <span
            class="text-white font-bold ml-2 hidden sm:block text-xl font-['Expletus_Sans',sans-serif]"
          >
            Mouse Jerry
          </span>
        </router-link>

        <!-- Desktop Nav Links (Next to Brand) -->
        <ul class="hidden lg:flex items-center gap-4 m-0 p-0 list-none ms-3">
          <!-- Category Dropdown -->
          <li ref="categoryDropdownRef" class="relative" @mouseleave="handleMouseLeave">
            <button
              type="button"
              @click="toggleCategory"
              @mouseover="handleMouseOver"
              @focus="handleMouseOver"
              class="text-white font-bold flex items-center hover:text-accent-yellow transition-colors py-2 px-2 focus:outline-none cursor-pointer"
            >
              <i class="fa-solid fa-gamepad text-accent-yellow mr-2"></i>
              Category
              <i
                class="fa-solid fa-chevron-down text-[0.65rem] ml-1.5 opacity-80 transition-transform duration-200"
                :class="{ 'rotate-180': isCategoryOpen }"
              ></i>
            </button>
            <ul
              v-show="isCategoryOpen"
              class="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl overflow-hidden py-2 z-50 list-none p-0 border-0 animate-slide-fade category-scroll"
            >
              <li v-for="cat in categories" :key="cat.id || cat.name">
                <router-link
                  :to="'/category/' + encodeURIComponent(cat.name)"
                  class="dropdown-item block px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 hover:text-primary transition-all text-sm"
                  @click="isCategoryOpen = false; isCategoryPinned = false;"
                >
                  {{ cat.name }}
                </router-link>
              </li>
              <li
                v-if="categories.length === 0"
                class="px-5 py-2 text-gray-500 text-sm"
              >
                No Categories Found
              </li>
            </ul>
          </li>

          <!-- Contact Link -->
          <li>
            <router-link
              to="/contact"
              class="text-white font-bold flex items-center hover:text-accent-yellow transition-colors py-2 px-2"
            >
              <i class="fa-solid fa-envelope text-accent-yellow mr-2"></i>
              Contact
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Center / Right: Search Bar (Desktop) -->
      <div class="hidden lg:flex flex-1 max-w-[400px] mx-6 justify-end ms-auto me-6">
        <form @submit.prevent="search" class="relative w-full">
          <label for="desktop-search" class="sr-only">Search epic games</label>
          <input
            id="desktop-search"
            v-model="searchQuery"
            class="w-full border-0 shadow-sm rounded-full pl-5 pr-10 py-2.5 bg-white/95 focus:outline-none text-gray-800 text-sm font-medium"
            type="search"
            placeholder="Search epic games..."
          />
          <i
            class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-base"
          ></i>
        </form>
      </div>

      <!-- Right Side: Cart & User Icons + Mobile Toggler -->
      <div class="flex items-center gap-4">
        <!-- Cart Icon -->
        <router-link
          to="/cart"
          class="text-white text-xl relative transition-all duration-200 hover:scale-110 hover:text-accent-yellow"
          title="Shopping Cart"
        >
          <i class="fa-solid fa-cart-shopping"></i>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-2 -right-3 bg-red-600 text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full border-2 border-primary min-w-[20px] text-center"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>

        <!-- User: profile when signed in (name shown on desktop), otherwise login -->
        <router-link
          v-if="auth.user"
          to="/profile"
          class="text-white flex items-center gap-2 font-bold transition-all duration-200 hover:scale-105 hover:text-accent-yellow"
          title="My Profile"
          data-test="profile-link"
        >
          <i class="fa-regular fa-circle-user text-2xl"></i>
          <span class="hidden lg:inline">{{ auth.user.Username }}</span>
        </router-link>
        <router-link
          v-else
          to="/login"
          class="text-white text-xl transition-all duration-200 hover:scale-110 hover:text-accent-yellow"
          title="Login"
          data-test="login-link"
        >
          <i class="fa-solid fa-user"></i>
        </router-link>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden text-white text-2xl focus:outline-none cursor-pointer"
          aria-label="Toggle navigation"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-primary px-4 pb-4 border-t border-white/10 pt-3">
      <form @submit.prevent="search" class="relative w-full mb-4">
        <label for="mobile-search" class="sr-only">Search epic games</label>
        <input
          id="mobile-search"
          v-model="searchQuery"
          class="w-full border-0 shadow-sm rounded-full pl-5 pr-10 py-2.5 bg-white/95 focus:outline-none text-gray-800 text-sm font-medium"
          type="search"
          placeholder="Search epic games..."
        />
        <i
          class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
        ></i>
      </form>
      <div class="flex flex-col gap-3">
        <div>
          <button
            type="button"
            @click="isCategoryOpen = !isCategoryOpen"
            class="text-white font-bold flex items-center justify-between w-full py-1 focus:outline-none"
          >
            <span class="flex items-center">
              <i class="fa-solid fa-gamepad text-accent-yellow mr-2"></i> Category
            </span>
            <i :class="isCategoryOpen ? 'fa-chevron-up' : 'fa-chevron-down'" class="fa-solid text-xs text-white/70"></i>
          </button>
          <div v-show="isCategoryOpen" class="bg-black/20 rounded-lg p-2 mt-2 space-y-1 max-h-48 overflow-y-auto">
            <router-link
              v-for="cat in categories"
              :key="cat.id || cat.name"
              :to="'/category/' + encodeURIComponent(cat.name)"
              class="block px-3 py-1.5 text-sm text-white/90 hover:text-accent-yellow"
              @click="isMobileMenuOpen = false"
            >
              {{ cat.name }}
            </router-link>
          </div>
        </div>
        <router-link
          to="/contact"
          class="text-white font-bold flex items-center py-1 hover:text-accent-yellow transition-colors"
          @click="isMobileMenuOpen = false"
        >
          <i class="fa-solid fa-envelope text-accent-yellow mr-2"></i>
          Contact
        </router-link>
      </div>
    </div>
  </nav>
</template>

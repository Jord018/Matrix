<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '../admin.css'

const router = useRouter()
const search = ref('')
const open = ref(false)

const links = [
  { to: '/admin/back-game', label: 'Game' },
  { to: '/admin/back-category', label: 'Category' },
  { to: '/admin/back-highlight', label: 'Highlight' },
  { to: '/admin/back-sale-history', label: 'Sale History' },
]

const submit = () => {
  router.push({ path: '/admin/back-game', query: search.value.trim() ? { search: search.value.trim() } : {} })
  open.value = false
}
</script>

<template>
  <div class="admin-shell">
    <!-- Old back-navbar: purple bar, Bungee gradient brand, yellow links with underline -->
    <nav class="admin-nav">
      <div class="px-4 flex flex-wrap items-center justify-between py-3">
        <router-link to="/admin/back-game" class="admin-brand">Mouse Jerry</router-link>

        <button type="button" aria-label="Toggle navigation" class="lg:hidden text-accent-yellow text-2xl" @click="open = !open">
          <i class="fa-solid fa-bars"></i>
        </button>

        <div :class="[open ? 'flex' : 'hidden', 'lg:flex w-full lg:w-auto flex-col lg:flex-row lg:flex-1 lg:items-center gap-3 mt-3 lg:mt-0']">
          <form @submit.prevent="submit" class="flex lg:w-1/4 lg:ml-3">
            <input v-model="search" type="search" name="search" placeholder="Search games" aria-label="Search games" class="admin-search w-full" />
            <button type="submit" class="admin-search-btn ml-2 hidden md:block">Search</button>
          </form>

          <ul class="lg:ml-auto flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-12">
            <li v-for="l in links" :key="l.to">
              <router-link :to="l.to" class="admin-nav-link" active-class="active">{{ l.label }}</router-link>
            </li>
            <li>
              <router-link to="/admin/back-profile" aria-label="Profile" class="admin-nav-link text-3xl" active-class="active">
                <i class="fa-regular fa-circle-user"></i>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="admin-fade-in">
      <RouterView />
    </div>
  </div>
</template>

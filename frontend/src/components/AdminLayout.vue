<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
  <nav class="bg-gray-900 border-b border-gray-700">
    <div class="px-4 flex flex-wrap items-center justify-between py-3">
      <router-link to="/admin/back-game" class="text-white font-bold text-xl">Mouse Jerry</router-link>

      <button type="button" aria-label="Toggle navigation" class="lg:hidden text-white text-2xl" @click="open = !open">☰</button>

      <div :class="[open ? 'flex' : 'hidden', 'lg:flex w-full lg:w-auto flex-col lg:flex-row lg:flex-1 lg:items-center gap-3 mt-3 lg:mt-0']">
        <form @submit.prevent="submit" class="flex lg:w-1/4 lg:ml-3">
          <input v-model="search" type="search" name="search" placeholder="Search games" aria-label="Search games"
                 class="w-full rounded px-3 py-1 bg-white text-gray-800" />
          <button type="submit" class="ml-2 hidden md:block border border-white text-white rounded px-3 py-1">Search</button>
        </form>

        <ul class="lg:ml-auto flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4">
          <li v-for="l in links" :key="l.to">
            <router-link :to="l.to" class="text-gray-300 hover:text-white" active-class="!text-white font-bold">{{ l.label }}</router-link>
          </li>
          <li>
            <router-link to="/admin/back-profile" aria-label="Profile" class="text-gray-300 hover:text-white" active-class="!text-white">
              <svg class="w-6 h-6 inline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5Z" /></svg>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="admin-fade-in">
    <RouterView />
  </div>
</template>

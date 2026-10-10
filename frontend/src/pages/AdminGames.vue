<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const router = useRouter()
const games = ref([])

const load = async () => {
  const search = route.query.search || ''
  games.value = await api(`/admin/games${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  if (search && games.value.length === 0) {
    alert(`Not found: "${search}"`)
    router.replace('/admin/back-game')
  }
}

watch(() => route.query.search, load, { immediate: true })

const remove = async (game) => {
  if (!confirm('Are you sure you want to delete this game?')) return
  await api(`/admin/games/${game.id}`, { method: 'DELETE' })
  games.value = games.value.filter((g) => g.id !== game.id)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-primary mb-4">Back-Office Game Page</h1>

    <div v-if="route.query.search" data-test="search-banner" class="mb-4 rounded border border-accent-red bg-primary p-3 text-accent-yellow">
      Showing search results for: <strong>"{{ route.query.search }}"</strong>
      <router-link to="/admin/back-game" class="ml-3 border border-white text-white rounded px-2 py-0.5 text-sm">Clear Search</router-link>
    </div>

    <table class="hidden md:table w-full text-center bg-white rounded-lg shadow">
      <thead>
        <tr class="bg-primary text-white">
          <th class="p-2">Image</th><th>Game name</th><th>Game Price</th><th>Game Stock</th><th>Edit</th><th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="g in games" :key="g.id" data-test="game-row" class="border-b">
          <td class="p-2"><img :src="g.coverImage" :alt="g.name" class="h-16 mx-auto rounded" /></td>
          <td>{{ g.name }}</td>
          <td>{{ g.price }} baht</td>
          <td>{{ g.stock }}</td>
          <td><router-link :to="`/admin/edit-game/${g.id}`" class="bg-accent-yellow text-black rounded px-3 py-1">Edit</router-link></td>
          <td><button type="button" class="bg-accent-red text-white rounded px-3 py-1" @click="remove(g)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden space-y-4">
      <div v-for="g in games" :key="g.id" data-test="game-card" class="rounded-lg border-2 border-accent-red bg-white overflow-hidden">
        <img :src="g.coverImage" :alt="g.name" class="w-full h-40 object-cover" />
        <div class="p-3">
          <h2 class="font-bold text-lg">{{ g.name }}</h2>
          <p>Game Price: {{ g.price }} Baht</p>
          <p>Game Stock: {{ g.stock }}</p>
          <div class="flex gap-2 mt-2">
            <router-link :to="`/admin/edit-game/${g.id}`" class="flex-1 text-center bg-accent-yellow rounded px-3 py-1">Edit</router-link>
            <button type="button" class="flex-1 bg-accent-red text-white rounded px-3 py-1" @click="remove(g)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <router-link to="/admin/add-game" aria-label="Add game"
                 class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-red text-white text-3xl flex items-center justify-center shadow-lg">+</router-link>
  </div>
</template>

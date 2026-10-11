<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const games = ref([])

// Old URLs address categories by name; the API uses ids, so resolve first.
watch(() => route.params.name, async (name) => {
  const cat = (await api('/admin/categories')).find((c) => c.name === name)
  games.value = cat ? await api(`/admin/categories/${cat.id}/games`) : []
}, { immediate: true })

const remove = async (game) => {
  if (!confirm('Are you sure you want to delete this game?')) return
  await api(`/admin/games/${game.id}`, { method: 'DELETE' })
  games.value = games.value.filter((g) => g.id !== game.id)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-primary mb-4">Category: {{ route.params.name }}</h1>
    <p v-if="!games.length" data-test="empty">No games in this category.</p>
    <ul class="space-y-3">
      <li v-for="g in games" :key="g.id" data-test="game" class="flex items-center gap-3 bg-white rounded-lg shadow p-3">
        <img :src="g.coverImage" :alt="g.name" class="h-14 rounded" />
        <span class="flex-1 font-bold">{{ g.name }}</span>
        <span>{{ g.price }} baht</span>
        <span>Stock {{ g.stock }}</span>
        <router-link :to="`/admin/edit-game/${g.id}`" class="bg-accent-yellow rounded px-3 py-1">Edit</router-link>
        <button type="button" class="bg-accent-red text-white rounded px-3 py-1" @click="remove(g)">Delete</button>
      </li>
    </ul>
  </div>
</template>

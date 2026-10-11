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
  <div class="store-container">
    <h1 class="page-title">Category: {{ route.params.name }}</h1>
    <p v-if="!games.length" data-test="empty">No games in this category.</p>

    <table v-else class="admin-table hidden md:table">
      <thead>
        <tr><th>Image</th><th>Game name</th><th>Game Price</th><th>Game Stock</th><th>Edit</th><th>Delete</th></tr>
      </thead>
      <tbody>
        <tr v-for="g in games" :key="g.id" data-test="game">
          <td><img :src="g.coverImage" :alt="g.name" class="game-img" /></td>
          <td>{{ g.name }}</td>
          <td>{{ g.price }} baht</td>
          <td>{{ g.stock }}</td>
          <td><router-link :to="`/admin/edit-game/${g.id}`" class="btn-edit">Edit</router-link></td>
          <td><button type="button" class="btn-delete" @click="remove(g)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden">
      <div v-for="g in games" :key="g.id" class="admin-card">
        <img :src="g.coverImage" :alt="g.name" class="w-full rounded-lg mb-4" />
        <h2 class="admin-card-title">{{ g.name }}</h2>
        <p>Game Price: {{ g.price }} Baht</p>
        <p>Game Stock: {{ g.stock }}</p>
        <div class="flex justify-between gap-2 mt-2">
          <router-link :to="`/admin/edit-game/${g.id}`" class="btn-edit">Edit</router-link>
          <button type="button" class="btn-delete" @click="remove(g)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

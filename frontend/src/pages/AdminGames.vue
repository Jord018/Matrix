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
  <div class="store-container">
    <h1 class="page-title">Back-Office Game Page</h1>

    <div v-if="route.query.search" data-test="search-banner" class="search-banner">
      Showing search results for: <strong>"{{ route.query.search }}"</strong>
      <router-link to="/admin/back-game" class="ml-3 border border-white text-white rounded px-2 py-0.5 text-sm">Clear Search</router-link>
    </div>

    <table class="admin-table hidden md:table">
      <thead>
        <tr>
          <th>Image</th><th>Game name</th><th>Game Price</th><th>Game Stock</th><th>Edit</th><th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="g in games" :key="g.id" data-test="game-row">
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
      <div v-for="g in games" :key="g.id" data-test="game-card" class="admin-card">
        <img :src="g.coverImage" :alt="g.name" class="w-full rounded-lg mb-4" />
        <div>
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

    <router-link to="/admin/add-game" aria-label="Add game" class="btn-add">+</router-link>
  </div>
</template>

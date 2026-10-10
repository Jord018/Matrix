<script setup>
import { useRouter } from 'vue-router'
import { api } from '../api'
import GameForm from '../components/GameForm.vue'

const router = useRouter()
const save = async (payload) => {
  await api('/admin/games', { method: 'POST', body: JSON.stringify(payload) })
  router.push('/admin/back-game')
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Add New Game</h1>
    <GameForm :save="save" />
  </div>
</template>

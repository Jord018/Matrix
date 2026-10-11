<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import GameForm from '../components/GameForm.vue'

const route = useRoute()
const router = useRouter()
const game = ref(null)
const notFound = ref(false)

watch(() => route.params.id, async (id) => {
  notFound.value = false
  try {
    game.value = await api(`/admin/games/${id}`)
  } catch {
    game.value = null
    notFound.value = true
  }
}, { immediate: true })

const save = async (payload) => {
  await api(`/admin/games/${route.params.id}`, { method: 'PUT', body: JSON.stringify(payload) })
  router.push('/admin/back-game')
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Edit Game</h1>
    <p v-if="notFound" role="alert">Game not found</p>
    <GameForm v-else-if="game" :game="game" :save="save" />
  </div>
</template>

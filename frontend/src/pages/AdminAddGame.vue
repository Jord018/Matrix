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
  <div class="store-container mb-12">
    <h1 class="page-title !text-[2rem]">Add New Game</h1>
    <GameForm :save="save" />
  </div>
</template>

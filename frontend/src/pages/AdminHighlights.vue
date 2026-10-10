<script setup>
import { ref } from 'vue'
import { api } from '../api'

const highlights = ref([])
const games = ref([])
const open = ref(false)
const form = ref({ gameId: '', customImage: '', buttonColor: '#8b0000' })
const error = ref('')

const load = async () => {
  const data = await api('/admin/highlights')
  highlights.value = data.highlights
  games.value = data.games
}
load()

const openModal = () => {
  form.value = { gameId: '', customImage: '', buttonColor: '#8b0000' }
  error.value = ''
  open.value = true
}

const save = async () => {
  try {
    await api('/admin/highlights', {
      method: 'POST',
      body: JSON.stringify({ ...form.value, customImage: form.value.customImage || null }),
    })
    open.value = false
    await load()
  } catch (e) {
    error.value = Object.values(e.data?.errors || {})[0]?.[0] || e.message
  }
}

const remove = async (h) => {
  if (!confirm('Remove this highlight?')) return
  await api(`/admin/highlights/${h.id}`, { method: 'DELETE' })
  highlights.value = highlights.value.filter((x) => x.id !== h.id)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-primary mb-4">Back-Office Highlight Page</h1>

    <p v-if="!highlights.length" data-test="empty" class="text-center">No Highlights Active</p>

    <table v-else class="hidden md:table w-full text-center bg-white rounded-lg shadow">
      <thead>
        <tr class="bg-primary text-white"><th class="p-2">Highlight Image</th><th>Target Game</th><th>Button Color</th><th>Delete</th></tr>
      </thead>
      <tbody>
        <tr v-for="h in highlights" :key="h.id" data-test="hl-row" class="border-b">
          <td class="p-2"><img :src="h.customImage" :alt="h.name" class="w-48 mx-auto rounded-lg object-cover" /></td>
          <td>{{ h.name }}</td>
          <td>
            <span class="inline-block w-4 h-4 rounded-full border align-middle" :style="{ backgroundColor: h.buttonColor }"></span>
            {{ h.buttonColor }}
          </td>
          <td><button type="button" class="bg-accent-red text-white rounded px-3 py-1" @click="remove(h)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden space-y-4">
      <div v-for="h in highlights" :key="h.id" data-test="hl-card" class="rounded-lg border-2 border-accent-red bg-white overflow-hidden">
        <img :src="h.customImage" :alt="h.name" class="w-full h-36 object-cover" />
        <div class="p-3">
          <h2 class="font-bold text-lg">{{ h.name }}</h2>
          <p>
            Color:
            <span class="inline-block w-4 h-4 rounded-full border align-middle" :style="{ backgroundColor: h.buttonColor }"></span>
            {{ h.buttonColor }}
          </p>
          <button type="button" class="w-full mt-2 bg-accent-red text-white rounded px-3 py-1" @click="remove(h)">Delete</button>
        </div>
      </div>
    </div>

    <button type="button" aria-label="Add highlight" class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-red text-white text-3xl shadow-lg" @click="openModal">+</button>

    <div v-if="open" role="dialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form class="bg-white rounded-xl p-6 w-full max-w-md" @submit.prevent="save">
        <h2 class="text-xl font-bold mb-3">New Highlight</h2>
        <p v-if="error" role="alert" class="text-accent-red mb-2">{{ error }}</p>

        <label for="hl-game" class="block font-bold">Target Game</label>
        <select id="hl-game" v-model="form.gameId" required class="w-full border rounded px-3 py-2 mb-3">
          <option value="" disabled>-- Select a game from store --</option>
          <option v-for="g in games" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>

        <label for="hl-image" class="block font-bold">Custom Banner Image URL</label>
        <input id="hl-image" v-model="form.customImage" type="url" placeholder="https://..." class="w-full border rounded px-3 py-2" />
        <p class="text-sm text-gray-500 mb-3">If left blank, the system will use the game's default cover art.</p>

        <label for="hl-color" class="block font-bold">"Shop Now" Button Color</label>
        <input id="hl-color" v-model="form.buttonColor" type="color" class="w-12 h-12 mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" class="bg-gray-500 text-white rounded px-4 py-2" @click="open = false">Cancel</button>
          <button type="submit" class="bg-primary text-white rounded px-4 py-2">Save to Homepage</button>
        </div>
      </form>
    </div>
  </div>
</template>

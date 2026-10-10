<script setup>
import { ref } from 'vue'
import { api } from '../api'

const categories = ref([])
const modal = ref(null) // { mode: 'add' | 'edit', category?, name }
const error = ref('')

const load = async () => { categories.value = await api('/admin/categories') }
load()

const toggle = async (cat) => {
  const next = !cat.isVisible
  cat.isVisible = next // optimistic
  try {
    await api(`/admin/categories/${cat.id}/visibility`, { method: 'PATCH', body: JSON.stringify({ isVisible: next }) })
  } catch {
    cat.isVisible = !next
    alert('An error occurred while saving the data')
  }
}

const openAdd = () => { error.value = ''; modal.value = { mode: 'add', name: '' } }
const openEdit = (cat) => { error.value = ''; modal.value = { mode: 'edit', category: cat, name: cat.name } }

const save = async () => {
  const { mode, category, name } = modal.value
  try {
    if (mode === 'add') await api('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) })
    else await api(`/admin/categories/${category.id}`, { method: 'PUT', body: JSON.stringify({ name }) })
    modal.value = null
    await load()
  } catch (e) {
    error.value = e.data?.errors?.name?.[0] || e.message
  }
}

const remove = async (cat) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  await api(`/admin/categories/${cat.id}`, { method: 'DELETE' })
  categories.value = categories.value.filter((c) => c.id !== cat.id)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-primary mb-4">Back-Office Categories Page</h1>

    <table class="hidden md:table w-full text-center bg-white rounded-lg shadow">
      <thead>
        <tr class="bg-primary text-white"><th class="p-2">Categories</th><th>Visibility</th><th>View Games</th><th>Edit</th><th>Delete</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id" data-test="cat-row" class="border-b">
          <td class="p-2">{{ c.name }}</td>
          <td>
            <button type="button" data-test="eye" :aria-label="`Toggle ${c.name}`" :class="c.isVisible ? '' : 'text-gray-500'" @click="toggle(c)">
              {{ c.isVisible ? '👁' : '🚫' }}
            </button>
          </td>
          <td><router-link :to="`/admin/back-category/${encodeURIComponent(c.name)}`" class="bg-accent-yellow rounded px-3 py-1">View</router-link></td>
          <td><button type="button" class="bg-accent-yellow rounded px-3 py-1" @click="openEdit(c)">Edit</button></td>
          <td><button type="button" class="bg-accent-red text-white rounded px-3 py-1" @click="remove(c)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden space-y-4">
      <div v-for="c in categories" :key="c.id" data-test="cat-card" class="rounded-lg border-2 border-accent-red bg-white p-3">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-bold text-lg">{{ c.name }}</h2>
          <button type="button" :aria-label="`Toggle ${c.name}`" @click="toggle(c)">{{ c.isVisible ? '👁' : '🚫' }}</button>
        </div>
        <div class="flex gap-2">
          <router-link :to="`/admin/back-category/${encodeURIComponent(c.name)}`" class="flex-1 text-center bg-accent-yellow rounded px-3 py-1">View</router-link>
          <button type="button" class="flex-1 bg-accent-yellow rounded px-3 py-1" @click="openEdit(c)">Edit</button>
          <button type="button" class="flex-1 bg-accent-red text-white rounded px-3 py-1" @click="remove(c)">Delete</button>
        </div>
      </div>
    </div>

    <button type="button" aria-label="Add category" class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-red text-white text-3xl shadow-lg" @click="openAdd">+</button>

    <div v-if="modal" role="dialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form class="bg-white rounded-xl p-6 w-full max-w-md" @submit.prevent="save">
        <h2 class="text-xl font-bold mb-3">{{ modal.mode === 'add' ? 'Add New Category' : 'Edit Category' }}</h2>
        <p v-if="modal.mode === 'edit'" class="mb-2">Current Name: <strong>{{ modal.category.name }}</strong></p>
        <p v-if="error" role="alert" class="text-accent-red mb-2">{{ error }}</p>
        <label for="cat-name" class="block font-bold">{{ modal.mode === 'add' ? 'Category Name :' : 'New Name :' }}</label>
        <input id="cat-name" v-model="modal.name" required class="w-full border rounded px-3 py-2 mb-4" placeholder="Enter category name" />
        <div class="flex justify-end gap-2">
          <button type="button" class="bg-gray-500 text-white rounded px-4 py-2" @click="modal = null">Cancel</button>
          <button type="submit" class="bg-primary text-white rounded px-4 py-2">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

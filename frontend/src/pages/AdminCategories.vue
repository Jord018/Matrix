<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const categories = ref([])
const modal = ref(null) // { mode: 'add' | 'edit', category?, name }
const error = ref('')

const load = async () => { categories.value = await api('/admin/categories') }
onMounted(load)

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
  <div class="store-container">
    <h1 class="page-title">Back-Office Categories Page</h1>

    <table class="admin-table centered hidden md:table">
      <thead>
        <tr><th>Categories</th><th>Visibility</th><th>View Games</th><th>Edit</th><th>Delete</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id" data-test="cat-row">
          <td>{{ c.name }}</td>
          <td>
            <button type="button" data-test="eye" :aria-label="`Toggle ${c.name}`" :class="['btn-eye', { off: !c.isVisible }]" @click="toggle(c)">
              <i :class="c.isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
            </button>
          </td>
          <td><router-link :to="`/admin/back-category/${encodeURIComponent(c.name)}`" class="btn-edit">View</router-link></td>
          <td><button type="button" class="btn-edit" @click="openEdit(c)">Edit</button></td>
          <td><button type="button" class="btn-delete" @click="remove(c)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden">
      <div v-for="c in categories" :key="c.id" data-test="cat-card" class="admin-card">
        <div class="flex justify-between items-center mb-3">
          <h2 class="admin-card-title !mb-0">{{ c.name }}</h2>
          <button type="button" :aria-label="`Toggle ${c.name}`" :class="['btn-eye', { off: !c.isVisible }]" @click="toggle(c)">
            <i :class="c.isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
          </button>
        </div>
        <div class="flex justify-between gap-2">
          <router-link :to="`/admin/back-category/${encodeURIComponent(c.name)}`" class="btn-edit">View</router-link>
          <button type="button" class="btn-edit" @click="openEdit(c)">Edit</button>
          <button type="button" class="btn-delete" @click="remove(c)">Delete</button>
        </div>
      </div>
    </div>

    <button type="button" aria-label="Add category" class="btn-add" @click="openAdd">+</button>

    <dialog v-if="modal" open class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 border-0 p-0 m-0 max-w-none max-h-none w-full h-full">
      <form class="admin-modal" @submit.prevent="save">
        <h2>{{ modal.mode === 'add' ? 'Add New Category' : 'Edit Category' }}</h2>
        <p v-if="modal.mode === 'edit'" class="mb-2">Current Name: <strong>{{ modal.category.name }}</strong></p>
        <p v-if="error" role="alert" class="text-accent-red mb-2">{{ error }}</p>
        <label for="cat-name" class="block font-bold">{{ modal.mode === 'add' ? 'Category Name :' : 'New Name :' }}</label>
        <input id="cat-name" v-model="modal.name" required class="form-control mt-1 mb-4" placeholder="Enter category name" />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-cancel" @click="modal = null">Cancel</button>
          <button type="submit" class="btn-save">Save</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

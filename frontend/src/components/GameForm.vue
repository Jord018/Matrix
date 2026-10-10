<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '../api'
import { parseRequirements, formatRequirements } from '../requirements'

// `save(payload)` is async; a rejected promise (e.g. 422) is shown in the error list.
const props = defineProps({ game: { type: Object, default: null }, save: { type: Function, required: true } })

const SLOTS = 5
const name = ref('')
const price = ref('')
const stock = ref('')
const coverImage = ref('')
const screenshots = ref(Array(SLOTS).fill(''))
const categories = ref([])
const description = ref('')
const requirements = ref(formatRequirements(null))
const options = ref([])
const pick = ref('')
const errors = ref({})

// image URL modal: target is 'cover' or a screenshot index
const modalTarget = ref(null)
const modalUrl = ref('')

watch(() => props.game, (g) => {
  if (!g) return
  name.value = g.name
  price.value = g.price
  stock.value = g.stock
  coverImage.value = g.coverImage || ''
  screenshots.value = Array.from({ length: SLOTS }, (_, i) => g.screenshots?.[i] || '')
  categories.value = [...(g.categories || [])]
  description.value = g.description || ''
  requirements.value = formatRequirements(g.systemRequirements)
}, { immediate: true })

onMounted(async () => {
  options.value = (await api('/admin/categories')).map((c) => c.name)
})

const openModal = (target) => { modalTarget.value = target; modalUrl.value = '' }
const applyUrl = () => {
  const url = modalUrl.value.trim()
  if (!url) return alert('Please enter a valid URL')
  if (modalTarget.value === 'cover') coverImage.value = url
  else screenshots.value[modalTarget.value] = url
  modalTarget.value = null
}

const addCategory = () => {
  if (!pick.value) return
  if (categories.value.includes(pick.value)) alert('This category has already been added')
  else categories.value.push(pick.value)
  pick.value = ''
}

const submit = async () => {
  errors.value = {}
  try {
    await props.save({
      name: name.value,
      price: price.value,
      stock: stock.value,
      coverImage: coverImage.value || null,
      screenshots: screenshots.value.filter(Boolean),
      categories: categories.value,
      description: description.value,
      systemRequirements: parseRequirements(requirements.value),
    })
  } catch (e) {
    errors.value = e.data?.errors || { form: [e.message] }
  }
}
</script>

<template>
  <form class="bg-white rounded-lg shadow p-4" @submit.prevent="submit">
    <ul v-if="Object.keys(errors).length" role="alert" data-test="errors" class="mb-4 text-accent-red list-disc pl-5">
      <li v-for="(msgs, field) in errors" :key="field">{{ msgs[0] }}</li>
    </ul>

    <div class="flex flex-wrap gap-6 mb-4">
      <div class="relative w-40 h-52">
        <template v-if="coverImage">
          <button type="button" aria-label="Remove cover" class="absolute top-1 right-1 z-10 bg-white rounded px-1" @click="coverImage = ''">X</button>
          <img :src="coverImage" alt="Main Image" class="w-full h-full object-cover rounded-lg" />
        </template>
        <button v-else type="button" aria-label="Add cover" class="w-full h-full rounded-lg border-2 border-dashed text-4xl text-gray-500 bg-gray-200" @click="openModal('cover')">+</button>
      </div>

      <div class="flex-1 min-w-[240px] space-y-3">
        <div>
          <label for="name" class="block font-bold">Game name</label>
          <input id="name" v-model="name" required class="w-full border rounded px-3 py-2" placeholder="Enter game name" />
        </div>
        <div class="flex gap-3">
          <div class="flex-1">
            <label for="price" class="block font-bold">Game Price</label>
            <input id="price" v-model="price" type="number" min="0" step="any" required class="w-full border rounded px-3 py-2" />
          </div>
          <div class="flex-1">
            <label for="stock" class="block font-bold">Game Stock</label>
            <input id="stock" v-model="stock" type="number" min="0" step="1" required class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <router-link to="/admin/back-game" class="bg-gray-500 text-white rounded px-4 py-2">Cancel</router-link>
          <button type="submit" class="bg-primary text-white rounded px-4 py-2">Save</button>
        </div>
      </div>
    </div>

    <hr class="mb-4" />

    <p class="font-bold">Screenshots (5 slots) :</p>
    <div class="flex flex-wrap gap-3 mb-4">
      <div v-for="(url, i) in screenshots" :key="i" class="relative w-[150px] h-[90px]" data-test="slot">
        <template v-if="url">
          <button type="button" :aria-label="`Remove screenshot ${i}`" class="absolute top-1 right-1 z-10 bg-white rounded px-1" @click="screenshots[i] = ''">X</button>
          <img :src="url" alt="Screenshot" class="w-full h-full object-cover rounded-lg" />
        </template>
        <button v-else type="button" :aria-label="`Add screenshot ${i}`" class="w-full h-full rounded-lg border-2 border-dashed text-2xl text-gray-500 bg-gray-200" @click="openModal(i)">+</button>
      </div>
    </div>

    <p class="font-bold">Category :</p>
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <span v-for="c in categories" :key="c" data-test="tag" class="bg-gray-500 text-white rounded px-2 py-1">
        {{ c }}
        <button type="button" :aria-label="`Remove ${c}`" class="ml-2" @click="categories = categories.filter((x) => x !== c)">X</button>
      </span>
      <select v-model="pick" aria-label="Add category" class="border rounded px-2 py-1">
        <option value="">-- Add Category --</option>
        <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
      </select>
      <button type="button" class="bg-primary text-white rounded px-3 py-1" @click="addCategory">+</button>
    </div>

    <label for="description" class="block font-bold">Description :</label>
    <textarea id="description" v-model="description" rows="6" class="w-full border rounded px-3 py-2 mb-4" placeholder="Enter game description"></textarea>

    <label for="require" class="block font-bold">System Requirements :</label>
    <textarea id="require" v-model="requirements" rows="5" class="w-full border rounded px-3 py-2"></textarea>
  </form>

  <div v-if="modalTarget !== null" role="dialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-xl p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-3">Add Image URL</h2>
      <input v-model="modalUrl" type="url" placeholder="https://..." aria-label="Image URL" class="w-full border rounded px-3 py-2 mb-4" />
      <div class="flex justify-end gap-2">
        <button type="button" class="bg-gray-500 text-white rounded px-4 py-2" @click="modalTarget = null">Cancel</button>
        <button type="button" class="bg-primary text-white rounded px-4 py-2" @click="applyUrl">Confirm</button>
      </div>
    </div>
  </div>
</template>

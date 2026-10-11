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
  <form class="edit-container" @submit.prevent="submit">
    <ul v-if="Object.keys(errors).length" role="alert" data-test="errors" class="mb-4 text-accent-red list-disc pl-5">
      <li v-for="(msgs, field) in errors" :key="field">{{ msgs[0] }}</li>
    </ul>

    <div class="flex flex-wrap gap-6 mb-4">
      <div class="img-box w-40 h-52">
        <template v-if="coverImage">
          <button type="button" aria-label="Remove cover" class="btn-x" @click="coverImage = ''">X</button>
          <img :src="coverImage" alt="Main Image" class="w-full h-full object-cover rounded-lg" />
        </template>
        <button v-else type="button" aria-label="Add cover" class="img-box-empty text-4xl" @click="openModal('cover')">+</button>
      </div>

      <div class="flex-1 min-w-[240px] space-y-3">
        <div>
          <label for="name" class="block font-bold mb-2">Game name</label>
          <input id="name" v-model="name" required class="form-control" placeholder="Enter game name" />
        </div>
        <div class="flex gap-3">
          <div class="flex-1">
            <label for="price" class="block font-bold mb-2">Game Price</label>
            <input id="price" v-model="price" type="number" min="0" step="any" required class="form-control" placeholder="0" />
          </div>
          <div class="flex-1">
            <label for="stock" class="block font-bold mb-2">Game Stock</label>
            <input id="stock" v-model="stock" type="number" min="0" step="1" required class="form-control" placeholder="0" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-3">
          <router-link to="/admin/back-game" class="btn-cancel">Cancel</router-link>
          <button type="submit" class="btn-save">Save</button>
        </div>
      </div>
    </div>

    <hr class="mb-6 border-gray-300" />

    <p class="font-bold mb-2">Screenshots (5 slots) :</p>
    <div class="flex flex-wrap gap-3 mb-4">
      <div v-for="(url, i) in screenshots" :key="i" class="img-box w-[150px] h-[90px]" data-test="slot">
        <template v-if="url">
          <button type="button" :aria-label="`Remove screenshot ${i}`" class="btn-x" @click="screenshots[i] = ''">X</button>
          <img :src="url" alt="Screenshot" class="w-full h-full object-cover rounded-lg" />
        </template>
        <button v-else type="button" :aria-label="`Add screenshot ${i}`" class="img-box-empty text-2xl" @click="openModal(i)">+</button>
      </div>
    </div>

    <p class="font-bold mb-2">Category :</p>
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <span v-for="c in categories" :key="c" data-test="tag" class="category-tag">
        {{ c }}
        <button type="button" :aria-label="`Remove ${c}`" class="ml-2" @click="categories = categories.filter((x) => x !== c)">X</button>
      </span>
      <select v-model="pick" aria-label="Add category" class="form-select">
        <option value="">-- Add Category --</option>
        <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
      </select>
      <button type="button" class="btn-save !px-4" @click="addCategory">+</button>
    </div>

    <label for="description" class="block font-bold mb-2">Description :</label>
    <textarea id="description" v-model="description" class="form-control h-[300px] mb-6" placeholder="Enter game description"></textarea>

    <label for="require" class="block font-bold mb-2">System Requirements :</label>
    <textarea id="require" v-model="requirements" class="form-control h-[200px]" placeholder="OS: &#10;Processor: &#10;Memory: &#10;Graphics: &#10;Storage: "></textarea>
  </form>

  <div v-if="modalTarget !== null" role="dialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="admin-modal">
      <h2 class="!font-sans !text-[#333]">Add Image URL</h2>
      <input v-model="modalUrl" type="url" placeholder="https://..." aria-label="Image URL" class="form-control mb-4" />
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-cancel" @click="modalTarget = null">Cancel</button>
        <button type="button" class="btn-save" @click="applyUrl">Confirm</button>
      </div>
    </div>
  </div>
</template>

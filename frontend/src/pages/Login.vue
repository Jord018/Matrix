<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, isAdmin } from '../auth'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await login(username.value, password.value)
    router.push(route.query.redirect || (isAdmin() ? '/admin/back-game' : '/'))
  } catch (e) {
    error.value = e.status === 401 ? 'Invalid username or password' : 'Unable to log in, please try again'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-12 flex justify-center">
    <form @submit.prevent="submit" class="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-primary mb-4">Login</h1>
      <p v-if="error" role="alert" class="mb-3 text-accent-red">{{ error }}</p>
      <label for="username" class="block font-bold mb-1">Username</label>
      <input id="username" v-model="username" required class="w-full border rounded px-3 py-2 mb-3" />
      <label for="password" class="block font-bold mb-1">Password</label>
      <input id="password" v-model="password" type="password" required class="w-full border rounded px-3 py-2 mb-4" />
      <button type="submit" class="w-full bg-primary text-white font-bold rounded py-2">Login</button>
    </form>
  </div>
</template>

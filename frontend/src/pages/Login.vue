<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, isAdmin } from '../auth'
import AuthLayout from '../components/AuthLayout.vue'

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
  <AuthLayout title="Log in">
    <form @submit.prevent="submit">
      <div v-if="error" role="alert" class="error-box">{{ error }}</div>
      <div class="input-group">
        <input id="username" v-model="username" class="auth-input" placeholder=" " required />
        <label for="username" class="auth-label">Username</label>
      </div>
      <div class="input-group">
        <input id="password" v-model="password" type="password" class="auth-input" placeholder=" " required />
        <label for="password" class="auth-label">Password</label>
      </div>
      <p class="auth-subtitle">
        Welcome back! Please enter your details to access your account. Don't have an account?
        <RouterLink to="/register">Sign up here</RouterLink>
      </p>
      <button type="submit" class="auth-btn">Log In</button>
    </form>
  </AuthLayout>
</template>

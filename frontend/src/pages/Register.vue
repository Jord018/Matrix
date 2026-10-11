<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import AuthLayout from '../components/AuthLayout.vue'

const router = useRouter()
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const error = ref('')

// Messages copied from the old controllers/auth.js
const submit = async () => {
  error.value = ''
  if (form.password !== form.confirmPassword) {
    error.value = 'รหัสผ่านไม่ตรงกัน กรุณาลองใหม่'
    return
  }
  try {
    await api('/register', { method: 'POST', body: JSON.stringify(form) })
    router.push('/login')
  } catch (e) {
    error.value = e.status === 409 ? 'ชื่อผู้ใช้งานหรืออีเมลนี้ถูกใช้งานแล้ว' : 'ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่'
  }
}
</script>

<template>
  <AuthLayout title="CREATE ACCOUNT">
    <form @submit.prevent="submit">
      <div v-if="error" role="alert" class="error-box">
        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
      </div>
      <div class="input-group">
        <input id="username" v-model="form.username" autocomplete="username" class="auth-input" placeholder=" " required />
        <label for="username" class="auth-label">Username</label>
      </div>
      <div class="input-group">
        <input id="email" v-model="form.email" autocomplete="email" type="email" class="auth-input" placeholder=" " required />
        <label for="email" class="auth-label">Email Address</label>
      </div>
      <div class="input-group">
        <input id="password" v-model="form.password" autocomplete="new-password" type="password" class="auth-input" placeholder=" " required />
        <label for="password" class="auth-label">Create Password</label>
      </div>
      <div class="input-group">
        <input id="confirmPassword" v-model="form.confirmPassword" autocomplete="new-password" type="password" class="auth-input" placeholder=" " required />
        <label for="confirmPassword" class="auth-label">Confirm Password</label>
      </div>
      <p class="auth-subtitle">
        Already have an account? <RouterLink to="/login">Login here</RouterLink>
      </p>
      <button type="submit" class="auth-btn">Register</button>
    </form>
  </AuthLayout>
</template>

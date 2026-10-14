<script setup>
import { useRouter } from 'vue-router'
import { auth, logout } from '../auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const signOut = async () => {
  await logout()
  cartStore.reset()
  router.push('/login')
}
</script>

<template>
  <div class="store-container flex justify-center">
    <div class="admin-profile-card w-full max-w-[465px]">
      <div class="admin-avatar"></div>
      <h1 class="admin-name" data-test="name">{{ auth.user?.Username }}</h1>
      <div class="admin-role" data-test="role">{{ (auth.user?.Role || '').toUpperCase() }}</div>

      <div class="admin-details">
        <div class="admin-info-item"><span class="info-label">Account Name</span><span class="info-value">{{ auth.user?.Username }}</span></div>
        <div class="admin-info-item"><span class="info-label">System Access</span><span class="info-value">Back-Office Full</span></div>
        <div class="admin-info-item"><span class="info-label">Server Status</span><span class="info-value !text-emerald-500">Online</span></div>
      </div>

      <button type="button" class="btn-admin-logout" @click="signOut">logout</button>
    </div>
  </div>
</template>

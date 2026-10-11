<script setup>
import { useRouter } from 'vue-router'
import { auth, logout } from '../auth'

const router = useRouter()
const signOut = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 flex justify-center">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
      <h1 class="text-2xl font-bold text-primary" data-test="name">{{ auth.user?.Username }}</h1>
      <p class="text-accent-yellow font-bold mb-4" data-test="role">{{ (auth.user?.Role || '').toUpperCase() }}</p>

      <dl class="text-left space-y-2 mb-6">
        <div class="flex justify-between"><dt class="text-gray-500">Account Name</dt><dd>{{ auth.user?.Username }}</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">System Access</dt><dd>Back-Office Full</dd></div>
      </dl>

      <button type="button" class="w-full bg-accent-red text-white font-bold rounded py-2" @click="signOut">logout</button>
    </div>
  </div>
</template>

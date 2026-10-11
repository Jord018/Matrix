<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-bg-light font-sans">
    <Navbar v-if="!$route.meta.admin" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

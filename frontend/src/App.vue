<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div :class="[$route.meta.admin ? 'bg-bg-light' : 'store-background', 'min-h-screen font-sans']">
    <Navbar v-if="!$route.meta.admin && !$route.meta.bare" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

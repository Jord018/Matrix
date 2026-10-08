<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api';

const status = ref('checking…');

onMounted(async () => {
    try {
        status.value = (await api('/health')).status;
    } catch {
        status.value = 'offline';
    }
});
</script>

<template>
    <div class="min-h-screen bg-twilight text-white flex flex-col items-center justify-center gap-4">
        <img src="/image/logo.png" alt="Mouse Jerry" class="h-20 rounded-full" />
        <h1 class="text-4xl font-bold text-accent-yellow">Mouse Jerry — skeleton OK</h1>
        <p>API: <span data-test="api-status">{{ status }}</span></p>
    </div>
</template>

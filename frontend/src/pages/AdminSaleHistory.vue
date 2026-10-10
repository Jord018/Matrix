<script setup>
import { ref } from 'vue'
import { api } from '../api'

const orders = ref([])
api('/admin/orders').then((o) => { orders.value = o })

const when = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const qty = (item) => (item.keys ? item.keys.length : 1)
const badge = (status) => (status === 'completed' ? 'bg-green-600 text-white' : 'bg-yellow-400 text-black')
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-primary mb-4">Sale History</h1>

    <p v-if="!orders.length" data-test="empty" class="text-center">No sales history found.</p>

    <table v-else class="hidden md:table w-full bg-white rounded-lg shadow">
      <thead>
        <tr class="bg-primary text-white"><th class="p-2">Date</th><th>Customer</th><th>Items Purchased</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id" data-test="order-row" class="border-b align-top">
          <td class="p-2">{{ when(o.purchaseDate) }}</td>
          <td>
            <strong>{{ o.username }}</strong><br />
            <small class="text-gray-500">ID: {{ (o.userId || '').substring(0, 8) }}...</small>
          </td>
          <td>
            <div v-for="(item, i) in o.items" :key="i">
              <span class="font-semibold">{{ item.gameName }}</span>
              <span class="text-accent-yellow text-sm"> (x{{ qty(item) }})</span>
            </div>
          </td>
          <td><span :class="['rounded px-3 py-1', badge(o.status)]">{{ o.status === 'completed' ? 'Completed' : o.status }}</span></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden space-y-4">
      <div v-for="o in orders" :key="o.id" data-test="order-card" class="rounded-lg border-2 border-accent-red bg-white p-3">
        <div class="flex justify-between items-center border-b border-accent-red pb-2 mb-2">
          <div>
            <h2 class="font-bold">{{ o.username }}</h2>
            <small>{{ when(o.purchaseDate) }}</small>
          </div>
          <span :class="['rounded px-2 py-0.5 text-sm', badge(o.status)]">{{ o.status === 'completed' ? 'Completed' : o.status }}</span>
        </div>
        <p class="font-bold">Purchased Items:</p>
        <div v-for="(item, i) in o.items" :key="i">{{ item.gameName }} — Quantity: {{ qty(item) }}</div>
      </div>
    </div>
  </div>
</template>

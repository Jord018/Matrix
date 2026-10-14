<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const orders = ref([])
onMounted(async () => {
  orders.value = (await api('/admin/orders')) || []
})

const when = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const qty = (item) => (item.keys ? item.keys.length : 1)
const badge = (status) => (status === 'completed' ? 'bg-[#198754] text-white' : 'bg-[#ffc107] text-black')
</script>

<template>
  <div class="store-container">
    <h1 class="page-title">Sale History</h1>

    <p v-if="!orders.length" data-test="empty" class="text-center">No sales history found.</p>

    <table v-else class="admin-table history hidden md:table">
      <thead>
        <tr><th>Date</th><th>Customer</th><th>Items Purchased</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id" data-test="order-row">
          <td>{{ when(o.purchaseDate) }}</td>
          <td>
            <strong>{{ o.username }}</strong><br />
            <small class="text-gray-500">ID: {{ (o.userId || '').substring(0, 8) }}...</small>
          </td>
          <td>
            <div v-for="(item, i) in o.items" :key="i">
              <span>{{ item.gameName }}</span>
              <span class="text-accent-yellow text-sm"> (x{{ qty(item) }})</span>
            </div>
          </td>
          <td><span :class="['rounded-md px-3 py-2 font-bold', badge(o.status)]">{{ o.status === 'completed' ? 'Completed' : o.status }}</span></td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden">
      <div v-for="o in orders" :key="o.id" data-test="order-card" class="admin-card">
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

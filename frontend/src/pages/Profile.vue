<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { auth, logout } from '../auth'
import { useCartStore } from '../stores/cart'

// Old store profile page: account card + every key the user has bought.
const router = useRouter()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  orders.value = await api('/orders').catch(() => [])
  loading.value = false
})

const cartStore = useCartStore()

const signOut = async () => {
  await logout()
  cartStore.reset()
  router.push('/login')
}

const formatDate = (d) => new Date(d).toLocaleDateString()
</script>

<template>
  <div class="store-container pb-12">
    <div class="profile-card">
      <div class="profile-info">
        <div class="avatar-placeholder"><i class="fa-solid fa-user"></i></div>
        <div class="user-details">
          <h2 data-test="username">{{ auth.user?.Username }}</h2>
          <p data-test="email">{{ auth.user?.Email }}</p>
          <span class="user-role">{{ auth.user?.Role }} Account</span>
        </div>
      </div>
      <button type="button" class="btn-logout" @click="signOut">
        <i class="fa-solid fa-arrow-right-from-bracket mr-2"></i>Logout
      </button>
    </div>

    <h3 class="section-title"><i class="fa-solid fa-key mr-2"></i>My Digital Keys</h3>

    <template v-if="!loading">
      <div v-for="order in orders" :key="order.id" class="order-card" data-test="order">
        <div class="order-header">
          <h5>Order #{{ order.id || 'Legacy Order' }}</h5>
          <span class="order-date"><i class="fa-regular fa-calendar mr-1"></i> {{ formatDate(order.purchaseDate) }}</span>
        </div>
        <div v-for="(item, i) in order.items" :key="i" class="game-key-item">
          <img :src="item.coverImage || '/image/logo.png'" :alt="item.gameName" class="game-thumb" />
          <div class="game-info">
            <h6>{{ item.gameName }}</h6>
            <template v-if="item.keys?.length">
              <div v-for="key in item.keys" :key="key" class="digital-key">{{ key }}</div>
            </template>
            <div v-else class="text-gray-500 text-sm italic">Processing key generation...</div>
          </div>
        </div>
      </div>

      <div v-if="!orders.length" class="no-purchases" data-test="empty">
        <i class="fa-solid fa-box-open text-5xl text-gray-400 mb-3 block"></i>
        <h4 class="font-bold text-xl text-gray-900">No purchases yet!</h4>
        <p class="text-gray-500">When you buy games, your digital activation keys will live here permanently.</p>
        <RouterLink to="/" class="browse-btn">Browse Games</RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Ported from the old profile-style.css; anime.js intro redone as CSS. */
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(54, 1, 133, 0.08);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 1.5rem 0 3rem;
  border-top: 5px solid var(--primary);
  animation: drop-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.profile-info { display: flex; align-items: center; gap: 2.5rem; }
.avatar-placeholder { margin-right: 1rem; }
.avatar-placeholder {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  box-shadow: 0 8px 20px rgba(143, 1, 119, 0.3);
}
.user-details h2 { font-weight: 800; color: #1a1a1a; margin-bottom: 0.2rem; font-size: 2.2rem; overflow-wrap: anywhere; }
.user-details p { color: #6c757d; font-size: 1.1rem; overflow-wrap: anywhere; }
.user-role {
  display: inline-block;
  padding: 4px 12px;
  background: #e9ecef;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #495057;
  margin-top: 10px;
  text-transform: uppercase;
}
.btn-logout {
  background: #e2e8f0;
  color: #475569;
  font-weight: bold;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}
.btn-logout:hover {
  background: var(--accent-red);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(222, 26, 88, 0.3);
}
.section-title {
  position: relative;
  padding-bottom: 10px;
  font-weight: 800;
  font-size: 1.75rem;
  color: var(--primary);
  margin: 3rem 0 1.5rem;
  animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}
.order-card, .no-purchases { animation: rise 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.4s both; }
.order-card:nth-of-type(2) { animation-delay: 0.55s; }
.order-card:nth-of-type(3) { animation-delay: 0.7s; }
.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.order-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.order-header h5 { font-weight: 700; font-size: 1.25rem; color: #0d6efd; }
.order-date { color: #94a3b8; font-size: 0.9rem; }
.game-key-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
}
.game-thumb {
  width: 80px;
  height: 100px;
  margin-right: 1rem;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.game-info { min-width: 0; }
.game-info h6 { font-weight: bold; margin-bottom: 0.5rem; color: #1e293b; }
.digital-key {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #0f172a;
  letter-spacing: 1px;
  display: inline-block;
  margin: 0 5px 5px 0;
  border: 1px solid #dee2e6;
  overflow-wrap: anywhere;
}
.no-purchases {
  text-align: center;
  padding: 3rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.browse-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--primary);
  border-radius: 0.375rem;
  color: var(--primary);
  font-weight: bold;
}
.browse-btn:hover { background: var(--primary); color: white; }

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 4px;
  background-color: var(--accent-yellow);
  border-radius: 2px;
}

@keyframes drop-in { from { opacity: 0; transform: translateY(-30px); } }
@keyframes slide-in { from { opacity: 0; transform: translateX(-20px); } }
@keyframes rise { from { opacity: 0; transform: translateY(40px); } }

@media (prefers-reduced-motion: reduce) {
  .profile-card, .section-title, .order-card, .no-purchases { animation: none; }
}

@media (max-width: 768px) {
  .profile-card { flex-direction: column; text-align: center; padding: 1.5rem; margin-top: 1.5rem; }
  .profile-info { flex-direction: column; gap: 0.75rem; }
  .game-key-item { flex-direction: column; text-align: center; }
}
</style>

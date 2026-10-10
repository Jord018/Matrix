import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Category from '../pages/Category.vue';
import Login from '../pages/Login.vue';
import AdminLayout from '../components/AdminLayout.vue';
import AdminGames from '../pages/AdminGames.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import Cart from '../pages/Cart.vue';
import Purchase from '../pages/Purchase.vue';
import Success from '../pages/Success.vue';
import MyKeys from '../pages/MyKeys.vue';
import { loadUser, isAdmin } from '../auth';

export const routes = [
    { path: '/', component: Home },
    { path: '/category/:name', component: Category },
    { path: '/search', component: Category },
    { path: '/login', component: Login },
    { path: '/product/:id', component: ProductDetail },
    { path: '/cart', component: Cart },
    { path: '/checkout', component: Purchase },
    { path: '/success', component: Success },
    { path: '/my-keys', component: MyKeys },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { admin: true },
        children: [{ path: 'back-game', component: AdminGames }],
    },
];

export const adminGuard = async (to) => {
    if (!to.meta.admin) return true;
    await loadUser();
    return isAdmin() ? true : { path: '/login', query: { redirect: to.fullPath } };
};

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(adminGuard);
export default router;
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import AdminLayout from '../components/AdminLayout.vue';
import AdminGames from '../pages/AdminGames.vue';
import { loadUser, isAdmin } from '../auth';

export const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
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

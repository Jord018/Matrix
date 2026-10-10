import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import AdminGames from '../pages/AdminGames.vue';
import { loadUser, isAdmin } from '../auth';

export const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    // TODO(checklist #6): replace placeholder with the real game list
    { path: '/admin/back-game', component: AdminGames, meta: { admin: true } },
];

export const adminGuard = async (to) => {
    if (!to.meta.admin) return true;
    await loadUser();
    return isAdmin() ? true : { path: '/login', query: { redirect: to.fullPath } };
};

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(adminGuard);
export default router;

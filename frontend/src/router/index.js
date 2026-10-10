import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import AdminLayout from '../components/AdminLayout.vue';
import AdminGames from '../pages/AdminGames.vue';
import AdminAddGame from '../pages/AdminAddGame.vue';
import AdminEditGame from '../pages/AdminEditGame.vue';
import AdminCategories from '../pages/AdminCategories.vue';
import AdminCategoryGames from '../pages/AdminCategoryGames.vue';
import AdminHighlights from '../pages/AdminHighlights.vue';
import AdminSaleHistory from '../pages/AdminSaleHistory.vue';
import { loadUser, isAdmin } from '../auth';

export const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { admin: true },
        children: [
            { path: 'back-game', component: AdminGames },
            { path: 'add-game', component: AdminAddGame },
            { path: 'edit-game/:id', component: AdminEditGame },
            { path: 'back-category', component: AdminCategories },
            { path: 'back-category/:name', component: AdminCategoryGames },
            { path: 'back-highlight', component: AdminHighlights },
            { path: 'back-sale-history', component: AdminSaleHistory },
        ],
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

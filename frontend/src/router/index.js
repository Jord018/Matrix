import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Category from '../pages/Category.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import AdminLayout from '../components/AdminLayout.vue';
import AdminGames from '../pages/AdminGames.vue';
import AdminAddGame from '../pages/AdminAddGame.vue';
import AdminEditGame from '../pages/AdminEditGame.vue';
import AdminCategories from '../pages/AdminCategories.vue';
import AdminCategoryGames from '../pages/AdminCategoryGames.vue';
import AdminHighlights from '../pages/AdminHighlights.vue';
import AdminSaleHistory from '../pages/AdminSaleHistory.vue';
import AdminProfile from '../pages/AdminProfile.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import Cart from '../pages/Cart.vue';
import Purchase from '../pages/Purchase.vue';
import Success from '../pages/Success.vue';
import MyKeys from '../pages/MyKeys.vue';
import Contact from '../pages/Contact.vue';
import Profile from '../pages/Profile.vue';
import { auth, loadUser, isAdmin } from '../auth';

export const routes = [
    { path: '/', component: Home },
    { path: '/category/:name', component: Category },
    { path: '/search', component: Category },
    { path: '/login', component: Login, meta: { bare: true } },
    { path: '/register', component: Register, meta: { bare: true } },
    { path: '/product/:id', component: ProductDetail },
    { path: '/cart', component: Cart, meta: { auth: true } },
    { path: '/checkout', component: Purchase, meta: { auth: true } },
    { path: '/success', component: Success, meta: { auth: true } },
    { path: '/my-keys', component: MyKeys, meta: { auth: true } },
    { path: '/profile', component: Profile, meta: { auth: true } },
    { path: '/contact', component: Contact },
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
            { path: 'back-profile', component: AdminProfile },
        ],
    },
];

export const adminGuard = async (to) => {
    if (!to.meta.admin && !to.meta.auth) return true;
    await loadUser();
    const allowed = to.meta.admin ? isAdmin() : !!auth.user;
    return allowed ? true : { path: '/login', query: { redirect: to.fullPath } };
};

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(adminGuard);
export default router;
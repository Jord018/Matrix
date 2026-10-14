import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import { auth, loadUser, isAdmin } from '../auth';

// Pages load on first visit, so the shop doesn't download the back office (and vice versa).
const Category = () => import('../pages/Category.vue');
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');
const AdminLayout = () => import('../components/AdminLayout.vue');
const AdminGames = () => import('../pages/AdminGames.vue');
const AdminAddGame = () => import('../pages/AdminAddGame.vue');
const AdminEditGame = () => import('../pages/AdminEditGame.vue');
const AdminCategories = () => import('../pages/AdminCategories.vue');
const AdminCategoryGames = () => import('../pages/AdminCategoryGames.vue');
const AdminHighlights = () => import('../pages/AdminHighlights.vue');
const AdminSaleHistory = () => import('../pages/AdminSaleHistory.vue');
const AdminProfile = () => import('../pages/AdminProfile.vue');
const ProductDetail = () => import('../pages/ProductDetail.vue');
const Cart = () => import('../pages/Cart.vue');
const Purchase = () => import('../pages/Purchase.vue');
const Success = () => import('../pages/Success.vue');
const MyKeys = () => import('../pages/MyKeys.vue');
const Contact = () => import('../pages/Contact.vue');
const Profile = () => import('../pages/Profile.vue');

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
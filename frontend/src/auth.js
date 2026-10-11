import { reactive } from 'vue';
import { api } from './api';

// Shared login state: user is null until /api/user (or login) succeeds.
export const auth = reactive({ user: null, loaded: false });

export const isAdmin = () => auth.user?.Role === 'admin';

export async function loadUser() {
    if (auth.loaded) return;
    try {
        auth.user = await api('/user');
    } catch {
        auth.user = null;
    }
    auth.loaded = true;
}

export async function login(username, password) {
    auth.user = await api('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    auth.loaded = true;
    return auth.user;
}

export async function logout() {
    await api('/logout', { method: 'POST' });
    auth.user = null;
}

// Thin fetch wrapper for the Laravel API (supports configured base URL and relative endpoint).
const xsrf = () => {
    const m = /(?:^|; )XSRF-TOKEN=([^;]*)/.exec(document.cookie);
    return m ? decodeURIComponent(m[1]) : null;
};

export const getBaseUrl = (env = import.meta.env) => {
    if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
        return window.__API_BASE_URL__.replace(/\/+$/, '');
    }
    // In test environment, default to relative '/api' unless overridden for test mock consistency
    if (env?.MODE === 'test') {
        return '/api';
    }
    const envBase = env?.VITE_API_BASE_URL;
    if (typeof envBase === 'string' && envBase.trim()) {
        return envBase.trim().replace(/\/+$/, '');
    }
    return '/api';
};

export const formatEndpoint = (path, baseUrl = getBaseUrl()) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = baseUrl.replace(/\/+$/, '');

    // Prevent duplicate /api when base ends with /api and cleanPath starts with /api
    if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
        return `${base}${cleanPath.slice(4)}`;
    }
    if (base.endsWith('/api') && cleanPath === '/api') {
        return base;
    }
    return `${base}${cleanPath}`;
};

export async function api(path, options = {}) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers };
    const baseUrl = getBaseUrl();

    // Sanctum SPA auth: unsafe methods need the CSRF cookie echoed back as a header.
    if (options.method && options.method !== 'GET') {
        if (!xsrf()) {
            const csrfUrl = baseUrl.startsWith('http')
                ? new URL('/sanctum/csrf-cookie', baseUrl).toString()
                : '/sanctum/csrf-cookie';
            await fetch(csrfUrl, { credentials: 'include' });
        }
        const token = xsrf();
        if (token) headers['X-XSRF-TOKEN'] = token;
    }

    const url = formatEndpoint(path, baseUrl);
    const res = await fetch(url, { credentials: 'include', ...options, headers });
    if (!res.ok) {
        const data = await res.json?.().catch(() => null);
        throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status, data });
    }
    if (res.status === 204) {
        return null;
    }
    return res.json();
}

// Thin fetch wrapper for the Laravel API (supports configured base URL and relative endpoint).
const xsrf = () => {
    if (!document.cookie) return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('XSRF-TOKEN=')) {
            const val = trimmed.slice(11);
            return val ? decodeURIComponent(val) : null;
        }
    }
    return null;
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

const apiCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_CACHE_TTL = 30000; // 30 seconds
const CATALOG_ROUTES = /^\/?(categories|highlights|games|search)($|[\/?])/i;

export const isCacheableRequest = (path, method = 'GET', options = {}) => {
    const m = method.toUpperCase();
    if (m !== 'GET') return false;
    if (options.cache === false) return false;
    if (options.cache === true) return true;
    if (/^\/?(admin|sanctum|user|auth|orders)($|[\/?])/i.test(path)) return false;
    return CATALOG_ROUTES.test(path);
};

export const clearApiCache = () => {
    apiCache.clear();
    inFlightRequests.clear();
};

export async function api(path, options = {}) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers };
    const baseUrl = getBaseUrl();
    const method = (options.method || 'GET').toUpperCase();

    // Sanctum SPA auth: unsafe methods need the CSRF cookie echoed back as a header.
    if (method !== 'GET') {
        // Any mutation invalidates cached GET responses
        apiCache.clear();

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
    const isCacheable = isCacheableRequest(path, method, options);
    const ttl = options.cacheTtl ?? DEFAULT_CACHE_TTL;

    if (isCacheable) {
        const cached = apiCache.get(url);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        if (inFlightRequests.has(url)) {
            return inFlightRequests.get(url);
        }
    }

    const executeFetch = async () => {
        try {
            const res = await fetch(url, { credentials: 'include', ...options, headers });
            if (!res.ok) {
                const data = await res.json?.().catch(() => null);
                throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status, data });
            }
            if (res.status === 204) {
                return null;
            }
            const data = await res.json();
            if (isCacheable) {
                apiCache.set(url, { data, timestamp: Date.now() });
            }
            return data;
        } finally {
            if (isCacheable) {
                inFlightRequests.delete(url);
            }
        }
    };

    if (isCacheable) {
        const promise = executeFetch();
        inFlightRequests.set(url, promise);
        return promise;
    }

    return executeFetch();
}

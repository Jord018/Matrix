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

export const trimTrailingSlashes = (str) => {
    if (typeof str !== 'string') return '';
    let end = str.length;
    while (end > 0 && str.charCodeAt(end - 1) === 47 /* '/' */) {
        end--;
    }
    return str.slice(0, end);
};

export const getBaseUrl = (env = import.meta.env) => {
    if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
        return trimTrailingSlashes(window.__API_BASE_URL__);
    }
    // In test environment, default to relative '/api' unless overridden for test mock consistency
    if (env?.MODE === 'test') {
        return '/api';
    }
    const envBase = env?.VITE_API_BASE_URL;
    if (typeof envBase === 'string' && envBase.trim()) {
        return trimTrailingSlashes(envBase.trim());
    }
    return '/api';
};

export const formatEndpoint = (path, baseUrl = getBaseUrl()) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = trimTrailingSlashes(baseUrl);

    // Prevent duplicate /api when base ends with /api and cleanPath starts with /api
    if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
        return `${base}${cleanPath.slice(4)}`;
    }
    if (base.endsWith('/api') && cleanPath === '/api') {
        return base;
    }
    return `${base}${cleanPath}`;
};

const safeStorage = {
    getItem(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
        } catch {
            // Ignore storage access errors
        }
        return null;
    },
    setItem(key, value) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch {
            // Ignore storage quota or access errors
        }
    },
    clearSnapshotKeys(prefix) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const keysToRemove = [];
                for (let i = 0; i < window.localStorage.length; i++) {
                    const k = window.localStorage.key(i);
                    if (k && k.startsWith(prefix)) {
                        keysToRemove.push(k);
                    }
                }
                for (const k of keysToRemove) {
                    window.localStorage.removeItem(k);
                }
            }
        } catch {
            // Ignore
        }
    }
};

const apiCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_STORAGE_TTL = 300000; // 5 minutes in localStorage for instant reload
const CACHE_STORAGE_PREFIX = 'api_cache:';
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
    safeStorage.clearSnapshotKeys(CACHE_STORAGE_PREFIX);
};

// Back-office saves must reach open shops. Two signals:
// - same browser: a save writes CATALOG_CHANGED_KEY, and browsers fire "storage" events in the *other* tabs;
// - another browser or account (admin and customer can't share one session): poll /catalog-version,
//   which the server changes on every save.
const CATALOG_CHANGED_KEY = 'catalog:changed';
const VERSION_POLL_MS = 500;
const changeListeners = new Set();
let pollTimer = null;
let lastVersion = null;

const notifyCatalogChange = () => {
    inFlightRequests.clear(); // a refresh must not join a request that started before the change
    changeListeners.forEach((run) => void run());
};

const onStorage = (e) => {
    if (e.key === CATALOG_CHANGED_KEY) notifyCatalogChange();
};

const checkCatalogVersion = async () => {
    if (document.visibilityState === 'hidden') return;
    try {
        const { version } = await api('/catalog-version');
        if (lastVersion !== null && version !== lastVersion) notifyCatalogChange();
        lastVersion = version;
    } catch {
        // Server restarting or offline: the next tick tries again.
    }
};

export const onCatalogChange = (cb) => {
    // One refresh at a time; changes that land during it trigger exactly one more,
    // so a burst of clicks in the back office costs two refreshes, not one per click.
    let running = false;
    let again = false;
    const run = async () => {
        if (running) {
            again = true;
            return;
        }
        running = true;
        do {
            again = false;
            try {
                await cb();
            } catch {
                // The page shows its own error state.
            }
        } while (again);
        running = false;
    };

    changeListeners.add(run);
    if (changeListeners.size === 1) {
        window.addEventListener('storage', onStorage);
        document.addEventListener('visibilitychange', checkCatalogVersion);
        pollTimer = setInterval(checkCatalogVersion, VERSION_POLL_MS);
        void checkCatalogVersion();
    }
    return () => {
        changeListeners.delete(run);
        if (changeListeners.size === 0) {
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('visibilitychange', checkCatalogVersion);
            clearInterval(pollTimer);
            lastVersion = null;
        }
    };
};

export const getCachedData = (path, maxAge = DEFAULT_STORAGE_TTL) => {
    const url = formatEndpoint(path);
    const mem = apiCache.get(url);
    if (mem && Date.now() - mem.timestamp < maxAge) {
        return mem.data;
    }
    const raw = safeStorage.getItem(`${CACHE_STORAGE_PREFIX}${url}`);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp < maxAge) {
                apiCache.set(url, { data: parsed.data, timestamp: parsed.timestamp });
                return parsed.data;
            }
        } catch {
            // Ignore JSON parse errors
        }
    }
    return null;
};

export const setCachedData = (path, data) => {
    const url = formatEndpoint(path);
    const entry = { data, timestamp: Date.now() };
    apiCache.set(url, entry);
    safeStorage.setItem(`${CACHE_STORAGE_PREFIX}${url}`, JSON.stringify(entry));
};

export async function api(path, options = {}) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers };
    const baseUrl = getBaseUrl();
    const method = (options.method || 'GET').toUpperCase();

    // Sanctum SPA auth: unsafe methods need the CSRF cookie echoed back as a header.
    if (method !== 'GET') {
        // Any mutation invalidates cached GET responses
        clearApiCache();

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

    // Always ask the server: its catalog cache is flushed on every back-office change, so a category hidden
    // from another tab disappears on the next request. Identical concurrent GETs still share one fetch.
    if (isCacheable && !options.forceRefresh && inFlightRequests.has(url)) {
        return inFlightRequests.get(url);
    }

    const executeFetch = async () => {
        try {
            const res = await fetch(url, { credentials: 'include', ...options, headers });
            if (!res.ok) {
                const data = await res.json?.().catch(() => null);
                throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status, data });
            }
            if (method !== 'GET') {
                safeStorage.setItem(CATALOG_CHANGED_KEY, String(Date.now()));
            }
            if (res.status === 204) {
                return null;
            }
            const data = await res.json();
            if (isCacheable) {
                setCachedData(path, data);
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

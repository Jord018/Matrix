// Thin fetch wrapper for the Laravel API (same-origin via Vite proxy).
const xsrf = () => {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
};

export async function api(path, options = {}) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers };

    // Sanctum SPA auth: unsafe methods need the CSRF cookie echoed back as a header.
    if (options.method && options.method !== 'GET') {
        if (!xsrf()) await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
        const token = xsrf();
        if (token) headers['X-XSRF-TOKEN'] = token;
    }

    const res = await fetch(`/api${path}`, { credentials: 'include', ...options, headers });
    if (!res.ok) {
        const data = await res.json?.().catch(() => null);
        throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status, data });
    }
    return res.json();
}

// Thin fetch wrapper for the Laravel API (same-origin via Vite proxy).
export async function api(path, options = {}) {
    const res = await fetch(`/api${path}`, {
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return res.json();
}

const KEYS = ['os', 'processor', 'memory', 'graphics', 'storage'];
const LABELS = ['OS', 'Processor', 'Memory', 'Graphics', 'Storage'];

// Form textarea ("OS: ...\nProcessor: ...") <-> systemRequirements object, line order as in the old store.
export function parseRequirements(text) {
    const lines = (text || '').split('\n');
    const out = {};
    KEYS.forEach((key, i) => {
        const line = lines[i] || '';
        const prefix = `${LABELS[i]}:`;
        const value = (line.trim().toLowerCase().startsWith(prefix.toLowerCase())
            ? line.trim().slice(prefix.length)
            : line
        ).trim();
        if (value) out[key] = value;
    });
    return out;
}

export function formatRequirements(reqs) {
    return LABELS.map((label, i) => `${label}: ${reqs?.[KEYS[i]] || '-'}`).join('\n');
}

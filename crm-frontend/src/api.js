/* API Service Layer — all CRM API calls */

const API_BASE = '/api';

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    const res = await fetch(url, config);

    if (res.status === 204) return null;

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

// ── Contacts ─────────────────────────────────────────────────────────────────

export const contactsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/contacts/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/contacts/${id}`),
    create: (data) => request('/contacts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
};

// ── Deals ────────────────────────────────────────────────────────────────────

export const dealsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/deals/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/deals/${id}`),
    create: (data) => request('/deals/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/deals/${id}`, { method: 'DELETE' }),
};

// ── Activities ───────────────────────────────────────────────────────────────

export const activitiesApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/activities/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/activities/${id}`),
    create: (data) => request('/activities/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
};

// ── Accounts ─────────────────────────────────────────────────────────────────

export const accountsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/accounts/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/accounts/${id}`),
    create: (data) => request('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
    getContacts: (id) => request(`/accounts/${id}/contacts`),
    getDeals: (id) => request(`/accounts/${id}/deals`),
};

// ── Leads ────────────────────────────────────────────────────────────────────

export const leadsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/leads/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/leads/${id}`),
    create: (data) => request('/leads/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
    convert: (id, data) => request(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),
};

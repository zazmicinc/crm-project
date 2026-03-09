/* API Service Layer - all CRM API calls */

const API_BASE = '/api';

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const token = localStorage.getItem('token');
    
    const config = {
        headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options,
    };

    const res = await fetch(url, config);

    if (res.status === 204) return null;

    if (res.status === 401) {
        localStorage.removeItem('token');
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

// Auth
export const authApi = {
    login: (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        return request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });
    },
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getGoogleLoginUrl: () => request('/auth/google/login'),
    googleCallback: (code, state) => {
        let qs = new URLSearchParams();
        if (code) qs.append('code', code);
        if (state) qs.append('state', state);
        return request(`/auth/google/callback?${qs.toString()}`);
    },
};

export const usersApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/users/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/users/${id}`),
    create: (data) => request('/users/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const rolesApi = {
    list: () => request('/roles/'),
    get: (id) => request(`/roles/${id}`),
    create: (data) => request('/roles/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/roles/${id}`, { method: 'DELETE' }),
};

export const contactsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/contacts/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/contacts/${id}`),
    create: (data) => request('/contacts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
    assign: (id, userId) => request(`/contacts/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
    getTimeline: (id) => request(`/contacts/${id}/timeline`),
};

export const dealsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/deals/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/deals/${id}`),
    create: (data) => request('/deals/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/deals/${id}`, { method: 'DELETE' }),
    assign: (id, userId) => request(`/deals/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
    move: (id, stage_id) => request(`/deals/${id}/move`, { method: 'POST', body: JSON.stringify({ stage_id }) }),
    getTimeline: (id) => request(`/deals/${id}/timeline`),
    getContacts: (id) => request(`/deals/${id}/contacts`),
    addContact: (id, data) => request(`/deals/${id}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
    removeContact: (id, contactId) => request(`/deals/${id}/contacts/${contactId}`, { method: 'DELETE' }),
    getLineItems: (id) => request(`/deals/${id}/line-items`),
    addLineItem: (id, data) => request(`/deals/${id}/line-items`, { method: 'POST', body: JSON.stringify(data) }),
    updateLineItem: (id, itemId, data) => request(`/deals/${id}/line-items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLineItem: (id, itemId) => request(`/deals/${id}/line-items/${itemId}`, { method: 'DELETE' }),
};

export const productsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/products/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

export const activitiesApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/activities/${qs ? '?' + qs : ''}`);
    },
    tasks: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/activities/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/activities/${id}`),
    create: (data) => request('/activities/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
    complete: (id) => request(`/activities/${id}/complete`, { method: 'PUT' }),
    reopen: (id) => request(`/activities/${id}/reopen`, { method: 'PUT' }),
};

export const notesApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/notes/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/notes/${id}`),
    create: (data) => request('/notes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

export const accountsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/accounts/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/accounts/${id}`),
    create: (data) => request('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
    assign: (id, userId) => request(`/accounts/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
    getContacts: (id) => request(`/accounts/${id}/contacts`),
    getDeals: (id) => request(`/accounts/${id}/deals`),
    getTimeline: (id) => request(`/accounts/${id}/timeline`),
};

export const leadsApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/leads/${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/leads/${id}`),
    create: (data) => request('/leads/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
    assign: (id, userId) => request(`/leads/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
    convert: (id, data) => request(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),
    getTimeline: (id) => request(`/leads/${id}/timeline`),
};

export const dashboardApi = {
    getSummary: () => request('/dashboard/summary'),
    getFunnel: () => request('/dashboard/funnel'),
    getActivityStats: () => request('/dashboard/activity-stats'),
};

export const searchApi = {
    global: (q) => request(`/search/?q=${encodeURIComponent(q)}`),
};

export const pipelinesApi = {
    list: () => request('/pipelines/'),
    get: (id) => request(`/pipelines/${id}`),
    create: (data) => request('/pipelines/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/pipelines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/pipelines/${id}`, { method: 'DELETE' }),
    listStages: (pipelineId) => request(`/pipelines/${pipelineId}/stages/`),
    createStage: (pipelineId, data) => request(`/pipelines/${pipelineId}/stages/`, { method: 'POST', body: JSON.stringify(data) }),
    updateStage: (pipelineId, stageId, data) => request(`/pipelines/${pipelineId}/stages/${stageId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteStage: (pipelineId, stageId) => request(`/pipelines/${pipelineId}/stages/${stageId}`, { method: 'DELETE' }),
    reorderStages: (pipelineId, stageIds) => request(`/pipelines/${pipelineId}/stages/reorder`, { method: 'PUT', body: JSON.stringify({ stage_ids: stageIds }) }),
};

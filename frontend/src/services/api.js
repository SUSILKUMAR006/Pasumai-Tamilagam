const API_BASE = 'http://localhost:5000/api';

// Utility helper to request API data
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('tn_tree_token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If response is not JSON (e.g. CSV file download)
      return text;
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  // Authentication services
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    login: (data) => request('/auth/login', { method: 'POST', body: data }),
    me: () => request('/auth/me'),
    updateProfile: (formData) => request('/auth/profile', { method: 'PUT', body: formData }), // multipart Form
  },

  // Tree registration & retrieval services
  trees: {
    register: (formData) => request('/trees', { method: 'POST', body: formData }), // multipart Form
    myTrees: () => request('/trees/my'),
    details: (id) => request(`/trees/${id}`),
  },

  // Public statistics & details
  public: {
    statistics: () => request('/public/statistics'),
    districts: () => request('/public/districts'),
    treeMap: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/public/tree-map?${query}`);
    },
    leaderboard: () => request('/public/leaderboard'),
    species: () => request('/public/species'),
  },

  // Administrative functions
  admin: {
    dashboard: () => request('/admin/dashboard'),
    pendingTrees: () => request('/admin/trees/pending'),
    approveTree: (id, notes) => request(`/admin/trees/${id}/approve`, { method: 'PUT', body: { notes } }),
    rejectTree: (id, reason, notes) => request(`/admin/trees/${id}/reject`, { method: 'PUT', body: { rejectionReason: reason, notes } }),
    allTrees: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/trees?${query}`);
    },
    users: () => request('/admin/users'),
    toggleUser: (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: { status } }),
    analytics: () => request('/admin/analytics'),
    
    // For reports, returns the CSV text directly
    getReportCsv: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/reports?${query}`);
    },

    // Tree Species settings
    species: {
      list: () => request('/admin/species'),
      create: (data) => request('/admin/species', { method: 'POST', body: data }),
      update: (id, data) => request(`/admin/species/${id}`, { method: 'PUT', body: data }),
      delete: (id) => request(`/admin/species/${id}`, { method: 'DELETE' }),
    }
  },
};

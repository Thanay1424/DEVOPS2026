/* ===================================================
   API UTILITY — Crime Index Dashboard
   =================================================== */

const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('cid_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('cid_user') || 'null');
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('cid_token', token);
    localStorage.setItem('cid_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('cid_token');
    localStorage.removeItem('cid_user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/';
    }
  },

  redirectIfAuth() {
    if (this.isAuthenticated()) {
      window.location.href = '/dashboard';
    }
  },

  async request(method, endpoint, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, opts);
      const data = await res.json();

      if (res.status === 401) {
        this.clearSession();
        window.location.href = '/';
        return;
      }

      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, status: 0, data: { message: 'Network error. Please try again.' } };
    }
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, body) { return this.request('POST', endpoint, body); },
  put(endpoint, body) { return this.request('PUT', endpoint, body); },
  delete(endpoint) { return this.request('DELETE', endpoint); },
};

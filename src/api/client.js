// API Client for Solana Memecoin Beginner Lead Finder

export function getBackendBaseUrl() {
  const customUrl = localStorage.getItem('solana_leads_backend_url');

  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://127.0.0.1:8000';
  }

  return '';
}

export function setBackendBaseUrl(url) {
  if (!url) {
    localStorage.removeItem('solana_leads_backend_url');
  } else {
    localStorage.setItem(
      'solana_leads_backend_url',
      url.trim().replace(/\/+$/, '')
    );
  }
}


// Session token (stored in sessionStorage - short lived, not permanent localStorage)
export function getSessionToken() {
  return sessionStorage.getItem('solana_leads_jwt_token') || '';
}

export function setSessionToken(token) {
  if (token) {
    sessionStorage.setItem('solana_leads_jwt_token', token);
  } else {
    sessionStorage.removeItem('solana_leads_jwt_token');
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getSessionToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    if (res.status === 401) {
      // Token expired or invalid
      setSessionToken('');
      window.dispatchEvent(new Event('auth_token_expired'));
    }

    if (!res.ok) {
      let errMsg = `Request failed: ${res.status}`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.detail || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth Token Exchange
  async exchangeBootstrapKey(bootstrapKey) {
    const res = await request('/auth/exchange', {
      method: 'POST',
      body: JSON.stringify({ bootstrap_key: bootstrapKey })
    });
    if (res && res.access_token) {
      setSessionToken(res.access_token);
    }
    return res;
  },

  // Health
  async getHealth() {
    return await request('/health');
  },

  // Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.size) query.append('size', params.size);
    if (params.min_score !== undefined && params.min_score !== null) query.append('min_score', params.min_score);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    if (params.query) query.append('query', params.query);

    return await request(`/leads?${query.toString()}`);
  },

  async getLeadDetail(id) {
    return await request(`/leads/${id}`);
  },

  async updateLeadStatus(id, status) {
    return await request(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  getExportCsvUrl(params = {}) {
    const baseUrl = getBackendBaseUrl();
    const query = new URLSearchParams();
    if (params.min_score) query.append('min_score', params.min_score);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    return `${baseUrl}/api/v1/leads/export/csv?${query.toString()}`;
  },

  // Keywords
  async getKeywords() {
    return await request('/keywords');
  },

  async createKeyword(data) {
    return await request('/keywords', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateKeyword(id, data) {
    return await request(`/keywords/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteKeyword(id) {
    return await request(`/keywords/${id}`, {
      method: 'DELETE'
    });
  },

  async seedKeywords() {
    return await request('/keywords/seed', {
      method: 'POST'
    });
  },

  // Scans
  async getScanHistory(limit = 20) {
    return await request(`/scans?limit=${limit}`);
  },

  async triggerScan() {
    return await request('/scans/trigger', {
      method: 'POST'
    });
  },

  async getScannerStatus() {
    return await request('/scans/status');
  },

  // Notifications
  async getVapidPublicKey() {
    return await request('/notifications/vapid-public-key');
  },

  async subscribePush(subscription) {
    return await request('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription)
    });
  },

  async unsubscribePush(endpoint) {
    return await request('/notifications/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint, keys: { p256dh: '', auth: '' } })
    });
  },

  async sendTestPush(customTitle, customBody) {
    return await request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ custom_title: customTitle, custom_body: customBody })
    });
  },

  // Settings
  async getSettings() {
    return await request('/settings');
  },

  async updateSettings(settings) {
    return await request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

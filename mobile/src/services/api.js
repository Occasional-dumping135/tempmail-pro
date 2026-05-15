// API Service for Temp Amit Brands Mobile App
const API_BASE = 'https://temp.amitbrand.shop/api';

class ApiService {
  constructor() {
    this.token = null;
    this.sessionToken = null;
  }

  setSessionToken(token) {
    this.sessionToken = token;
  }

  setUserToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async signup() {
    return this.request('/v1/auth/signup', { method: 'POST' });
  }

  async login(token) {
    return this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Email
  async createEmail(type, subdomain, name = null) {
    const body = { type, subdomain };
    if (name) body.name = name;
    return this.request('/v1/email/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async listEmails() {
    return this.request('/v1/email/list');
  }

  async getMessages(emailId) {
    return this.request(`/v1/email/${emailId}/messages`);
  }

  async getMessage(emailId, messageId) {
    return this.request(`/v1/email/${emailId}/messages/${messageId}`);
  }

  async deleteEmail(emailId) {
    return this.request(`/v1/email/${emailId}`, { method: 'DELETE' });
  }

  // Token
  async getUsage() {
    return this.request('/v1/token/usage');
  }
}

export default new ApiService();

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Interceptor de request: adicionar token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('freeapi-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: refresh automático do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const stored = localStorage.getItem('freeapi-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.refreshToken) {
          try {
            const { data } = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken: state.refreshToken }
            );

            // Atualizar no localStorage
            const newState = { ...state, accessToken: data.accessToken };
            localStorage.setItem('freeapi-auth', JSON.stringify({ state: newState }));

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem('freeapi-auth');
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// Funções de API organizadas por módulo
// ============================================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  setup2FA: () => api.post('/auth/setup-2fa'),
  confirm2FA: (code) => api.post('/auth/confirm-2fa', { totp_code: code }),
};

export const proposalAPI = {
  create: (data) => api.post('/proposals', data),
  getAll: (params) => api.get('/proposals', { params }),
  getByLink: (link) => api.get(`/proposals/link/${link}`),
  update: (id, data) => api.put(`/proposals/${id}`, data),
  accept: (id) => api.post(`/proposals/${id}/accept`),
  reject: (id, reason) => api.post(`/proposals/${id}/reject`, { reason }),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  addUpdate: (id, data) => api.post(`/projects/${id}/updates`, data),
  approveMilestone: (projectId, milestoneId) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/approve`),
  rejectMilestone: (projectId, milestoneId, reason) =>
    api.post(`/projects/${projectId}/milestones/${milestoneId}/reject`, { reason }),
  cancel: (id, reason) => api.post(`/projects/${id}/cancel`, { reason }),
};

export const paymentAPI = {
  initiate: (projectId, data) => api.post(`/payments/project/${projectId}/initiate`, data),
  getBalance: () => api.get('/payments/balance'),
  requestWithdrawal: (data) => api.post('/payments/withdraw', data),
};

export const disputeAPI = {
  open: (data) => api.post('/disputes', data),
  getAll: (params) => api.get('/disputes', { params }),
  getById: (id) => api.get(`/disputes/${id}`),
  sendMessage: (id, data) => api.post(`/disputes/${id}/messages`, data),
  resolve: (id, data) => api.post(`/disputes/${id}/resolve`, data),
};

export const messageAPI = {
  getProjectMessages: (projectId) => api.get(`/messages/project/${projectId}`),
  send: (projectId, data) => api.post(`/messages/project/${projectId}`, data),
  markRead: (projectId) => api.patch(`/messages/project/${projectId}/read`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPublicProfile: (id) => api.get(`/users/${id}`),
};

export const contractAPI = {
  getByProject: (projectId) => api.get(`/contracts/${projectId}`),
  sign: (contractId) => api.post(`/contracts/${contractId}/sign`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  assignMediator: (id, mediatorId) =>
    api.patch(`/admin/disputes/${id}/assign`, { mediator_id: mediatorId }),
  getWithdrawals: () => api.get('/admin/withdrawal-requests'),
  processWithdrawal: (id, data) => api.patch(`/admin/withdrawal-requests/${id}`, data),
  getFraudAlerts: () => api.get('/admin/fraud-alerts'),
};

export default api;

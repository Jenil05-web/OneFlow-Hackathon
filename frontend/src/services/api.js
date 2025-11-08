import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/profile'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getProjectStats: (projectId) => api.get(`/dashboard/stats/project/${projectId}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignMembers: (id, teamMembers) => api.put(`/projects/${id}/assign`, { teamMembers }),
  updateStatus: (id, status) => api.put(`/projects/${id}/status`, { status }),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  assign: (id, assignedTo) => api.put(`/tasks/${id}/assign`, { assignedTo }),
  getByProject: (projectId) => api.get('/tasks', { params: { project: projectId } }),
};

// Timesheets API
export const timesheetsAPI = {
  getAll: (params) => api.get('/timesheets', { params }),
  getById: (id) => api.get(`/timesheets/${id}`),
  create: (data) => api.post('/timesheets', data),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  delete: (id) => api.delete(`/timesheets/${id}`),
  updateStatus: (id, approved) => api.put(`/timesheets/${id}/status`, { approved }),
  getByProject: (projectId) => api.get('/timesheets', { params: { project: projectId } }),
  getByUser: (userId) => api.get('/timesheets', { params: { user: userId } }),
};

// Billing API
export const billingAPI = {
  // Invoices
  getInvoices: (params) => api.get('/billing/invoices', { params }),
  getInvoice: (id) => api.get(`/billing/invoices/${id}`),
  createInvoice: (data) => api.post('/billing/invoices', data),
  updateInvoice: (id, data) => api.put(`/billing/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/billing/invoices/${id}`),
  
  // Vendor Bills
  getVendorBills: (params) => api.get('/billing/vendor-bills', { params }),
  getVendorBill: (id) => api.get(`/billing/vendor-bills/${id}`),
  createVendorBill: (data) => api.post('/billing/vendor-bills', data),
  updateVendorBill: (id, data) => api.put(`/billing/vendor-bills/${id}`, data),
  deleteVendorBill: (id) => api.delete(`/billing/vendor-bills/${id}`),
  
  // Sales Orders
  getSalesOrders: (params) => api.get('/billing/sales-orders', { params }),
  getSalesOrder: (id) => api.get(`/billing/sales-orders/${id}`),
  createSalesOrder: (data) => api.post('/billing/sales-orders', data),
  updateSalesOrder: (id, data) => api.put(`/billing/sales-orders/${id}`, data),
  
  // Purchase Orders
  getPurchaseOrders: (params) => api.get('/billing/purchase-orders', { params }),
  getPurchaseOrder: (id) => api.get(`/billing/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post('/billing/purchase-orders', data),
  updatePurchaseOrder: (id, data) => api.put(`/billing/purchase-orders/${id}`, data),
  
  // Expenses
  getExpenses: (params) => api.get('/billing/expenses', { params }),
  getExpense: (id) => api.get(`/billing/expenses/${id}`),
  createExpense: (data) => api.post('/billing/expenses', data),
  updateExpense: (id, data) => api.put(`/billing/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/billing/expenses/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getFinancialSummary: (params) => api.get('/analytics/financial-summary', { params }),
  getTimeUtilization: (params) => api.get('/analytics/time-utilization', { params }),
  getRevenueTrend: (params) => api.get('/analytics/revenue-trend', { params }),
  getExpenseBreakdown: (params) => api.get('/analytics/expense-breakdown', { params }),
  getProjectPerformance: (params) => api.get('/analytics/project-performance', { params }),
};

export default api;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
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

// Response interceptor - handle auth errors
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

export default api;

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

// Users API
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Ras API
export const rasAPI = {
    getAll: (params) => api.get('/ras', { params }),
    getById: (id) => api.get(`/ras/${id}`),
    create: (data) => api.post('/ras', data),
    update: (id, data) => api.put(`/ras/${id}`, data),
    delete: (id) => api.delete(`/ras/${id}`),
};

// Estimasi API
export const estimasiAPI = {
    getAll: (params) => api.get('/estimasi', { params }),
    getById: (id) => api.get(`/estimasi/${id}`),
    create: (data) => api.post('/estimasi', data),
    update: (id, data) => api.put(`/estimasi/${id}`, data),
    delete: (id) => api.delete(`/estimasi/${id}`),
};

// Kambing API
export const kambingAPI = {
    getAll: (params) => api.get('/kambing', { params }),
    getTersedia: () => api.get('/kambing/tersedia'),
    getById: (id) => api.get(`/kambing/${id}`),
    create: (data) => api.post('/kambing', data),
    update: (id, data) => api.put(`/kambing/${id}`, data),
    delete: (id) => api.delete(`/kambing/${id}`),
};

// Penjualan API
export const penjualanAPI = {
    getAll: (params) => api.get('/penjualan', { params }),
    getById: (id) => api.get(`/penjualan/${id}`),
    create: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'items') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'bukti_transfer' && data[key]) {
                formData.append(key, data[key]);
            } else {
                formData.append(key, data[key]);
            }
        });
        return api.post('/penjualan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id) => api.delete(`/penjualan/${id}`),
    checkPoints: (contact) => api.get(`/penjualan/check-points?contact=${contact}`),
};

// Payment API
export const paymentAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getMethods: () => api.get('/payments/methods'),
    approve: (id, notes) => api.put(`/payments/${id}/approve`, { notes }),
    reject: (id, notes) => api.put(`/payments/${id}/reject`, { notes }),
};

// Payment Method API
export const paymentMethodAPI = {
    getAll: () => api.get('/payment-methods'),
    getById: (id) => api.get(`/payment-methods/${id}`),
    create: (data) => api.post('/payment-methods', data),
    update: (id, data) => api.put(`/payment-methods/${id}`, data),
    delete: (id) => api.delete(`/payment-methods/${id}`),
};

// Settings API
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getSalesChart: () => api.get('/dashboard/chart/sales'),
    getStockChart: () => api.get('/dashboard/chart/stock'),
    getRecentSales: () => api.get('/dashboard/recent-sales'),
    getLaporan: (params) => api.get('/dashboard/laporan', { params }),
    getLoyalty: () => api.get('/dashboard/loyalty'),
};

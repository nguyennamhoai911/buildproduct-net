import axios from 'axios';

const API_URL = 'http://localhost:3040';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: async (data: any) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    }
};

export const inspirationAPI = {
    getAll: async (params?: any) => {
        const response = await api.get('/inspirations', { params });
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/inspirations', data);
        return response.data;
    },
    // Add update/delete later
};

export const userAPI = {
    getAll: async (params?: { page?: number; limit?: number; q?: string }) => {
        const response = await api.get('/users', { params });
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
    getAnalytics: async (id: number) => {
        const response = await api.get(`/users/${id}/analytics`);
        return response.data;
    }
};

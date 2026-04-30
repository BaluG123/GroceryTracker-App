import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../utils/storage';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  GroceryItem,
  CreateItemPayload,
  UpdateItemPayload,
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  PurchaseFilters,
  MonthlySummary,
  ItemFrequencyReport,
  DailyBreakdownSingle,
  DailyBreakdownMonth,
  PaginatedResponse,
  User,
} from '../types';

const BASE_URL = 'https://groceryexpencetracker.pythonanywhere.com';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        Object.values(data || {}).flat().join(', ') ||
        'Something went wrong';
      return Promise.reject({ status, message, data });
    }
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    }
    return Promise.reject({ status: -1, message: error.message });
  },
);

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/register/', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/login/', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout/');
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/api/auth/profile/');
    return data;
  },
};

// ============================================================
// Items API
// ============================================================
export const itemsApi = {
  list: async (page: number = 1): Promise<PaginatedResponse<GroceryItem>> => {
    const { data } = await api.get('/api/items/', { params: { page } });
    // Handle non-paginated responses
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getById: async (id: number): Promise<GroceryItem> => {
    const { data } = await api.get(`/api/items/${id}/`);
    return data;
  },

  create: async (payload: CreateItemPayload): Promise<GroceryItem> => {
    const { data } = await api.post('/api/items/', payload);
    return data;
  },

  update: async (id: number, payload: UpdateItemPayload): Promise<GroceryItem> => {
    const { data } = await api.patch(`/api/items/${id}/`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/items/${id}/`);
  },
};

// ============================================================
// Purchases API
// ============================================================
export const purchasesApi = {
  list: async (
    filters: PurchaseFilters = {},
  ): Promise<PaginatedResponse<Purchase>> => {
    const params: Record<string, any> = {};
    if (filters.item) {params.item = filters.item;}
    if (filters.item_name) {params.item_name = filters.item_name;}
    if (filters.date_from) {params.date_from = filters.date_from;}
    if (filters.date_to) {params.date_to = filters.date_to;}
    if (filters.month) {params.month = filters.month;}
    if (filters.year) {params.year = filters.year;}
    if (filters.page) {params.page = filters.page;}

    const { data } = await api.get('/api/purchases/', { params });
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getById: async (id: number): Promise<Purchase> => {
    const { data } = await api.get(`/api/purchases/${id}/`);
    return data;
  },

  create: async (payload: CreatePurchasePayload): Promise<Purchase> => {
    const { data } = await api.post('/api/purchases/', payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdatePurchasePayload,
  ): Promise<Purchase> => {
    const { data } = await api.patch(`/api/purchases/${id}/`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/purchases/${id}/`);
  },
};

// ============================================================
// Reports API
// ============================================================
export const reportsApi = {
  monthlySummary: async (
    month: number,
    year: number,
  ): Promise<MonthlySummary> => {
    const { data } = await api.get('/api/reports/monthly-summary/', {
      params: { month, year },
    });
    return data;
  },

  itemFrequency: async (
    month: number,
    year: number,
  ): Promise<ItemFrequencyReport> => {
    const { data } = await api.get('/api/reports/item-frequency/', {
      params: { month, year },
    });
    return data;
  },

  dailyBreakdownByDate: async (
    date: string,
  ): Promise<DailyBreakdownSingle> => {
    const { data } = await api.get('/api/reports/daily-breakdown/', {
      params: { date },
    });
    return data;
  },

  dailyBreakdownByMonth: async (
    month: number,
    year: number,
  ): Promise<DailyBreakdownMonth> => {
    const { data } = await api.get('/api/reports/daily-breakdown/', {
      params: { month, year },
    });
    return data;
  },
};

export default api;

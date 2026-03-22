import { apiRequest, API_ENDPOINTS } from './api';
import { User, AuthResponse } from '../types';

const normalizeUser = (payload: unknown): User => {
  const u = payload as Partial<User> & { id?: unknown; userId?: unknown; _id?: unknown };
  const _id =
    (typeof u?._id === 'string' && u._id) ||
    (typeof u?.id === 'string' && u.id) ||
    (typeof u?.userId === 'string' && u.userId) ||
    '';
  return {
    _id,
    email: typeof u?.email === 'string' ? u.email : '',
    firstName: typeof u?.firstName === 'string' ? u.firstName : '',
    lastName: typeof u?.lastName === 'string' ? u.lastName : '',
    role: u?.role === 'admin' ? 'admin' : 'customer',
    preferences: u?.preferences,
  };
};

const normalizeAuthResponse = (payload: unknown): AuthResponse => {
  const obj = payload as {
    token?: unknown;
    user?: unknown;
    data?: { user?: unknown } | unknown;
    result?: { user?: unknown } | unknown;
  };
  const token = typeof obj?.token === 'string' ? obj.token : '';
  const dataUser =
    obj?.data && typeof obj.data === 'object' ? (obj.data as { user?: unknown }).user : undefined;
  const resultUser =
    obj?.result && typeof obj.result === 'object' ? (obj.result as { user?: unknown }).user : undefined;
  const userPayload = obj?.user ?? dataUser ?? resultUser;
  return { token, user: normalizeUser(userPayload) };
};

export const userService = {
  registerCustomer: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.users}/api/users/register`, {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'customer' }),
    });
    return normalizeAuthResponse(res);
  },

  createUserAsAdmin: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'admin';
  }): Promise<AuthResponse> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.users}/api/users/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeAuthResponse(res);
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.users}/api/users/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeAuthResponse(res);
  },

  getProfile: async (userId: string): Promise<User> => {
    return apiRequest<User>(`${API_ENDPOINTS.users}/api/users/${userId}`);
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    return apiRequest<User>(`${API_ENDPOINTS.users}/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getPreferences: async (userId: string): Promise<unknown> => {
    return apiRequest(`${API_ENDPOINTS.users}/api/users/${userId}/preferences`);
  },
};

import { apiRequest, API_ENDPOINTS } from './api';
import { Payment } from '../types';

const normalizePayment = (payload: unknown): Payment => {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const candidate = (obj.payment || obj.data || obj.result || payload) as unknown;
    if (candidate && typeof candidate === 'object') return candidate as Payment;
  }
  return payload as Payment;
};

export const paymentService = {
  process: async (data: {
    bookingId: string;
    amount: number;
    userId: string;
  }): Promise<Payment> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.payments}/api/payments/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizePayment(res);
  },

  getById: async (paymentId: string): Promise<Payment> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.payments}/api/payments/${paymentId}`);
    return normalizePayment(res);
  },

  getByBookingId: async (bookingId: string): Promise<Payment> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.payments}/api/payments/booking/${bookingId}`);
    return normalizePayment(res);
  },

  refund: async (paymentId: string): Promise<Payment> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.payments}/api/payments/${paymentId}/refund`, {
      method: 'POST',
    });
    return normalizePayment(res);
  },
};

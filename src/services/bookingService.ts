import { apiRequest, API_ENDPOINTS } from './api';
import { Booking } from '../types';

const normalizeBooking = (payload: unknown): Booking => {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const candidate = (obj.booking || obj.data || obj.result || payload) as unknown;
    if (candidate && typeof candidate === 'object') return candidate as Booking;
  }
  return payload as Booking;
};

const normalizeBookingArray = (payload: unknown): Booking[] => {
  if (Array.isArray(payload)) return payload as Booking[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const candidates = [obj.bookings, obj.data, obj.items, obj.results];
    const match = candidates.find(Array.isArray);
    if (Array.isArray(match)) return match as Booking[];
  }
  return [];
};

export const bookingService = {
  create: async (data: {
    userId: string;
    eventId: string;
    quantity: number;
  }): Promise<Booking> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.bookings}/api/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeBooking(res);
  },

  getById: async (bookingId: string): Promise<Booking> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.bookings}/api/bookings/${bookingId}`);
    return normalizeBooking(res);
  },

  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.bookings}/api/bookings/user/${userId}`);
    return normalizeBookingArray(res);
  },

  cancel: async (bookingId: string): Promise<Booking> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.bookings}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
    return normalizeBooking(res);
  },

  confirm: async (bookingId: string): Promise<Booking> => {
    const res = await apiRequest<unknown>(`${API_ENDPOINTS.bookings}/api/bookings/${bookingId}/confirm`, {
      method: 'POST',
    });
    return normalizeBooking(res);
  },
};

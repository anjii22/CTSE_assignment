import { apiRequest, API_ENDPOINTS } from './api';
import { Event } from '../types';

const normalizeEventArray = (payload: unknown): Event[] => {
  if (Array.isArray(payload)) return payload as Event[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const candidates = [obj.events, obj.data, obj.items, obj.results];
    const match = candidates.find(Array.isArray);
    if (Array.isArray(match)) return match as Event[];
  }
  return [];
};

export const eventService = {
  getAll: async (filters?: {
    category?: string;
    date?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = `${API_ENDPOINTS.events}/api/events${queryString ? `?${queryString}` : ''}`;
    const res = await apiRequest<unknown>(url);
    return normalizeEventArray(res);
  },

  getById: async (eventId: string): Promise<Event> => {
    return apiRequest<Event>(`${API_ENDPOINTS.events}/api/events/${eventId}`);
  },

  create: async (data: {
    title: string;
    description: string;
    organizerId: string;
    venue: Record<string, unknown>;
    date: string;
    time: string;
    totalTickets: number;
    price: number;
    category?: string;
    imageUrl?: string;
  }): Promise<Event> => {
    return apiRequest<Event>(`${API_ENDPOINTS.events}/api/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (eventId: string, data: Partial<Event>): Promise<Event> => {
    return apiRequest<Event>(`${API_ENDPOINTS.events}/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  checkAvailability: async (eventId: string): Promise<{ available: boolean; availableTickets: number }> => {
    return apiRequest(`${API_ENDPOINTS.events}/api/events/${eventId}/availability`);
  },

  search: async (query: string): Promise<Event[]> => {
    const res = await apiRequest<unknown>(
      `${API_ENDPOINTS.events}/api/events/search?q=${encodeURIComponent(query)}`
    );
    return normalizeEventArray(res);
  },
};

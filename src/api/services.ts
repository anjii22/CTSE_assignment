import { userApi, eventApi, bookingApi, paymentApi } from "./client";
import type {
  AuthResponse, Event, EventsResponse, User, Booking,
  BookingsResponse, Payment, LoginRequest, RegisterRequest, BookingRequest,
} from "@/types";

// User Service
export const userService = {
  register: (data: RegisterRequest) =>
    userApi.post<AuthResponse>("/api/users/register", data),
  login: (data: LoginRequest) =>
    userApi.post<AuthResponse>("/api/users/login", data),
  getProfile: (userId: string) =>
    userApi.get<User>(`/api/users/${userId}`),
  updateProfile: (userId: string, data: Partial<User>) =>
    userApi.put<User>(`/api/users/${userId}`, data),
  getPreferences: (userId: string) =>
    userApi.get(`/api/users/${userId}/preferences`),
};

// Event Service
export const eventService = {
  getAll: (params?: Record<string, string>) =>
    eventApi.get<EventsResponse>("/api/events", { params }),
  getById: (eventId: string) =>
    eventApi.get<Event>(`/api/events/${eventId}`),
  create: (data: Partial<Event>) =>
    eventApi.post<Event>("/api/events", data),
  update: (eventId: string, data: Partial<Event>) =>
    eventApi.put<Event>(`/api/events/${eventId}`, data),
  checkAvailability: (eventId: string) =>
    eventApi.get(`/api/events/${eventId}/availability`),
  search: (params: Record<string, string>) =>
    eventApi.get<EventsResponse>("/api/events/search", { params }),
};

// Booking Service
export const bookingService = {
  create: (data: BookingRequest) =>
    bookingApi.post<Booking>("/api/bookings", data),
  getById: (bookingId: string) =>
    bookingApi.get<Booking>(`/api/bookings/${bookingId}`),
  getUserBookings: (userId: string) =>
    bookingApi.get<BookingsResponse>(`/api/bookings/user/${userId}`),
  cancel: (bookingId: string) =>
    bookingApi.put<Booking>(`/api/bookings/${bookingId}/cancel`),
  confirm: (bookingId: string) =>
    bookingApi.put<Booking>(`/api/bookings/${bookingId}/confirm`),
};

// Payment Service
export const paymentService = {
  process: (data: { bookingId: string; userId: string; amount: number; paymentMethod: string }) =>
    paymentApi.post<Payment>("/api/payments/process", data),
  getById: (paymentId: string) =>
    paymentApi.get<Payment>(`/api/payments/${paymentId}`),
  getByBooking: (bookingId: string) =>
    paymentApi.get<Payment>(`/api/payments/booking/${bookingId}`),
  refund: (paymentId: string) =>
    paymentApi.put<Payment>(`/api/payments/${paymentId}/refund`),
};

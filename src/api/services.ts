import { userApi, eventApi, bookingApi, paymentApi } from "./client";
import type {
  AuthResponse, Event, EventsResponse, User, Booking,
  BookingsResponse, Payment, LoginRequest, RegisterRequest, BookingRequest,
} from "@/types";

// User Service
export const userService = {
  register: (data: RegisterRequest) =>
    userApi.post<AuthResponse>("/register", data),
  login: (data: LoginRequest) =>
    userApi.post<AuthResponse>("/login", data),
  getProfile: (userId: string) =>
    userApi.get<User>(`/${userId}`),
  updateProfile: (userId: string, data: Partial<User>) =>
    userApi.put<User>(`/${userId}`, data),
  getPreferences: (userId: string) =>
    userApi.get(`/${userId}/preferences`),
};

// Event Service
export const eventService = {
  getAll: (params?: Record<string, string>) =>
    eventApi.get<EventsResponse>("/", { params }),
  getById: (eventId: string) =>
    eventApi.get<Event>(`/${eventId}`),
  create: (data: Partial<Event>) =>
    eventApi.post<Event>("/", data),
  update: (eventId: string, data: Partial<Event>) =>
    eventApi.put<Event>(`/${eventId}`, data),
  checkAvailability: (eventId: string) =>
    eventApi.get(`/${eventId}/availability`),
  search: (params: Record<string, string>) =>
    eventApi.get<EventsResponse>("/search", { params }),
};

// Booking Service
export const bookingService = {
  create: (data: BookingRequest) =>
    bookingApi.post<Booking>("/", data),
  getById: (bookingId: string) =>
    bookingApi.get<Booking>(`/${bookingId}`),
  getUserBookings: (userId: string) =>
    bookingApi.get<BookingsResponse>(`/user/${userId}`),
  cancel: (bookingId: string) =>
    bookingApi.put<Booking>(`/${bookingId}/cancel`),
  confirm: (bookingId: string) =>
    bookingApi.put<Booking>(`/${bookingId}/confirm`),
};

// Payment Service
export const paymentService = {
  process: (data: { bookingId: string; userId: string; amount: number; paymentMethod: string }) =>
    paymentApi.post<Payment>("/process", data),
  getById: (paymentId: string) =>
    paymentApi.get<Payment>(`/${paymentId}`),
  getByBooking: (bookingId: string) =>
    paymentApi.get<Payment>(`/booking/${bookingId}`),
  refund: (paymentId: string) =>
    paymentApi.put<Payment>(`/api/payments/${paymentId}/refund`),
};

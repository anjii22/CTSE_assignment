export interface Venue {
  name: string;
  address: string;
  city: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  organizerId: string;
  date: string;
  time: string;
  category: string;
  totalTickets: number;
  availableTickets: number;
  price: number;
  imageUrl: string;
  status: string;
  venue: Venue;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
  };
  createdAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentId: string;
  cancellationDate: string | null;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  status: "success" | "failed" | "refunded" | "pending";
  paymentMethod: string;
  transactionId: string;
  refundAmount: number;
  refundDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface BookingRequest {
  userId: string;
  eventId: string;
  quantity: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface EventsResponse {
  events: Event[];
  total?: number;
  page?: number;
  pages?: number;
}

export interface BookingsResponse {
  userId: string;
  count: number;
  bookings: Booking[];
}

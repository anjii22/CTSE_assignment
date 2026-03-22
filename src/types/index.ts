export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  preferences?: unknown;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  organizerId: string;
  venue: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  date: string;
  time: string;
  totalTickets: number;
  availableTickets?: number;
  price: number;
  category?: string;
  imageUrl?: string;
}

export interface Booking {
  _id: string;
  userId: string;
  eventId: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  event?: Event;
}

export interface Payment {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAuthToken, removeAuthToken, getAuthToken } from '../services/api';
import { userService } from '../services/userService';
import { navigate } from '../components/navigation/history';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeStoredUser = (payload: unknown): User | null => {
    if (!payload || typeof payload !== 'object') return null;
    const u = payload as Partial<User> & { id?: unknown; userId?: unknown; _id?: unknown };
    const _id =
      (typeof u?._id === 'string' && u._id) ||
      (typeof u?.id === 'string' && u.id) ||
      (typeof u?.userId === 'string' && u.userId) ||
      '';
    if (!_id) return null;
    return {
      _id,
      email: typeof u?.email === 'string' ? u.email : '',
      firstName: typeof u?.firstName === 'string' ? u.firstName : '',
      lastName: typeof u?.lastName === 'string' ? u.lastName : '',
      role: u?.role === 'admin' ? 'admin' : 'customer',
      preferences: u?.preferences,
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser) as unknown;
            const normalized = normalizeStoredUser(parsed);
            if (normalized) {
              setUser(normalized);
              localStorage.setItem('user', JSON.stringify(normalized));
            }
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await userService.login({ email, password });
    setAuthToken(response.token);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await userService.registerCustomer(data);
    setAuthToken(response.token);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

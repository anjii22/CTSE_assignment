
const BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  users: `${BASE_URL}/users`,
  events: `${BASE_URL}/events`,
  bookings: `${BASE_URL}/bookings`,
  payments: `${BASE_URL}/payments`,
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export class HttpError extends Error {
  status: number;
  url: string;
  method: string;
  bodyText?: string;

  constructor(args: { status: number; url: string; method: string; message: string; bodyText?: string }) {
    super(args.message);
    this.name = 'HttpError';
    this.status = args.status;
    this.url = args.url;
    this.method = args.method;
    this.bodyText = args.bodyText;
  }
}

export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let message = '';
    let bodyText: string | undefined;

    try {
      if (contentType.includes('application/json')) {
        const body = (await response.json()) as unknown;
        if (body && typeof body === 'object') {
          const obj = body as Record<string, unknown>;
          message =
            (typeof obj.message === 'string' && obj.message) ||
            (typeof obj.error === 'string' && obj.error) ||
            '';
        }
        if (!message) {
          message = JSON.stringify(body);
        }
      } else {
        message = await response.text();
      }
      bodyText = message;
    } catch {
      // ignore parsing failures
    }

    const suffix = message ? ` - ${message}` : '';
    const method = (options.method || 'GET').toUpperCase();
    throw new HttpError({
      status: response.status,
      url,
      method,
      message: `HTTP error! ${method} ${url} - status: ${response.status}${suffix}`,
      bodyText,
    });
  }

  return response.json();
};

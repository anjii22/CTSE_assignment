import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userApi = axios.create({ baseURL: `${BASE_URL}/users` });
export const eventApi = axios.create({ baseURL: `${BASE_URL}/events` });
export const bookingApi = axios.create({ baseURL: `${BASE_URL}/bookings` });
export const paymentApi = axios.create({ baseURL: `${BASE_URL}/payments` });

const addAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );
};

[userApi, eventApi, bookingApi, paymentApi].forEach(addAuthInterceptor);

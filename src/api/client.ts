import axios from "axios";

const API_BASE_URL = "/api";

export const userApi = axios.create({ baseURL: `${API_BASE_URL}/users` });
export const eventApi = axios.create({ baseURL: `${API_BASE_URL}/events` });
export const bookingApi = axios.create({ baseURL: `${API_BASE_URL}/bookings` });
export const paymentApi = axios.create({ baseURL: `${API_BASE_URL}/payments` });

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

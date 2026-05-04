import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lockr_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token is expired/invalid, log out automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lockr_token");
      localStorage.removeItem("lockr_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

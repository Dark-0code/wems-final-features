import axios from "axios";

const api = axios.create({
  baseURL: "https://wems-final-features.onrender.com/api",
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("wemsUser") || "null");

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
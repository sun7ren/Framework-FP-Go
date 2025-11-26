import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Your Go Backend URL
});

// Automatically add the Token to every request if we have it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
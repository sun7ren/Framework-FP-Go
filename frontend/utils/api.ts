import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", 
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/me");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return null;
  }
};

export default api;
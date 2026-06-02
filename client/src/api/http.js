import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tfc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiError = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

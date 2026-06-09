import axios from "axios";
import {
  API_BASE_URL,
  AUTH_HEADER,
  BEARER_PREFIX,
} from "./config.js";
import { clearAuthToken, getAuthToken } from "./authToken.js";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers[AUTH_HEADER] = `${BEARER_PREFIX}${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.message || "Request failed";

    if (status === 401 && getAuthToken()) {
      clearAuthToken();
      return Promise.reject(new Error("Session expired. Please sign in again."));
    }

    return Promise.reject(new Error(message));
  },
);

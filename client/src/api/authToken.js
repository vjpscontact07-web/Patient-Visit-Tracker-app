import { TOKEN_STORAGE_KEY } from "./config.js";

let cachedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

export function getAuthToken() {
  return cachedToken;
}

export function setAuthToken(token) {
  cachedToken = token;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}

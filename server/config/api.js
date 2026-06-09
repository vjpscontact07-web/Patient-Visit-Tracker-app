export const API_PREFIX = "/api";

export const ROUTES = {
  health: "/health",
  auth: "/auth",
  clinicians: "/clinicians",
  patients: "/patients",
  visits: "/visits",
};

export function apiPath(segment) {
  return `${API_PREFIX}${segment}`;
}

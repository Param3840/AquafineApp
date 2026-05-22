import { API_BASE_URL } from "../utils/constants";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const authService = {
  register: (payload) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  forgotPassword: (payload) =>
    request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token) =>
    request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  validateSession: (token) =>
    request("/api/auth/validate-session", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

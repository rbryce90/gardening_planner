import api from "./api";

export const register = (firstName, lastName, email, password) =>
  api.post("/api/auth", { firstName, lastName, email, password });

export const login = (email, password) => api.post("/api/auth/login", { email, password });

export const getMe = () => api.get("/api/auth/me");

export const updateProfile = (email, firstName, lastName) =>
  api.put("/api/auth/profile", { email, firstName, lastName });

export const logout = () => api.post("/api/auth/logout");

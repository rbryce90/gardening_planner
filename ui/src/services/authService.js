import axios from "axios";

export const register = (firstName, lastName, email, password) =>
  axios.post("/api/auth", { firstName, lastName, email, password }, { withCredentials: true });

export const login = (email, password) =>
  axios.post("/api/auth/login", { email, password }, { withCredentials: true });

export const getMe = () =>
  axios.get("/api/auth/me", { withCredentials: true });

import axios from "axios";

const api = axios.create({
  baseURL: "/v1",
  withCredentials: true,
});

export default api;

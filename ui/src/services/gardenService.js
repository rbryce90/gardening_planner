import axios from "axios";

export const getGardens = () =>
  axios.get("/api/gardens", { withCredentials: true });

export const createGarden = (name, rows, cols) =>
  axios.post("/api/gardens", { name, rows, cols }, { withCredentials: true });

export const getGarden = (id) =>
  axios.get(`/api/gardens/${id}`, { withCredentials: true });

export const upsertCell = (gardenId, row, col, plantId) =>
  axios.put(`/api/gardens/${gardenId}/cells/${row}/${col}`, { plantId }, { withCredentials: true });

export const clearCell = (gardenId, row, col) =>
  axios.delete(`/api/gardens/${gardenId}/cells/${row}/${col}`, { withCredentials: true });

export const deleteGarden = (id) =>
  axios.delete(`/api/gardens/${id}`, { withCredentials: true });

export const getAllCompanions = () =>
  axios.get("/api/plants/companions");

export const getAllAntagonists = () =>
  axios.get("/api/plants/antagonists");

import api from "./api";

export const getGardens = () => api.get("/api/gardens");

export const createGarden = (name, rows, cols) => api.post("/api/gardens", { name, rows, cols });

export const getGarden = (id) => api.get(`/api/gardens/${id}`);

export const upsertCell = (gardenId, row, col, plantId) =>
  api.put(`/api/gardens/${gardenId}/cells/${row}/${col}`, { plantId });

export const clearCell = (gardenId, row, col) =>
  api.delete(`/api/gardens/${gardenId}/cells/${row}/${col}`);

export const deleteGarden = (id) => api.delete(`/api/gardens/${id}`);

export const getAllCompanions = () => api.get("/api/plants/companions");

export const getAllAntagonists = () => api.get("/api/plants/antagonists");

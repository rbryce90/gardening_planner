import api from "./api";

export const getZones = () => api.get("/api/zones");

export const updateUserZone = (zoneId) => api.put("/api/auth/zone", { zoneId });

export const getPlantingCalendar = (zoneId) => api.get(`/api/planting-calendar/${zoneId}`);

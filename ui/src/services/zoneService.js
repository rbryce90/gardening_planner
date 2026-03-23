import axios from "axios";

export const getZones = () =>
  axios.get("/api/zones");

export const updateUserZone = (zoneId) =>
  axios.put("/api/auth/zone", { zoneId }, { withCredentials: true });

export const getPlantingCalendar = (zoneId) =>
  axios.get(`/api/planting-calendar/${zoneId}`, { withCredentials: true });

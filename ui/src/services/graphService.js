import api from "./api";

export const getPlantGraph = (plantId, hops = 2) =>
  api.get(`/api/graph/plants/${plantId}?hops=${hops}`);

export const getRecommendations = (plantIds) =>
  api.get(`/api/graph/recommendations?plantIds=${plantIds.join(",")}`);

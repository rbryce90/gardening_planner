// These must be interfaces (not types) in a .ts file (not .d.ts) for TSOA to use them in swagger generation

export interface PlantResponse {
  id?: number;
  name: string;
  category: string;
  growthForm: string;
  ediblePart?: string;
}

export interface PlantCreateRequest {
  name: string;
  category: string;
  growthForm: string;
  ediblePart?: string;
}

export interface PlantDetailResponse {
  id?: number;
  name: string;
  category: string;
  growthForm: string;
  types: PlantTypeResponse[];
  companions: PlantResponse[];
  antagonists: PlantResponse[];
}

export interface PlantTypeResponse {
  id?: string;
  name: string;
  description?: string;
  plantingNotes?: string;
}

export interface PlantTypeCreateRequest {
  name: string;
  description?: string;
  planting_notes?: string;
}

export interface CompanionPair {
  plantId: number;
  companionId: number;
}

export interface AntagonistPair {
  plantId: number;
  antagonistId: number;
}

export interface GardenResponse {
  id: number;
  userId: number;
  name: string;
  rows: number;
  cols: number;
  createdAt?: string;
}

export interface GardenDetailResponse extends GardenResponse {
  cells: GardenCellResponse[];
}

export interface GardenCellResponse {
  id: number;
  gardenId: number;
  row: number;
  col: number;
  plantId: number;
  plantName?: string;
}

export interface GardenCreateRequest {
  name: string;
  rows: number;
  cols: number;
}

export interface CellUpdateRequest {
  plantId: number;
}

export interface ZoneResponse {
  id: number;
  name: string;
  minTemperature: number;
  maxTemperature: number;
}

export interface PlantingSeasonResponse {
  id: number;
  startMonth: string;
  endMonth: string;
  method: string;
  notes: string | null;
  plantTypeName: string;
  plantName: string;
}

export interface GraphNodeResponse {
  id: number;
  name: string;
  category: string;
  growthForm: string;
}

export interface GraphEdgeResponse {
  source: number;
  target: number;
  type: "companion" | "antagonist";
}

export interface GraphDataResponse {
  nodes: GraphNodeResponse[];
  edges: GraphEdgeResponse[];
}

export interface PlantRecommendationResponse {
  id: number;
  name: string;
  category: string;
  growthForm: string;
  companionCount: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ZoneUpdateRequest {
  zoneId: number;
}

export interface ProfileUpdateRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  zoneId?: number;
  isAdmin?: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}

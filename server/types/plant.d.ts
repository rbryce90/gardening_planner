export type Plant = {
  id?: number;
  name: string;
  category: string;
  growthForm: string;
  ediblePart?: string;
};
export type PlantType = {
  id?: number;
  plantId: number;
  name: string;
  description?: string;
  plantingNotes?: string;
};

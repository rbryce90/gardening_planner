export type Garden = {
  id: number;
  userId: number;
  name: string;
  rows: number;
  cols: number;
  createdAt?: string;
};

export type GardenCell = {
  id: number;
  gardenId: number;
  row: number;
  col: number;
  plantId: number;
  plantName?: string;
};

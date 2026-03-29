export type Zone = {
    id: number;
    name: string;
    minTemperature: number;
    maxTemperature: number;
};

export type PlantingSeason = {
    id: number;
    startMonth: string;
    endMonth: string;
    method: string;
    notes: string | null;
    plantTypeName: string;
    plantName: string;
};

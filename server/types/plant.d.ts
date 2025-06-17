export type Plant = {
    id?: string,
    name: string,
    category: string,
    growthForm: string,
    ediblePart?: string,
}
export type PlantType = {
    id?: string,
    plantId: string,
    name: string,
    description?: string,
    plantingNotes?: string
}
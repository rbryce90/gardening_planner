export type Plant = {
    id?: string,
    name: string,
    category: string,
    growthForm: string
}
export type PlantType = {
    id?: string,
    plantId: string,
    name: string,
    description?: string,
    plantingNotes?: string
}
export type Companion = {
    id?: string,
    plant_typeId: string,
    companionId: string
}
export type Antagonist = {
    id?: string,
    plant_typeId: string,
    antagonistId: string
}
export type Zone = {
    id?: string,
    name: string,
    minTemperature?: number,
    maxTemperature?: number
}

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
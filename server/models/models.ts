export type User = {
    firstName: string,
    stripeCustomerId: string,
    lastName: string,
    middleName?: string,
    email: string,
    password: string,
    phoneNumber: string,
    id?: number
}

export interface UserLoginInterface {
    email: string,
    password: string
}

export enum AuthHeaders {
    SESSION_ID = "session_id"
}

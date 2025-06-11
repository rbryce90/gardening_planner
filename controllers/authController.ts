import { User, UserLoginInterface } from "../models/models.ts";
import { createSession, destorySession } from "../repositories/authRepository.ts";
import { validatePasswordAndGetUserId } from "../repositories/userRepository.ts";
import { createUser as addUserToDb } from "../repositories/userRepository.ts";
import { createCustomer } from "./stripeController.ts";
import logger from "../utils/logger.ts";

export const login = async (creds: UserLoginInterface) => {
    return await validatePasswordAndGetUserId(creds)
}

export const createUser = async (user: User) => {
    try {
        const customer = await createCustomer(user)
        user.stripeCustomerId = customer.id
    } catch (err) {
        logger.error('Error creating Stripe customer: ', err.message)
        throw Error('Error creating customer')
    }
    return await addUserToDb(user);
};

export const createAndGetSessionID = async (user: Partial<User>) => {
    return await createSession(user)
}

export const logout = async (sessionId: string) => {
    return await destorySession(sessionId)
}
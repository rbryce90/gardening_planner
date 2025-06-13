import userDb from "../databases/userDb.ts";
import logger from "../utils/logger.ts";
import { User, UserLoginInterface } from "../models/models.ts";
import { hashPassword, isPasswordCorrect } from "../utils/hash.ts";

const GET_ALL_USERS = 'SELECT id, first_name, last_name, email FROM users'
const GET_USER_PASSWORD_BY_EMAIL = "SELECT password, id, email, first_name, last_name FROM users WHERE email = ?";
const CREATE_USER_GET_ID = "INSERT INTO users (first_name, last_name, email, password, phone_number, stripe_customer_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING id"

export const getAllUsers = async (): Promise<User[]> => {
    return await userDb.query(GET_ALL_USERS).map(([id, first_name, last_name, email]) => ({
        id,
        firstName: first_name,
        lastName: last_name,
        email,
    } as User));
};

export const createUser = async (user: User) => {
    const { firstName, lastName, email, password, phoneNumber, stripeCustomerId } = user
    try {
        const hashedPassword = await hashPassword(password as string)
        return await userDb.query(CREATE_USER_GET_ID, [firstName, lastName, email, hashedPassword, phoneNumber, stripeCustomerId])[0][0];
    } catch (error) {
        logger.error("Error inserting user into database:", error);
        throw new Error("Error creating user, please try again");
    }
};

export const validatePasswordAndGetUserId = async ({ email, password }: UserLoginInterface) => {
    try {
        const [storedPassword, id, storedEmail, firstName, lastName, phoneNumber] = await userDb.query(GET_USER_PASSWORD_BY_EMAIL, [email])[0]
        const isCorrect = await isPasswordCorrect(password, storedPassword as string)
        if (isCorrect) {
            return { email: storedEmail, id, firstName, lastName, phoneNumber }
        }
        throw Error('Wrong credentials')
    } catch (err) {
        logger.error(err)
        throw Error('Username not found')
    }
}
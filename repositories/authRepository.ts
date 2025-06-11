import { generate } from "https://deno.land/std@0.62.0/uuid/v4.ts";
import db from "../databases/userDb.ts";
import { User } from "../models/models.ts";
import logger from "../utils/logger.ts";

const CREATE_SESSION = "INSERT INTO sessions (id, user_id, data, expiry) VALUES(?, ?, ?, ?) RETURNING id"
const UPSERT_SESSION = "UPDATE sessions SET expiry = ? where id = ?"
const GET_SESSION = "SELECT data FROM sessions WHERE id = ? AND expiry > ?"
const DELETE_SESSION = "DELETE FROM sessions where id  = ?"

export const updateSession = async (id: string) => {
    const expiresAt = Date.now() + 3600 * 1000;
    await db.query(
        UPSERT_SESSION,
        [expiresAt, id]
    );
};

export const getSession = async (id: string) => {
    const result = await db.query(
        GET_SESSION,
        [id, Date.now()]
    );
    if (result.length > 0) {
        const data = result[0][0];
        return JSON.parse(data as string);
    }
    logger.info('User does not have session')
    throw Error('No user session')
};

export const createSession = async ({ id, firstName, lastName }: Partial<User>) => {
    const sessionId = generate();
    const sessionData = { id, firstName, lastName };
    const expiresAt = Date.now() + 3600 * 1000;  // 1-hour expiry
    return await db.query(CREATE_SESSION, [
        sessionId,
        id,
        JSON.stringify(sessionData),
        expiresAt,
    ]);
}

export const destorySession = async (sessionId: string) => {
    return await db.query(DELETE_SESSION, [sessionId])
}
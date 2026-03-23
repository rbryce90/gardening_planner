import { getDatabase } from "../databases/userDb.ts";
import { User } from "../types/user.d.ts";
import { hashPassword } from "../utils/hash.ts";

export class UserRepository {
    async createUser(email: string, password: string, firstName: string, lastName: string): Promise<number> {
        const db = getDatabase();
        const hashedPassword = await hashPassword(password);
        const result = db.prepare(
            "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?) RETURNING id"
        ).get(email, hashedPassword, firstName, lastName) as { id: number };
        return result.id;
    }

    async findByEmail(email: string): Promise<Omit<User, "createdAt"> | null> {
        const db = getDatabase();
        const result = db.prepare(
            "SELECT id, email, password, first_name as firstName, last_name as lastName FROM users WHERE email = ?"
        ).get(email) as Omit<User, "createdAt"> | undefined;
        return result ?? null;
    }

    async findById(id: number): Promise<Omit<User, "password" | "createdAt"> | null> {
        const db = getDatabase();
        const result = db.prepare(
            "SELECT id, email, first_name as firstName, last_name as lastName, zone_id as zoneId FROM users WHERE id = ?"
        ).get(id) as Omit<User, "password" | "createdAt"> | undefined;
        return result ?? null;
    }

    async updateZone(userId: number, zoneId: number): Promise<void> {
        const db = getDatabase();
        db.prepare("UPDATE users SET zone_id = ? WHERE id = ?").run(zoneId, userId);
    }
}

export const userRepository = new UserRepository();

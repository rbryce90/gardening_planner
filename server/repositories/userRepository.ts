import { getDatabase } from "../databases/userDb.ts";
import type { User } from "../types/user.d.ts";
import { hashPassword } from "../utils/hash.ts";

class UserRepository {
  // Stays async because hashPassword uses bcrypt
  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<number> {
    const db = getDatabase();
    const hashedPassword = await hashPassword(password);
    const result = db
      .prepare(
        "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?) RETURNING id",
      )
      .get(email, hashedPassword, firstName, lastName) as { id: number };
    return result.id;
  }

  findByEmail(email: string): (Omit<User, "createdAt"> & { isAdmin: boolean }) | null {
    const db = getDatabase();
    const result = db
      .prepare(
        "SELECT id, email, password, first_name as firstName, last_name as lastName, is_admin as isAdmin FROM users WHERE email = ?",
      )
      .get(email) as any | undefined;
    if (!result) return null;
    return { ...result, isAdmin: result.isAdmin === 1 };
  }

  findById(id: number): (Omit<User, "password" | "createdAt"> & { isAdmin: boolean }) | null {
    const db = getDatabase();
    const result = db
      .prepare(
        "SELECT id, email, first_name as firstName, last_name as lastName, zone_id as zoneId, is_admin as isAdmin FROM users WHERE id = ?",
      )
      .get(id) as any | undefined;
    if (!result) return null;
    return { ...result, isAdmin: result.isAdmin === 1 };
  }

  updateZone(userId: number, zoneId: number): void {
    const db = getDatabase();
    db.prepare("UPDATE users SET zone_id = ? WHERE id = ?").run(zoneId, userId);
  }

  updateProfile(userId: number, email: string, firstName: string, lastName: string): void {
    const db = getDatabase();
    db.prepare("UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?").run(
      email,
      firstName,
      lastName,
      userId,
    );
  }

  setAdmin(userId: number, isAdmin: boolean): void {
    const db = getDatabase();
    db.prepare("UPDATE users SET is_admin = ? WHERE id = ?").run(isAdmin ? 1 : 0, userId);
  }
}

export const userRepository = new UserRepository();

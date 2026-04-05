process.env.JWT_SECRET = "test-secret";

import { setupTestDb, cleanupTestDb, initAllTables } from "./testDbHelper";

beforeAll(() => {
  setupTestDb();
  initAllTables();
});

afterAll(() => {
  cleanupTestDb();
});

import { hashPassword, comparePassword } from "../utils/hash.ts";
import { userRepository } from "../repositories/userRepository.ts";
import { register, login, verifyToken } from "../controllers/authController.ts";

describe("Auth", () => {
  describe("hashPassword and comparePassword", () => {
    it("hashes a password and verifies it", async () => {
      const hash = await hashPassword("mypassword");
      expect(hash).not.toBe("mypassword");
      const match = await comparePassword("mypassword", hash);
      expect(match).toBe(true);
    });

    it("rejects wrong password", async () => {
      const hash = await hashPassword("correct");
      const match = await comparePassword("wrong", hash);
      expect(match).toBe(false);
    });
  });

  describe("userRepository", () => {
    it("createUser creates a user and returns an id", async () => {
      const id = await userRepository.createUser(
        "repo-test@test.com",
        "password123",
        "Repo",
        "Test",
      );
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });

    it("findByEmail returns the user", () => {
      const user = userRepository.findByEmail("repo-test@test.com");
      expect(user).not.toBeNull();
      expect(user!.email).toBe("repo-test@test.com");
      expect(user!.firstName).toBe("Repo");
    });

    it("findByEmail returns null for nonexistent email", () => {
      const user = userRepository.findByEmail("nonexistent@test.com");
      expect(user).toBeNull();
    });
  });

  describe("authController", () => {
    it("register creates a user and returns a token", async () => {
      const result = await register("auth-register@test.com", "password123", "Auth", "Register");
      expect(result.userId).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
    });

    it("login returns a valid token for correct credentials", async () => {
      await register("auth-login@test.com", "secret", "Auth", "Login");

      const result = await login("auth-login@test.com", "secret");
      expect(result.userId).toBeDefined();
      expect(typeof result.token).toBe("string");

      const payload = await verifyToken(result.token);
      expect(payload.email).toBe("auth-login@test.com");
      expect(payload.userId).toBe(result.userId);
    });

    it("login throws for wrong password", async () => {
      await register("auth-wrong@test.com", "correct", "Auth", "Wrong");

      await expect(login("auth-wrong@test.com", "incorrect")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("login throws for nonexistent user", async () => {
      await expect(login("nobody@test.com", "password")).rejects.toThrow("Invalid credentials");
    });
  });
});

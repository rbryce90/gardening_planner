import { userRepository } from "../repositories/userRepository.ts";
import { comparePassword } from "../utils/hash.ts";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const secret = new TextEncoder().encode(JWT_SECRET);

export async function signToken(userId: number, email: string, isAdmin: boolean): Promise<string> {
  return await new SignJWT({ userId, email, isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string,
): Promise<{ userId: number; email: string; isAdmin: boolean }> {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: number; email: string; isAdmin: boolean };
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ userId: number; token: string }> {
  const userId = await userRepository.createUser(email, password, firstName, lastName);
  const token = await signToken(userId, email, false);
  return { userId, token };
}

export async function login(
  email: string,
  password: string,
): Promise<{ userId: number; token: string }> {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const token = await signToken(user.id, email, user.isAdmin);
  return { userId: user.id, token };
}

import { userRepository } from "../repositories/userRepository.ts";
import { comparePassword } from "../utils/hash.ts";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET")!);

export async function signToken(userId: number, email: string): Promise<string> {
    return await new SignJWT({ userId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string }> {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number; email: string };
}

export async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<{ userId: number; token: string }> {
    const userId = await userRepository.createUser(email, password, firstName, lastName);
    const token = await signToken(userId, email);
    return { userId, token };
}

export async function login(
    email: string,
    password: string
): Promise<{ userId: number; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
        throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }
    const token = await signToken(user.id, email);
    return { userId: user.id, token };
}

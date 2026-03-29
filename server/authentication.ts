import * as express from "express";
import { verifyToken } from "./controllers/authController.ts";

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  _scopes?: string[],
): Promise<{ userId: number; email: string; isAdmin: boolean }> {
  const token = request.cookies?.token;
  if (!token) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  const decoded = await verifyToken(token);

  if (securityName === "jwt") {
    return decoded;
  }

  if (securityName === "admin") {
    if (!decoded.isAdmin) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
    return decoded;
  }

  throw Object.assign(new Error("Unknown security scheme"), { status: 401 });
}

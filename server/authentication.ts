import * as express from "express";
import { verifyToken } from "./controllers/authController.ts";
import { HttpError } from "./utils/HttpError.ts";

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  _scopes?: string[],
): Promise<{ userId: number; email: string; isAdmin: boolean }> {
  const token = request.cookies?.token;
  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  const decoded = await verifyToken(token);

  if (securityName === "jwt") {
    return decoded;
  }

  if (securityName === "admin") {
    if (!decoded.isAdmin) {
      throw new HttpError(403, "Forbidden");
    }
    return decoded;
  }

  throw new HttpError(401, "Unknown security scheme");
}

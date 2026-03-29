import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../controllers/authController.ts";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies?.token;
    if (!token) {
        const err = Object.assign(new Error("Unauthorized"), { status: 401 });
        next(err);
        return;
    }
    try {
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    } catch {
        const err = Object.assign(new Error("Unauthorized"), { status: 401 });
        next(err);
    }
}

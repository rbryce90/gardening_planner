import { Router } from "express";
import { register, login } from "../controllers/authController.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { userRepository } from "../repositories/userRepository.ts";

const authRouter = Router();

authRouter.post("/", async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ message: "Email, password, first name, and last name are required" });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ message: "Password must be at least 8 characters" });
        return;
    }
    try {
        const result = await register(email, password, firstName, lastName);
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ message: "Registration successful", userId: result.userId });
    } catch (err) {
        const error = err as Error;
        if (error.message.includes("UNIQUE constraint") || error.message.includes("SQLITE_CONSTRAINT")) {
            res.status(409).json({ message: "Email already registered" });
            return;
        }
        next(err);
    }
});

authRouter.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }
    try {
        const result = await login(email, password);
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        next(err);
    }
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const user = await userRepository.findById(req.user!.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (err) {
        next(err);
    }
});

export default authRouter;

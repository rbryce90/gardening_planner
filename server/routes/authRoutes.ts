import { Controller, Route, Tags, Post, Get, Put, Body, Request, Security } from "tsoa";
import * as express from "express";
import { register, login } from "../controllers/authController.ts";
import { userRepository } from "../repositories/userRepository.ts";
import { HttpError } from "../utils/HttpError.ts";
import type {
  RegisterRequest,
  LoginRequest,
  ZoneUpdateRequest,
  ProfileUpdateRequest,
  UserResponse,
  MessageResponse,
  RegisterResponse,
} from "../types/models.ts";

@Route("v1/api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/")
  public async register(
    @Body() body: RegisterRequest,
    @Request() req: express.Request,
  ): Promise<RegisterResponse> {
    const { email, password, firstName, lastName } = body;
    if (!email || !password || !firstName || !lastName) {
      throw new HttpError(400, "Email, password, first name, and last name are required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "Invalid email format");
    }
    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }
    try {
      const result = await register(email, password, firstName, lastName);
      req.res!.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      this.setStatus(201);
      return { message: "Registration successful", userId: result.userId };
    } catch (err) {
      const error = err as Error;
      if (
        error.message.includes("UNIQUE constraint") ||
        error.message.includes("SQLITE_CONSTRAINT")
      ) {
        throw new HttpError(409, "Email already registered");
      }
      throw err;
    }
  }

  @Post("/login")
  public async login(
    @Body() body: LoginRequest,
    @Request() req: express.Request,
  ): Promise<MessageResponse> {
    const { email, password } = body;
    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "Invalid email format");
    }
    const result = await login(email, password);
    req.res!.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { message: "Login successful" };
  }

  @Post("/logout")
  public async logout(@Request() req: express.Request): Promise<MessageResponse> {
    req.res!.clearCookie("token");
    return { message: "Logged out" };
  }

  @Get("/me")
  @Security("jwt")
  public async getMe(@Request() req: express.Request): Promise<UserResponse> {
    const user = userRepository.findById(req.user!.userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      zoneId: user.zoneId,
      isAdmin: user.isAdmin,
    };
  }

  @Put("/zone")
  @Security("jwt")
  public async updateZone(
    @Body() body: ZoneUpdateRequest,
    @Request() req: express.Request,
  ): Promise<MessageResponse> {
    if (typeof body.zoneId !== "number") {
      throw new HttpError(400, "zoneId is required and must be a number");
    }
    userRepository.updateZone(req.user!.userId, body.zoneId);
    return { message: "Zone updated" };
  }

  @Put("/profile")
  @Security("jwt")
  public async updateProfile(
    @Body() body: ProfileUpdateRequest,
    @Request() req: express.Request,
  ): Promise<UserResponse> {
    const { email, firstName, lastName } = body;
    if (!email || !firstName || !lastName) {
      throw new HttpError(400, "Email, first name, and last name are required");
    }
    try {
      userRepository.updateProfile(req.user!.userId, email, firstName, lastName);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("UNIQUE constraint")) {
        throw new HttpError(409, "Email already in use");
      }
      throw err;
    }
    const updated = userRepository.findById(req.user!.userId);
    return {
      id: updated!.id,
      email: updated!.email,
      firstName: updated!.firstName,
      lastName: updated!.lastName,
      zoneId: updated!.zoneId,
      isAdmin: updated!.isAdmin,
    };
  }
}

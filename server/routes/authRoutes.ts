import { Controller, Route, Tags, Post, Get, Put, Body, Request, Security } from "tsoa";
import * as express from "express";
import { register, login } from "../controllers/authController.ts";
import { userRepository } from "../repositories/userRepository.ts";
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
      this.setStatus(400);
      return { message: "Email, password, first name, and last name are required", userId: 0 };
    }
    if (password.length < 8) {
      this.setStatus(400);
      return { message: "Password must be at least 8 characters", userId: 0 };
    }
    try {
      const result = await register(email, password, firstName, lastName);
      req.res!.cookie("token", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
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
        this.setStatus(409);
        return { message: "Email already registered", userId: 0 };
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
      this.setStatus(400);
      return { message: "Email and password are required" };
    }
    const result = await login(email, password);
    req.res!.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
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
    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      this.setStatus(404);
      return { id: 0, email: "", firstName: "", lastName: "" };
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
      this.setStatus(400);
      return { message: "zoneId is required and must be a number" };
    }
    await userRepository.updateZone(req.user!.userId, body.zoneId);
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
      this.setStatus(400);
      return { id: 0, email: "", firstName: "", lastName: "" };
    }
    try {
      await userRepository.updateProfile(req.user!.userId, email, firstName, lastName);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("UNIQUE constraint")) {
        this.setStatus(409);
        return { id: 0, email: "", firstName: "", lastName: "" };
      }
      throw err;
    }
    const updated = await userRepository.findById(req.user!.userId);
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

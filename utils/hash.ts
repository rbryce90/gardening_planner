import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";

export const hashPassword = async (password: string): Promise<string> => await hash(password);
export const isPasswordCorrect = async (password: string, storedPassword: string): Promise<boolean> => await compare(password, storedPassword)


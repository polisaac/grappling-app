import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = {
    // jsonwebtoken tipa expiresIn con un tipo de duración propio (StringValue)
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign({ sub: userId }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Token inválido");
  }
  return { sub: decoded.sub };
}

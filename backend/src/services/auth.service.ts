import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { EmailAlreadyInUseError, InvalidCredentialsError } from "../lib/errors";
import { signToken } from "../lib/jwt";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { token: signToken(user.id), user: toPublicUser(user) };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    // Mismo error para usuario inexistente y contraseña errónea (no revelar cuál falló).
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const matches = await bcrypt.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    return { token: signToken(user.id), user: toPublicUser(user) };
  },
};

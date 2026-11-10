export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, "Credenciales incorrectas");
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, "No autorizado");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

export class CannotFollowSelfError extends AppError {
  constructor() {
    super(400, "No puedes seguirte a ti mismo");
  }
}

export class EmailAlreadyInUseError extends AppError {
  constructor() {
    super(409, "Este correo ya está en uso");
  }
}

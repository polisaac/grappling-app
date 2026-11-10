// Validaciones de F01: correo con formato válido, contraseña >= 6 caracteres, campos no vacíos.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateName(name: string): string | null {
  return name.trim().length === 0 ? "El nombre es obligatorio" : null;
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (value.length === 0) {
    return "El correo es obligatorio";
  }
  return EMAIL_PATTERN.test(value) ? null : "Ingresa un correo válido (usuario@dominio.com)";
}

export function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return "La contraseña es obligatoria";
  }
  return password.length >= MIN_PASSWORD_LENGTH
    ? null
    : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
}

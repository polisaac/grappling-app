// Contrato de respuesta de POST /api/auth/register y POST /api/auth/login (backend F01).
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

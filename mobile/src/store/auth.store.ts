import { create } from "zustand";
import { authApi } from "@/services/auth.api";
import type { LoginPayload, RegisterPayload } from "@/services/auth.api";
import { getErrorMessage } from "@/services/http";
import { secureStorage } from "@/services/secureStorage";
import type { AuthResponse, AuthUser } from "@/types/auth";
import { isTokenExpired } from "@/utils/jwt";

const TOKEN_KEY = "auth_token";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  setSession: (session: AuthResponse) => Promise<void>;
  // Cierre de sesión voluntario (botón "Cerrar sesión", F05).
  logout: () => Promise<void>;
  // Cierre forzado (p. ej. el backend respondió 401). Hace lo mismo que `logout`.
  clearSession: () => Promise<void>;
  clearError: () => void;
  hydrate: () => Promise<void>;
}

// El JWT se persiste en Secure Store (F01, paso 6) para mantener la sesión al reabrir la app.
// El usuario no se persiste: se obtendrá del backend cuando exista el endpoint de perfil (F05).
export const useAuthStore = create<AuthState>((set, get) => {
  async function authenticate(request: () => Promise<AuthResponse>): Promise<void> {
    set({ isLoading: true, error: null });
    try {
      const session = await request();
      await get().setSession(session);
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  }

  // Borra el JWT del almacenamiento y limpia el estado. Si el almacenamiento falla, la sesión se
  // cierra igualmente en memoria: nunca se deja al usuario "atrapado" con la sesión abierta.
  async function endSession(): Promise<void> {
    try {
      await secureStorage.removeItem(TOKEN_KEY);
    } catch {
      // se ignora a propósito; ver comentario arriba
    }
    set({ token: null, user: null, error: null });
  }

  return {
    token: null,
    user: null,
    isHydrated: false,
    isLoading: false,
    error: null,

    login: (payload) => authenticate(() => authApi.login(payload)),
    register: (payload) => authenticate(() => authApi.register(payload)),

    async setSession({ token, user }) {
      await secureStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
    },

    logout: endSession,
    clearSession: endSession,

    clearError() {
      set({ error: null });
    },

    async hydrate() {
      let storedToken: string | null = null;
      try {
        storedToken = await secureStorage.getItem(TOKEN_KEY);
      } catch {
        // Si el almacenamiento falla, se arranca sin sesión en vez de dejar la app colgada.
        storedToken = null;
      }
      if (storedToken !== null && isTokenExpired(storedToken)) {
        await secureStorage.removeItem(TOKEN_KEY);
        set({ token: null, isHydrated: true });
        return;
      }
      set({ token: storedToken, isHydrated: true });
    },
  };
});

import { create } from "zustand";
import { logsApi } from "@/services/logs.api";
import { ApiError, NetworkError, getErrorMessage } from "@/services/http";
import { useAuthStore } from "@/store/auth.store";
import type { CreateLogPayload } from "@/types/log";

const SAVE_NETWORK_ERROR_MESSAGE = "No se pudo guardar la bitácora. Revisa tu conexión";

interface LogState {
  isSaving: boolean;
  error: string | null;
  // Devuelve true si la bitácora se guardó (el llamador navega al Feed).
  createLog: (payload: CreateLogPayload) => Promise<boolean>;
  clearError: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  isSaving: false,
  error: null,

  async createLog(payload) {
    const { token, clearSession } = useAuthStore.getState();
    if (token === null) {
      set({ error: "Tu sesión expiró. Inicia sesión nuevamente" });
      return false;
    }

    set({ isSaving: true, error: null });
    try {
      await logsApi.create(token, payload);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token expirado o inválido: al limpiar la sesión, el guard de rutas redirige al login.
        await clearSession();
        return false;
      }
      set({
        error: error instanceof NetworkError ? SAVE_NETWORK_ERROR_MESSAGE : getErrorMessage(error),
      });
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));

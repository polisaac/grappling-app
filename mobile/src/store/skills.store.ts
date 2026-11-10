import { create } from "zustand";
import { ApiError, getErrorMessage } from "@/services/http";
import { skillsApi } from "@/services/skills.api";
import { useAuthStore } from "@/store/auth.store";
import type { SkillGraph } from "@/types/skills";

// initial: primera carga (spinner) | refresh: pull-to-refresh | silent: al volver a la pantalla
type LoadMode = "initial" | "refresh" | "silent";
type SkillsStatus = "idle" | "loading" | "ready" | "error";

interface SkillsData {
  graph: SkillGraph | null;
  status: SkillsStatus;
  isRefreshing: boolean;
  error: string | null;
}

interface SkillsState extends SkillsData {
  load: (mode: LoadMode) => Promise<void>;
  syncOnFocus: () => Promise<void>;
  reset: () => void;
}

const INITIAL_DATA: SkillsData = {
  graph: null,
  status: "idle",
  isRefreshing: false,
  error: null,
};

// Descarta respuestas de una petición vieja si ya se lanzó otra.
let latestRequestId = 0;

export const useSkillsStore = create<SkillsState>((set, get) => ({
  ...INITIAL_DATA,

  async load(mode) {
    const { token } = useAuthStore.getState();
    if (token === null) {
      return;
    }

    const requestId = ++latestRequestId;
    if (mode === "initial") {
      set({ status: "loading", error: null });
    } else if (mode === "refresh") {
      set({ isRefreshing: true });
    }

    try {
      const graph = await skillsApi.fetchMine(token);
      if (requestId !== latestRequestId) {
        return;
      }
      set({ graph, status: "ready", error: null });
    } catch (error) {
      // Con 401 el token no sirve: al limpiar la sesión, el guard de rutas redirige al login.
      if (error instanceof ApiError && error.status === 401) {
        await useAuthStore.getState().clearSession();
        return;
      }
      if (requestId !== latestRequestId) {
        return;
      }
      const message = getErrorMessage(error);
      // Sin datos previos: pantalla de error con "Reintentar". Con datos: se conserva el grafo.
      set((state) => ({
        status: state.graph === null ? "error" : "ready",
        error: mode === "silent" ? state.error : message,
      }));
    } finally {
      if (requestId === latestRequestId) {
        set({ isRefreshing: false });
      }
    }
  },

  async syncOnFocus() {
    const { status, load } = get();
    if (status === "loading") {
      return;
    }
    await load(status === "idle" || status === "error" ? "initial" : "silent");
  },

  reset() {
    latestRequestId++;
    set(INITIAL_DATA);
  },
}));

// El árbol es personal: al cerrar sesión o cambiar de cuenta se descarta lo cargado.
useAuthStore.subscribe((state, previousState) => {
  if (state.token !== previousState.token) {
    useSkillsStore.getState().reset();
  }
});

import { create } from "zustand";
import { ApiError, getErrorMessage } from "@/services/http";
import { profileApi } from "@/services/profile.api";
import { useAuthStore } from "@/store/auth.store";
import type { FeedLog } from "@/types/feed";
import type { MyProfile } from "@/types/profile";

// initial: primera carga (skeleton) | refresh: pull-to-refresh | silent: al volver a la pestaña
type LoadMode = "initial" | "refresh" | "silent";
type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface ProfileData {
  profile: MyProfile | null;
  items: FeedLog[];
  nextCursor: string | null;
  status: ProfileStatus;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

interface ProfileState extends ProfileData {
  load: (mode: LoadMode) => Promise<void>;
  loadMore: () => Promise<void>;
  // Carga inicial la primera vez (o tras un error); recarga silenciosa en las siguientes.
  syncOnFocus: () => Promise<void>;
  reset: () => void;
}

const INITIAL_DATA: ProfileData = {
  profile: null,
  items: [],
  nextCursor: null,
  status: "idle",
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
};

// Descarta respuestas de una petición vieja si ya se lanzó otra (p. ej. refresh durante loadMore).
let latestRequestId = 0;

export const useProfileStore = create<ProfileState>((set, get) => {
  // Con 401 el token no sirve: al limpiar la sesión, el guard de rutas redirige al login.
  async function handleFailure(error: unknown): Promise<string | null> {
    if (error instanceof ApiError && error.status === 401) {
      await useAuthStore.getState().clearSession();
      return null;
    }
    return getErrorMessage(error);
  }

  return {
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
        // Perfil e historial se piden juntos: la pantalla muestra ambos o un solo error.
        const [profile, page] = await Promise.all([
          profileApi.fetchMe(token),
          profileApi.fetchLogsPage(token, null),
        ]);
        if (requestId !== latestRequestId) {
          return;
        }
        set({
          profile,
          items: page.items,
          nextCursor: page.nextCursor,
          status: "ready",
          error: null,
          isLoadingMore: false,
        });
      } catch (error) {
        const message = await handleFailure(error);
        if (requestId !== latestRequestId || message === null) {
          return;
        }
        // Sin datos previos: pantalla de error con "Reintentar". Con datos: se conserva lo mostrado.
        set((state) => ({
          status: state.profile === null ? "error" : "ready",
          error: mode === "silent" ? state.error : message,
        }));
      } finally {
        if (requestId === latestRequestId) {
          set({ isRefreshing: false });
        }
      }
    },

    async loadMore() {
      const { token } = useAuthStore.getState();
      const { nextCursor, status, isLoadingMore, isRefreshing } = get();
      if (token === null || nextCursor === null || status !== "ready" || isLoadingMore || isRefreshing) {
        return;
      }

      const requestId = ++latestRequestId;
      set({ isLoadingMore: true });
      try {
        const page = await profileApi.fetchLogsPage(token, nextCursor);
        if (requestId !== latestRequestId) {
          return;
        }
        set((state) => {
          const knownIds = new Set(state.items.map((item) => item.id));
          return {
            items: [...state.items, ...page.items.filter((item) => !knownIds.has(item.id))],
            nextCursor: page.nextCursor,
            error: null,
          };
        });
      } catch (error) {
        const message = await handleFailure(error);
        if (requestId === latestRequestId && message !== null) {
          set({ error: message });
        }
      } finally {
        if (requestId === latestRequestId) {
          set({ isLoadingMore: false });
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
  };
});

// El perfil es por usuario: al cerrar sesión o cambiar de cuenta se descarta lo cargado.
useAuthStore.subscribe((state, previousState) => {
  if (state.token !== previousState.token) {
    useProfileStore.getState().reset();
  }
});

import { create } from "zustand";
import { feedApi } from "@/services/feed.api";
import { ApiError, getErrorMessage } from "@/services/http";
import { useAuthStore } from "@/store/auth.store";
import type { FeedLog, FeedTab } from "@/types/feed";

// initial: primera carga (muestra skeleton) | refresh: pull-to-refresh | silent: al volver a la pantalla
type LoadMode = "initial" | "refresh" | "silent";
type FeedStatus = "idle" | "loading" | "ready" | "error";

interface FeedData {
  // F06: pestaña activa; define el query que se envía al backend.
  tab: FeedTab;
  items: FeedLog[];
  nextCursor: string | null;
  status: FeedStatus;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

interface FeedState extends FeedData {
  // Cambia de pestaña, vacía la lista y la recarga desde el backend (muestra el skeleton).
  setTab: (tab: FeedTab) => Promise<void>;
  load: (mode: LoadMode) => Promise<void>;
  loadMore: () => Promise<void>;
  // Carga inicial la primera vez (o tras un error); recarga silenciosa en las siguientes.
  syncOnFocus: () => Promise<void>;
  reset: () => void;
}

const INITIAL_DATA: FeedData = {
  tab: "for-you",
  items: [],
  nextCursor: null,
  status: "idle",
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
};

// Descarta respuestas de una petición vieja si ya se lanzó otra (p. ej. refresh durante loadMore).
let latestRequestId = 0;

export const useFeedStore = create<FeedState>((set, get) => {
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

    async setTab(tab) {
      if (get().tab === tab) {
        return;
      }
      // La respuesta pendiente de la pestaña anterior queda invalidada por el nuevo `requestId`
      // de `load`; sus indicadores se apagan aquí porque su `finally` ya no lo hará.
      set({
        tab,
        items: [],
        nextCursor: null,
        error: null,
        isRefreshing: false,
        isLoadingMore: false,
      });
      await get().load("initial");
    },

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
        const page = await feedApi.fetchPage(token, null, get().tab);
        if (requestId !== latestRequestId) {
          return;
        }
        set({
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
        // Sin datos previos: pantalla de error con "Reintentar". Con datos: se conserva la lista.
        set((state) => ({
          status: state.items.length === 0 ? "error" : "ready",
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
        const page = await feedApi.fetchPage(token, nextCursor, get().tab);
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

// El feed es por usuario: al cerrar sesión o cambiar de cuenta se descarta lo cargado.
useAuthStore.subscribe((state, previousState) => {
  if (state.token !== previousState.token) {
    useFeedStore.getState().reset();
  }
});

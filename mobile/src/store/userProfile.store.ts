import { create } from "zustand";
import { ApiError, getErrorMessage } from "@/services/http";
import { usersApi } from "@/services/users.api";
import { useAuthStore } from "@/store/auth.store";
import type { FeedLog } from "@/types/feed";
import type { PublicProfile } from "@/types/user";

// initial: primera carga (skeleton) | refresh: pull-to-refresh | silent: al volver a la pantalla
type LoadMode = "initial" | "refresh" | "silent";
type UserProfileStatus = "idle" | "loading" | "ready" | "error";

// F06: estado del perfil público que se está viendo (un solo usuario a la vez).
interface UserProfileData {
  userId: string | null; // a quién pertenecen los datos de abajo
  profile: PublicProfile | null;
  items: FeedLog[];
  nextCursor: string | null;
  status: UserProfileStatus;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isUpdatingFollow: boolean;
  followError: string | null;
}

interface UserProfileState extends UserProfileData {
  load: (userId: string, mode: LoadMode) => Promise<void>;
  loadMore: () => Promise<void>;
  // Carga inicial al abrir un perfil distinto (o tras un error); recarga silenciosa al volver.
  syncOnFocus: (userId: string) => Promise<void>;
  // Seguir / dejar de seguir con actualización inmediata (optimista) y reversión si falla.
  toggleFollow: () => Promise<void>;
  reset: () => void;
}

const INITIAL_DATA: UserProfileData = {
  userId: null,
  profile: null,
  items: [],
  nextCursor: null,
  status: "idle",
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  isUpdatingFollow: false,
  followError: null,
};

// Descarta respuestas de una petición vieja si ya se lanzó otra (p. ej. refresh durante loadMore).
let latestRequestId = 0;

export const useUserProfileStore = create<UserProfileState>((set, get) => {
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

    async load(userId, mode) {
      const { token } = useAuthStore.getState();
      if (token === null) {
        return;
      }

      const requestId = ++latestRequestId;
      if (mode === "initial") {
        // Se parte de cero para no mostrar ni un instante los datos de otro usuario.
        set({ ...INITIAL_DATA, userId, status: "loading" });
      } else if (mode === "refresh") {
        set({ isRefreshing: true });
      }

      try {
        // Perfil e historial se piden juntos: la pantalla muestra ambos o un solo error.
        const [profile, page] = await Promise.all([
          usersApi.fetchProfile(token, userId),
          usersApi.fetchLogsPage(token, userId, null),
        ]);
        if (requestId !== latestRequestId) {
          return;
        }
        set({
          userId,
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
      const { userId, nextCursor, status, isLoadingMore, isRefreshing } = get();
      if (
        token === null ||
        userId === null ||
        nextCursor === null ||
        status !== "ready" ||
        isLoadingMore ||
        isRefreshing
      ) {
        return;
      }

      const requestId = ++latestRequestId;
      set({ isLoadingMore: true });
      try {
        const page = await usersApi.fetchLogsPage(token, userId, nextCursor);
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

    async syncOnFocus(userId) {
      const { userId: currentId, status, load } = get();
      if (currentId === userId && status === "loading") {
        return;
      }
      const isSameUser = currentId === userId;
      await load(userId, isSameUser && status !== "idle" && status !== "error" ? "silent" : "initial");
    },

    async toggleFollow() {
      const { token } = useAuthStore.getState();
      const { profile, isUpdatingFollow } = get();
      if (token === null || profile === null || isUpdatingFollow) {
        return;
      }

      const wasFollowing = profile.isFollowing;
      // Actualización inmediata: el botón y el contador cambian antes de que responda el servidor.
      set({
        isUpdatingFollow: true,
        followError: null,
        profile: {
          ...profile,
          isFollowing: !wasFollowing,
          followersCount: Math.max(0, profile.followersCount + (wasFollowing ? -1 : 1)),
        },
      });

      try {
        const next = wasFollowing
          ? await usersApi.unfollow(token, profile.id)
          : await usersApi.follow(token, profile.id);
        // Si mientras tanto se abrió otro perfil, estos datos ya no corresponden.
        set((state) =>
          state.profile?.id === profile.id
            ? {
                profile: {
                  ...state.profile,
                  isFollowing: next.isFollowing,
                  followersCount: next.followersCount,
                },
              }
            : {},
        );
      } catch (error) {
        const message = await handleFailure(error);
        if (message !== null) {
          // Se revierte al estado previo y se avisa del fallo.
          set((state) =>
            state.profile?.id === profile.id
              ? {
                  profile: {
                    ...state.profile,
                    isFollowing: wasFollowing,
                    followersCount: profile.followersCount,
                  },
                  followError: message,
                }
              : {},
          );
        }
      } finally {
        set({ isUpdatingFollow: false });
      }
    },

    reset() {
      latestRequestId++;
      set(INITIAL_DATA);
    },
  };
});

// Los datos son por usuario: al cerrar sesión o cambiar de cuenta se descarta lo cargado.
useAuthStore.subscribe((state, previousState) => {
  if (state.token !== previousState.token) {
    useUserProfileStore.getState().reset();
  }
});

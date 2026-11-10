import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedMessage } from "@/components/FeedMessage";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { FormError } from "@/components/FormError";
import { LogCard } from "@/components/LogCard";
import { SettingsModal } from "@/components/SettingsModal";
import { SettingsIcon } from "@/components/TabIcons";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { colors, radius, spacing, typography } from "@/theme";
import type { FeedLog } from "@/types/feed";

const AVATAR_SIZE = 72;

const keyExtractor = (item: FeedLog): string => item.id;

// Mismo componente que el feed: aquí la lista solo contiene bitácoras del propio usuario (F05),
// así que el autor no enlaza a ningún perfil (ya estamos en el suyo).
const renderItem: ListRenderItem<FeedLog> = ({ item }) => <LogCard log={item} linkAuthor={false} />;

export default function ProfileScreen() {
  const profile = useProfileStore((state) => state.profile);
  const items = useProfileStore((state) => state.items);
  const status = useProfileStore((state) => state.status);
  const error = useProfileStore((state) => state.error);
  const isRefreshing = useProfileStore((state) => state.isRefreshing);
  const isLoadingMore = useProfileStore((state) => state.isLoadingMore);
  const load = useProfileStore((state) => state.load);
  const loadMore = useProfileStore((state) => state.loadMore);
  const syncOnFocus = useProfileStore((state) => state.syncOnFocus);
  const logout = useAuthStore((state) => state.logout);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Primera vez: skeleton. Al volver a la pestaña (p. ej. tras publicar): recarga silenciosa.
  useFocusEffect(
    useCallback(() => {
      void syncOnFocus();
    }, [syncOnFocus]),
  );

  const handleRefresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  const handleRetry = useCallback(() => {
    void load("initial");
  }, [load]);

  const handleEndReached = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  // Elimina el JWT (almacenamiento + Zustand) y va al login. Los stores de feed, skills y perfil
  // se vacían solos al cambiar el token, así la siguiente cuenta no ve datos de esta.
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logout();
    setIsSettingsOpen(false);
    router.replace("/login");
  }, [logout]);

  const isInitialLoad = status === "idle" || status === "loading";

  // Se muestra solo cuando la lista no tiene elementos; nunca una pantalla en blanco.
  let emptyState: ReactElement;
  if (isInitialLoad) {
    emptyState = <FeedSkeleton />;
  } else if (status === "error") {
    emptyState = (
      <FeedMessage
        title="No se pudo cargar tu perfil"
        {...(error ? { description: error } : {})}
        actionLabel="Reintentar"
        onAction={handleRetry}
      />
    );
  } else {
    emptyState = (
      <FeedMessage
        title="Aún no tienes bitácoras"
        description="Registra tu primer entrenamiento desde el Feed con el botón +."
      />
    );
  }

  const totalLogs = profile?.totalLogs ?? 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            {/* El engranaje está siempre visible, incluso si el perfil falla al cargar:
                el usuario nunca debe quedar sin poder cerrar sesión. */}
            <View style={styles.topBar}>
              <Text accessibilityRole="header" style={styles.screenTitle}>
                Perfil
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ajustes"
                onPress={() => setIsSettingsOpen(true)}
                hitSlop={8}
                style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
              >
                <SettingsIcon color={colors.textMain} />
              </Pressable>
            </View>

            {profile ? (
              <View style={styles.identity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{profile.name.trim().charAt(0).toUpperCase()}</Text>
                </View>
                <Text accessibilityRole="header" style={styles.name}>
                  {profile.name}
                </Text>
                <Text style={styles.stats}>
                  <Text style={styles.statsValue}>{totalLogs}</Text>
                  {totalLogs === 1 ? " entrenamiento" : " entrenamientos"}
                </Text>
              </View>
            ) : null}

            {status === "ready" && error ? (
              <View style={styles.banner}>
                <FormError message={error} />
              </View>
            ) : null}

            {/* Encabezado de la lista, con el subrayado azul de las pestañas de X. */}
            {profile ? (
              <View style={styles.sectionTab}>
                <Text style={styles.sectionLabel}>Bitácoras</Text>
                <View style={styles.sectionUnderline} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
      />

      <SettingsModal
        visible={isSettingsOpen}
        isLoggingOut={isLoggingOut}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={() => void handleLogout()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  screenTitle: typography.h1,
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  identity: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
  },
  name: typography.h1,
  stats: {
    ...typography.label,
    fontSize: 15,
  },
  statsValue: {
    fontWeight: "700",
    color: colors.textMain,
  },
  banner: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTab: {
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    ...typography.body,
    fontWeight: "700",
    paddingTop: spacing.md - 2,
    paddingBottom: spacing.sm,
  },
  sectionUnderline: {
    width: 56,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});

import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedMessage } from "@/components/FeedMessage";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { FollowButton } from "@/components/FollowButton";
import { FormError } from "@/components/FormError";
import { LogCard } from "@/components/LogCard";
import { useAuthStore } from "@/store/auth.store";
import { useUserProfileStore } from "@/store/userProfile.store";
import { colors, radius, spacing, typography } from "@/theme";
import type { FeedLog } from "@/types/feed";
import { getTokenSubject } from "@/utils/jwt";

const AVATAR_SIZE = 72;

const keyExtractor = (item: FeedLog): string => item.id;

// Ya estamos en el perfil de este autor: su nombre no enlaza a ninguna parte.
const renderItem: ListRenderItem<FeedLog> = ({ item }) => <LogCard log={item} linkAuthor={false} />;

// F06: perfil público de otro atleta (ruta `user/[id]`).
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const storeUserId = useUserProfileStore((state) => state.userId);
  const storeProfile = useUserProfileStore((state) => state.profile);
  const storeItems = useUserProfileStore((state) => state.items);
  const storeStatus = useUserProfileStore((state) => state.status);
  const error = useUserProfileStore((state) => state.error);
  const isRefreshing = useUserProfileStore((state) => state.isRefreshing);
  const isLoadingMore = useUserProfileStore((state) => state.isLoadingMore);
  const isUpdatingFollow = useUserProfileStore((state) => state.isUpdatingFollow);
  const followError = useUserProfileStore((state) => state.followError);
  const load = useUserProfileStore((state) => state.load);
  const loadMore = useUserProfileStore((state) => state.loadMore);
  const syncOnFocus = useUserProfileStore((state) => state.syncOnFocus);
  const toggleFollow = useUserProfileStore((state) => state.toggleFollow);
  const ownId = useAuthStore((state) => (state.token ? getTokenSubject(state.token) : null));

  // El store guarda un solo perfil; si pertenece a otro usuario se trata como "aún sin cargar"
  // para no mostrar ni un instante datos ajenos.
  const isCurrent = storeUserId === id;
  const profile = isCurrent ? storeProfile : null;
  const items = isCurrent ? storeItems : [];
  const status = isCurrent ? storeStatus : "loading";

  // Primera vez: skeleton. Al volver a la pantalla: recarga silenciosa.
  useFocusEffect(
    useCallback(() => {
      void syncOnFocus(id);
    }, [syncOnFocus, id]),
  );

  const handleRefresh = useCallback(() => {
    void load(id, "refresh");
  }, [load, id]);

  const handleRetry = useCallback(() => {
    void load(id, "initial");
  }, [load, id]);

  const handleEndReached = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const handleToggleFollow = useCallback(() => {
    void toggleFollow();
  }, [toggleFollow]);

  const isInitialLoad = status === "idle" || status === "loading";

  // Se muestra solo cuando la lista no tiene elementos; nunca una pantalla en blanco.
  let emptyState: ReactElement;
  if (isInitialLoad) {
    emptyState = <FeedSkeleton />;
  } else if (status === "error") {
    emptyState = (
      <FeedMessage
        title="No se pudo cargar el perfil"
        {...(error ? { description: error } : {})}
        actionLabel="Reintentar"
        onAction={handleRetry}
      />
    );
  } else {
    emptyState = (
      <FeedMessage
        title="Aún no tiene bitácoras"
        description="Cuando registre un entrenamiento aparecerá aquí."
      />
    );
  }

  // El botón no aparece en el propio perfil (no se puede seguir a uno mismo).
  const showFollowButton = profile !== null && profile.id !== ownId;

  return (
    // El encabezado de navegación (con el botón de volver) ya cubre el área segura superior.
    <SafeAreaView edges={[]} style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            {profile ? (
              <View style={styles.identity}>
                <View style={styles.identityTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{profile.name.trim().charAt(0).toUpperCase()}</Text>
                  </View>
                  {showFollowButton ? (
                    <FollowButton
                      isFollowing={profile.isFollowing}
                      disabled={isUpdatingFollow}
                      onPress={handleToggleFollow}
                    />
                  ) : null}
                </View>
                <Text accessibilityRole="header" style={styles.name}>
                  {profile.name}
                </Text>
                <Text style={styles.stats}>
                  <Text style={styles.statsValue}>{profile.followingCount}</Text>
                  {" Siguiendo"}
                  {"      "}
                  <Text style={styles.statsValue}>{profile.followersCount}</Text>
                  {profile.followersCount === 1 ? " Seguidor" : " Seguidores"}
                </Text>
                {followError ? <FormError message={followError} /> : null}
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
  identity: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  // Avatar a la izquierda y botón de seguir a la derecha, como en el perfil de X.
  identityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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

import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedMessage } from "@/components/FeedMessage";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FormError } from "@/components/FormError";
import { LogCard } from "@/components/LogCard";
import { TopTabs } from "@/components/TopTabs";
import type { TopTabOption } from "@/components/TopTabs";
import { useFeedStore } from "@/store/feed.store";
import { colors, spacing } from "@/theme";
import type { FeedLog, FeedTab } from "@/types/feed";

const keyExtractor = (item: FeedLog): string => item.id;

const renderItem: ListRenderItem<FeedLog> = ({ item }) => <LogCard log={item} />;

// F06: "Para ti" es el feed global; "Siguiendo" solo muestra a los usuarios seguidos.
const TAB_OPTIONS: TopTabOption<FeedTab>[] = [
  { value: "for-you", label: "Para ti" },
  { value: "following", label: "Siguiendo" },
];

export default function FeedScreen() {
  const tab = useFeedStore((state) => state.tab);
  const setTab = useFeedStore((state) => state.setTab);
  const items = useFeedStore((state) => state.items);
  const status = useFeedStore((state) => state.status);
  const error = useFeedStore((state) => state.error);
  const isRefreshing = useFeedStore((state) => state.isRefreshing);
  const isLoadingMore = useFeedStore((state) => state.isLoadingMore);
  const load = useFeedStore((state) => state.load);
  const loadMore = useFeedStore((state) => state.loadMore);
  const syncOnFocus = useFeedStore((state) => state.syncOnFocus);
  // Primera vez: skeleton. Al volver de publicar una bitácora: recarga silenciosa, así la nueva
  // aparece arriba sin parpadeos (F02/F03).
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

  const handleTabChange = useCallback(
    (nextTab: FeedTab) => {
      void setTab(nextTab);
    },
    [setTab],
  );

  const isInitialLoad = status === "idle" || status === "loading";

  // Se muestra solo cuando la lista no tiene elementos; nunca una pantalla en blanco.
  let emptyState: ReactElement;
  if (isInitialLoad) {
    emptyState = <FeedSkeleton />;
  } else if (status === "error") {
    emptyState = (
      <FeedMessage
        title="No se pudo cargar el feed"
        {...(error ? { description: error } : {})}
        actionLabel="Reintentar"
        onAction={handleRetry}
      />
    );
  } else if (tab === "following") {
    emptyState = (
      <FeedMessage
        title="Aún no sigues a nadie"
        description="Toca el nombre de un atleta en «Para ti» y presiona Seguir para ver aquí sus bitácoras."
      />
    );
  } else {
    emptyState = (
      <FeedMessage
        title="¡Tu feed está vacío!"
        description="Agrega tu primer entrenamiento con el botón +."
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Fijo arriba: sigue visible al hacer scroll por la lista. */}
      <TopTabs options={TAB_OPTIONS} value={tab} onChange={handleTabChange} />
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          status === "ready" && error ? (
            <View style={styles.banner}>
              <FormError message={error} />
            </View>
          ) : undefined
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
      <FloatingActionButton
        accessibilityLabel="Registrar bitácora"
        onPress={() => router.push("/log")}
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
    // Espacio para que el botón flotante no tape la última tarjeta.
    paddingBottom: 96,
  },
  banner: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});

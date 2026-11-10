import { Link } from "expo-router";
import type { Href } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MODALITY_LABELS, SCRAMBLE_RESULT_LABELS } from "@/constants/labels";
import { useAuthStore } from "@/store/auth.store";
import { colors, radius, spacing, typography } from "@/theme";
import type { FeedLog, FeedScramble } from "@/types/feed";
import { formatLogDate } from "@/utils/date";
import { getTokenSubject } from "@/utils/jwt";

// Lista resumida (F03): el resto se indica con "+N más".
const MAX_VISIBLE_SCRAMBLES = 3;
const MAX_SATISFACTION = 5;

interface LogCardProps {
  log: FeedLog;
  // F06: el avatar y el nombre del autor abren su perfil. Se desactiva en las pantallas que ya
  // son el perfil de ese autor, para no apilar la misma pantalla sobre sí misma.
  linkAuthor?: boolean;
}

// Destino al tocar al autor: su perfil público (user/[id]) o, si el autor soy yo, la pestaña Perfil.
// El id propio sale del JWT porque el `user` del auth store no se persiste al reabrir la app.
function useAuthorLink(authorId: string): { href: Href; push: boolean } {
  const ownId = useAuthStore((state) => (state.token ? getTokenSubject(state.token) : null));
  if (ownId === authorId) {
    return { href: "/profile", push: false };
  }
  return { href: { pathname: "/user/[id]", params: { id: authorId } }, push: true };
}

function Satisfaction({ value }: { value: number }) {
  return (
    <Text accessibilityLabel={`Satisfacción ${value} de ${MAX_SATISFACTION}`} style={styles.stars}>
      {"★".repeat(value)}
      <Text style={styles.starsEmpty}>{"★".repeat(MAX_SATISFACTION - value)}</Text>
    </Text>
  );
}

function ScrambleRow({ scramble }: { scramble: FeedScramble }) {
  const isInFavor = scramble.result === "IN_FAVOR";
  const action = scramble.technique
    ? `${scramble.position} → ${scramble.technique}`
    : scramble.position;

  return (
    <View style={styles.scrambleRow}>
      <Text numberOfLines={1} style={styles.scrambleAction}>
        {action}
      </Text>
      <Text style={[styles.scrambleResult, isInFavor ? styles.resultPositive : styles.resultNegative]}>
        {SCRAMBLE_RESULT_LABELS[scramble.result]}
      </Text>
    </View>
  );
}

function LogCardComponent({ log, linkAuthor = true }: LogCardProps) {
  const authorLink = useAuthorLink(log.user.id);
  const visibleScrambles = log.scrambles.slice(0, MAX_VISIBLE_SCRAMBLES);
  const hiddenCount = log.scrambles.length - visibleScrambles.length;
  const initial = log.user.name.trim().charAt(0).toUpperCase();

  const avatar = (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      {linkAuthor ? (
        <Link href={authorLink.href} push={authorLink.push} asChild>
          <Pressable accessibilityRole="link" accessibilityLabel={`Ver perfil de ${log.user.name}`}>
            {avatar}
          </Pressable>
        </Link>
      ) : (
        avatar
      )}

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.header}>
          {linkAuthor ? (
            <Link href={authorLink.href} push={authorLink.push} style={styles.name}>
              {log.user.name}
            </Link>
          ) : (
            <Text style={styles.name}>{log.user.name}</Text>
          )}
          <Text style={styles.meta}>{`  ·  ${formatLogDate(log.trainedAt)}`}</Text>
        </Text>
        {log.location ? (
          <Text numberOfLines={1} style={styles.meta}>
            {log.location}
          </Text>
        ) : null}

        <View style={styles.tags}>
          <View style={styles.modalityPill}>
            <Text style={styles.modalityText}>{MODALITY_LABELS[log.modality]}</Text>
          </View>
          {log.satisfaction !== null ? <Satisfaction value={log.satisfaction} /> : null}
        </View>

        {log.note ? <Text style={styles.note}>{log.note}</Text> : null}

        {visibleScrambles.length > 0 ? (
          <View style={styles.scrambles}>
            {visibleScrambles.map((scramble) => (
              <ScrambleRow key={scramble.id} scramble={scramble} />
            ))}
            {hiddenCount > 0 ? <Text style={styles.meta}>{`+${hiddenCount} más`}</Text> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Memoizada: FlatList solo vuelve a renderizar las tarjetas cuyo `log` cambió.
export const LogCard = memo(LogCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.h2,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  header: typography.body,
  name: {
    ...typography.body,
    fontWeight: "700",
  },
  meta: {
    ...typography.label,
    fontSize: 14,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  modalityPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalityText: {
    ...typography.label,
    fontWeight: "700",
    color: colors.primary,
  },
  stars: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  starsEmpty: {
    color: colors.border,
  },
  note: typography.body,
  scrambles: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scrambleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  scrambleAction: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scrambleResult: {
    ...typography.label,
    fontWeight: "700",
  },
  resultPositive: {
    color: colors.success,
  },
  resultNegative: {
    color: colors.error,
  },
});

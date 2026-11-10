import { Link } from "expo-router";
import type { Href } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { colors, typography } from "@/theme";

interface AuthFooterLinkProps {
  prompt: string;
  linkLabel: string;
  href: Href;
}

export function AuthFooterLink({ prompt, linkLabel, href }: AuthFooterLinkProps) {
  return (
    <Text style={styles.prompt}>
      {prompt}{" "}
      <Link href={href} replace style={styles.link}>
        {linkLabel}
      </Link>
    </Text>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.body,
    color: colors.primary,
  },
});

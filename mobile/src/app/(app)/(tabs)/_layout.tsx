import { Tabs } from "expo-router";
import type { ComponentType } from "react";
import { FeedIcon, ProfileIcon, SkillTreeIcon } from "@/components/TabIcons";
import type { IconProps } from "@/components/TabIcons";
import { colors } from "@/theme";

// El color del icono sale del design system (azul si está activa, gris si no) en lugar del
// `color` que entrega la barra, que React Navigation tipa como ColorValue (podría ser nulo).
function tabIcon(Icon: ComponentType<IconProps>) {
  return function TabBarIcon({ focused }: { focused: boolean }) {
    return <Icon color={focused ? colors.primary : colors.textMuted} />;
  };
}

// Estilo de cabecera compartido por las pantallas que muestran el encabezado de navegación.
const HEADER_OPTIONS = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textMain,
  headerShadowVisible: false,
} as const;

// Barra inferior con las 3 pantallas principales: Feed, Skill Tree y Perfil.
// "log" no es una pestaña: vive en el Stack de `(app)/_layout.tsx`, por encima de esta barra.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: tabIcon(FeedIcon),
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          ...HEADER_OPTIONS,
          title: "Skill Tree",
          tabBarIcon: tabIcon(SkillTreeIcon),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: tabIcon(ProfileIcon),
        }}
      />
    </Tabs>
  );
}

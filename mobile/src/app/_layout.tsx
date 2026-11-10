import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { colors } from "@/theme";

export default function RootLayout() {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Evita el parpadeo de la pantalla de login mientras se lee el token de Secure Store.
  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const isAuthenticated = token !== null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* "/" siempre disponible: redirige a /feed o /login según la sesión. */}
        <Stack.Screen name="index" />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

import { Stack } from "expo-router";
import { colors } from "@/theme";

// Si se entra directo a /log (enlace profundo), debajo hay siempre la barra de pestañas.
export const unstable_settings = { initialRouteName: "(tabs)" };

// Encabezado de navegación (con botón de volver) de las pantallas apiladas sobre las pestañas.
const HEADER_OPTIONS = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textMain,
  headerShadowVisible: false,
} as const;

// Zona autenticada: las 3 pantallas principales viven en `(tabs)` (barra inferior); el formulario
// de bitácora (`log`) y los perfiles públicos (`user/[id]`, F06) se apilan encima, a pantalla
// completa y sin la barra.
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="log" options={{ ...HEADER_OPTIONS, title: "Bitácora" }} />
      <Stack.Screen name="user/[id]" options={{ ...HEADER_OPTIONS, title: "Perfil" }} />
    </Stack>
  );
}

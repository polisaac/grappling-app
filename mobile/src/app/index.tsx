import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

// Punto de entrada "/". Siempre coincide con una ruta, haya o no sesión:
// con token va al Feed y sin token al Login (F01).
export default function Index() {
  const token = useAuthStore((state) => state.token);

  return <Redirect href={token !== null ? "/feed" : "/login"} />;
}

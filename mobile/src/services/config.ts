import Constants from "expo-constants";

const BACKEND_PORT = 3000;

// Orden de prioridad:
//  1. EXPO_PUBLIC_API_URL en mobile/.env (ej. http://192.168.1.10:3000), si se define a propósito.
//  2. En desarrollo, el host desde el que Expo sirve la app (la IP actual de tu PC en la red),
//     así no hay que editar el .env cada vez que cambias de Wi-Fi.
//  3. localhost (web en la misma PC o emuladores que lo redirigen).
// Nota: en dispositivo físico "localhost" NO apunta a tu PC. Con `expo start --tunnel` el host es
// un dominio de túnel, no tu PC; en ese caso hay que definir EXPO_PUBLIC_API_URL.
function resolveApiUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) {
    return explicit;
  }
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${expoHost ?? "localhost"}:${BACKEND_PORT}`;
}

export const API_URL: string = resolveApiUrl();

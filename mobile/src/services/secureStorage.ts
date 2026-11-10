import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// expo-secure-store no tiene implementación web, así que en web se usa localStorage.
// OJO: localStorage NO es almacenamiento seguro (es accesible desde JS de la página).
// Es solo un fallback para desarrollo/pruebas en navegador; en iOS/Android se usa el
// Keychain / Keystore reales.

function getWebStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Acceso bloqueado (modo privado, políticas del navegador, render en servidor).
    return null;
  }
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return getWebStorage()?.getItem(key) ?? null;
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

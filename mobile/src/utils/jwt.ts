function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

// Id del usuario dueño del token (claim `sub`). El `user` del auth store no se persiste, así que
// tras reabrir la app solo el token permite saber quién es el usuario actual. Sin verificar firma.
export function getTokenSubject(token: string): string | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }
    const payload: unknown = JSON.parse(decodeBase64Url(payloadSegment));
    if (typeof payload !== "object" || payload === null || !("sub" in payload)) {
      return null;
    }
    const { sub } = payload;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

// Comprueba la expiración localmente (claim `exp`). No verifica la firma: eso es trabajo del backend.
export function isTokenExpired(token: string): boolean {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return true;
    }
    const payload: unknown = JSON.parse(decodeBase64Url(payloadSegment));
    if (typeof payload !== "object" || payload === null || !("exp" in payload)) {
      return false;
    }
    const { exp } = payload;
    return typeof exp === "number" ? exp * 1000 <= Date.now() : true;
  } catch {
    return true;
  }
}

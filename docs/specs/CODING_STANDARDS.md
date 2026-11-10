# Estándar de Codificación — GrappleNode

Documento normativo para la fase de Verificación y Validación (V&V). Describe cómo debe estar escrito el código que se va a inspeccionar, y contra qué specs se juzga que el sistema es el correcto.

| Documento | Rol en V&V |
| --- | --- |
| `docs/specs/00-project.md` y `docs/specs/features/F0x-*.md` | Validación: el comportamiento observable cumple el caso de uso. |
| `docs/ONTOLOGY.md` | Validación del Árbol de Habilidades: posiciones, técnicas y aristas. |
| `docs/specs/01-design-system.md` | Validación visual de la app móvil. |
| `.cursorrules` | Restricciones de stack y de proceso (SDD, cero `any`, una spec a la vez). |
| Este archivo | Verificación: el código cumple convenciones, capas, tipos, errores y trazabilidad. |

Un cambio se acepta en V&V solo si cumple la spec del caso de uso **y** las reglas de este estándar. No se añaden pantallas, campos de base de datos ni endpoints que no estén en `docs/specs/`.

## Stack que este estándar reconoce

Versiones tomadas de `backend/package.json` y `mobile/package.json`. La verificación usa estas, no una pila sustituta.

| Capa | Tecnología en el repositorio |
| --- | --- |
| Mobile | Expo SDK 58 (`expo` ^58.0.22), Expo Router ~58.0.29, React 19.3.0, React Native 0.88.1, Zustand ^5.0.16, `expo-secure-store` ~58.0.2 |
| Lenguaje | TypeScript ^6.0.3 (backend) y ~6.0.3 (mobile). `strict: true` en ambos `tsconfig.json` |
| API | Node.js, Express ^5.2.1, módulos CommonJS (`"type": "commonjs"`), arranque con `tsx` (`npm run dev`) |
| Datos relacionales y sociales | PostgreSQL vía Prisma ^7.10.1 (`prisma-client` generado en `backend/src/generated/prisma`) y `@prisma/adapter-pg` + `pg` |
| Alojamiento de Postgres | Supabase. `DATABASE_URL` apunta al pooler de Supabase. La app no usa `@supabase/supabase-js` ni Supabase Auth |
| Identidad | JWT propio (`jsonwebtoken`) + `bcryptjs`. El token vive en Secure Store, no en Supabase |
| Grafo de habilidades | Neo4j (`neo4j-driver` ^6.2.0), solo posiciones, técnicas y aristas de efectividad (`docs/ONTOLOGY.md`). El acceso pasa por `GraphService` |
| Validación de entrada | Zod ^4.6.7. Joi no forma parte del proyecto |
| Cliente HTTP móvil | `fetch` en `mobile/src/services/http.ts`. No hay Axios |

`backend/src/generated/` es salida de Prisma. No se edita a mano. Se regenera con `npm run prisma:generate`.

---

## 1. Convenciones de nombrado

### 1.1 Regla general

| Elemento | Forma | Ejemplo real |
| --- | --- | --- |
| Variables, funciones, métodos, propiedades | camelCase | `passwordHash`, `findByEmail`, `isHydrated` |
| Tipos, interfaces, clases, componentes, errores | PascalCase | `AuthResult`, `AppError`, `LogCard`, `EmailAlreadyInUseError` |
| Constantes de módulo | SCREAMING_SNAKE_CASE | `BCRYPT_ROUNDS`, `TOKEN_KEY`, `API_URL`, `NETWORK_ERROR_MESSAGE` |
| Enums de Prisma y sus miembros | Modelo PascalCase, miembro SCREAMING_SNAKE_CASE | `Modality.GI`, `ScrambleResult.IN_FAVOR` |
| Tablas SQL (`@@map`) | snake_case plural | `users`, `follows`, `training_logs`, `scrambles` |
| Modelos Prisma | PascalCase singular, salvo el nombre de dominio ya usado | `User`, `TrainingLog`, `Scramble`, `Follows` |
| Casos de uso | `F` + dos dígitos | `F01` … `F06` |

Nombres de dominio en inglés técnico, alineados con el código existente (`user`, `log`, `feed`, `skill`, `follow`). Los mensajes que ve el atleta están en español y salen de la spec (`"Credenciales incorrectas"`, `"Este correo ya está en uso"`, `"Error de red. Intenta nuevamente"`).

### 1.2 Archivos de backend

Patrón: `<contexto>.<rol>.ts`. El contexto es el mismo que monta `createApp()` en `backend/src/app.ts`.

| Rol | Archivo | Export principal |
| --- | --- | --- |
| Ruta | `routes/auth.routes.ts` | `authRouter` |
| Controlador | `controllers/auth.controller.ts` | `authController` |
| Servicio | `services/auth.service.ts` | `authService` |
| Esquema Zod | `services/auth.schemas.ts` | `registerSchema`, tipo `RegisterInput` |
| Repositorio | `repositories/user.repository.ts` | `userRepository` |
| Middleware | `middlewares/auth.middleware.ts` | `requireAuth` |

Contextos actuales: `auth`, `log`, `feed`, `skills`, `users`. El repositorio usa el sustantivo de la entidad (`user.repository.ts`, `follow.repository.ts`, `log.repository.ts`). Un archivo nuevo repite el contexto de su router; no se renombran archivos ya integrados solo para unificar singular y plural.

Otros directorios, con nombre fijo:

- `config/env.ts` — entorno validado.
- `lib/prisma.ts`, `lib/jwt.ts`, `lib/errors.ts` — infraestructura sin regla de negocio.
- `ontology/index.ts` — catálogo de `docs/ONTOLOGY.md`.
- `types/express.d.ts` — aumento de `Express.Request`.
- `server.ts` — escucha el puerto. `app.ts` — compone la aplicación.

### 1.3 Archivos de mobile

Raíz de código: `mobile/src/`. Las pantallas viven solo en `src/app/`.

| Qué | Forma del archivo | Export |
| --- | --- | --- |
| Pantalla (ruta) | el path de Expo Router, en camelCase o minúsculas | `export default function` |
| Componente visual | PascalCase: `LogCard.tsx`, `FollowButton.tsx` | función con el mismo nombre (`export function LogCard`) |
| Store Zustand | `<contexto>.store.ts` | `useAuthStore`, `useFeedStore`, `useLogStore` |
| Cliente de un recurso | `services/<contexto>.api.ts` | `authApi`, `logsApi`, `usersApi` |
| Contrato de API | `types/<contexto>.ts` | `interface` del JSON |
| Utilidad | `utils/<nombre>.ts` | funciones camelCase |
| Hook propio (cuando exista) | `hooks/use<Cosa>.ts` | `use<Cosa>` |

Un hook empieza por `use` y llama hooks de React o de Zustand. Un store no se disfraza de hook suelto: el hook es `useXStore`, definido junto al store.

Grupos de ruta entre paréntesis no forman parte de la URL:

```text
src/app/index.tsx                 → /
src/app/(auth)/login.tsx          → /login
src/app/(auth)/register.tsx       → /register
src/app/(app)/(tabs)/feed.tsx     → /feed
src/app/(app)/(tabs)/skills.tsx   → /skills
src/app/(app)/(tabs)/profile.tsx  → /profile
src/app/(app)/log.tsx             → /log
src/app/(app)/user/[id].tsx       → /user/:id
```

`_layout.tsx` define el navigator de esa carpeta. `index.tsx` solo redirige. Un segmento dinámico se llama `[id].tsx` y se lee con `useLocalSearchParams` de `expo-router`.

### 1.4 Rutas HTTP

Prefijo único `/api/<recurso>`, en plural o con el nombre de dominio ya montado. El recurso se registra en `app.ts` y el archivo de rutas no repite ese prefijo.

| Montaje | Método y path | Caso de uso |
| --- | --- | --- |
| `/api/auth` | `POST /register`, `POST /login` | F01 |
| `/api/logs` | `POST /` | F02 |
| `/api/feed` | `GET /` | F03 |
| `/api/skills` | `GET /me` | F04 |
| `/api/users` | `GET /me`, `GET /me/logs` | F05 |
| `/api/users` | `GET /:id`, `GET /:id/logs`, `POST /:id/follow`, `DELETE /:id/follow` | F06 |

`/health` queda fuera de `/api` y responde `{ status: "ok" }`.

Rutas estáticas (`/me`) se declaran antes que `/:id`. Toda ruta salvo `/health` y `/api/auth/*` pasa por `requireAuth`. El identificador del usuario autenticado sale de `req.auth.userId`, nunca del cuerpo de la petición.

### 1.5 Variables de entorno

Nombres en SCREAMING_SNAKE_CASE. El backend las lee una sola vez, en `backend/src/config/env.ts`, con un esquema Zod. El resto del código importa `env`. Queda prohibido leer `process.env` fuera de ese módulo.

| Variable | Dónde | Regla |
| --- | --- | --- |
| `PORT` | backend | Entero positivo. Default `3000` |
| `DATABASE_URL` | backend | Cadena de conexión PostgreSQL. En despliegue es el pooler de Supabase. No se commitea |
| `JWT_SECRET` | backend | Mínimo 16 caracteres |
| `JWT_EXPIRES_IN` | backend | Duración aceptada por `jsonwebtoken`. Default `7d` |
| `EXPO_PUBLIC_API_URL` | mobile | URL base del API. Solo variables con prefijo `EXPO_PUBLIC_` llegan al bundle |

`backend/.env.example` documenta las claves del backend con valores ficticios. `.env` está fuera de git. Un secreto nuevo se añade al esquema Zod, a `.env.example` y a esta tabla en el mismo cambio.

Cuando el mock de `graph.service.ts` se sustituya por Neo4j, las credenciales (`NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`) entran primero en `env.ts`. Hasta ese cambio, el estándar no las exige: el proceso no debe fallar al arrancar por variables que el código aún no lee.

---

## 2. Estándares de TypeScript

El compilador ya impone el suelo. Backend (`backend/tsconfig.json`): `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `module: nodenext`, `target: es2022`. Mobile extiende `expo/tsconfig.base` con `strict` y el alias `@/*`.

Verificación mínima antes de cerrar un cambio: `npm run typecheck` en el paquete tocado. Los dos paquetes tienen ese script (`tsc --noEmit`).

### 2.1 Tipos explícitos

Toda función exportada declara sus parámetros y su tipo de retorno. Eso incluye métodos de controladores (`Promise<void>`), servicios y repositorios.

```ts
async register(input: RegisterInput): Promise<AuthResult> {
  // ...
}
```

- El cuerpo JSON que entra por HTTP se valida con Zod y el servicio recibe el tipo inferido (`RegisterInput`), no `req.body`.
- El JSON que sale de `fetch` llega como `unknown`. Cada `*.api.ts` lo estrecha al `interface` de `mobile/src/types/` antes de entregarlo al store.
- Un `catch` tipa el error como `unknown` y lo discrimina con `instanceof` (`AppError`, `ZodError`, `Prisma.PrismaClientKnownRequestError`, `ApiError`, `NetworkError`).
- Una propiedad opcional bajo `exactOptionalPropertyTypes` se omite del objeto. No se asigna `undefined` para "apagarla".
- Un índice de array o de mapa puede ser `undefined` (`noUncheckedIndexedAccess`). Se comprueba antes de usarlo.

### 2.2 Prohibición de `any`

`any` está prohibido, incluido `any` implícito, `as any` y `catch (e: any)`. Tampoco se usa `eslint-disable` ni `@ts-ignore` para saltarse un tipo. Si un valor externo no tiene tipo, entra como `unknown` y se estrecha.

`@ts-expect-error` solo cabe junto a un comentario de una línea que diga qué invariante falta, y se elimina en cuanto el tipo existe.

### 2.3 `interface` y `type`

Se usan los dos, con un criterio fijo. La verificación rechaza un alias de tipo que solo repite una forma de objeto extensible, y rechaza una `interface` que intenta expresar una unión.

**`interface`** para un objeto con nombre que representa un contrato: respuesta de API, props de componente, estado de Zustand, error HTTP, usuario público.

```ts
export interface AuthResult {
  token: string;
  user: PublicUser;
}
```

**`type`** para uniones, intersecciones, utilidades de Prisma o de Zod, y alias de un valor `as const`.

```ts
export type RegisterInput = z.infer<typeof registerSchema>;
export type PublicUserRecord = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
```

Un `select` de Prisma se declara con `satisfies Prisma.<Modelo>Select` para que el tipo del payload no se escriba a mano. Los enums de dominio (`Modality`, `ScrambleResult`) se importan del cliente generado, no se redeclaran.

### 2.4 Qué no se castea

`passwordHash` no aparece en `PublicUser` ni en ninguna respuesta JSON. El cliente móvil no reconstruye el modelo de Prisma: tiene su propio contrato (`AuthUser.createdAt` es `string`, porque JSON no transporta `Date`).

---

## 3. Arquitectura y capas

### 3.1 Backend

El camino de una petición es de una sola dirección:

```text
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL (Supabase)
                              ↘ GraphService → Neo4j   (solo Árbol de Habilidades)
```

La cuarta capa que toca la base es el repositorio. Prisma no se importa en rutas, controladores ni servicios. `lib/prisma.ts` crea el único `PrismaClient` (con `PrismaPg` y `env.DATABASE_URL`) y los repositorios son los únicos que lo usan.

| Capa | Responsabilidad | Le está prohibido |
| --- | --- | --- |
| Route (`*.routes.ts`) | Verbo, path y middlewares (`requireAuth`). Entrega al método del controlador | Leer el cuerpo, decidir estados HTTP, llamar a Prisma |
| Controller | `try/catch`, `schema.parse(req.body)`, leer `req.auth`, llamar un método del servicio, `res.status().json()` | Regla de negocio, `bcrypt`, consultas, armar mensajes de error de dominio |
| Service | Caso de uso: orquesta repositorios, hashea contraseñas, firma JWT, lanza `AppError` | Importar `express`, escribir `res`, llamar `prisma.*` |
| Repository | CRUD y traducción de errores de Prisma (`P2002`, `P2003`) a `AppError` | Decidir códigos HTTP, validar formato de email, conocer a Express |
| `errorMiddleware` | Último middleware de `createApp()`. Convierte excepciones en JSON | Contener reglas de un caso de uso |

`GraphService` (`services/graph.service.ts`) es el único borde con Neo4j. Posiciones y técnicas globales, y aristas `ATTEMPTED_TECHNIQUE`, `TRANSITIONED_TO` y `SUBMITTED_OPPONENT`, viven ahí. Usuarios, bitácoras, scrambles relacionales y follows viven en Postgres. Un scramble de F02 se persiste en las dos fronteras: la fila en `scrambles` (repositorio) y la arista (servicio de grafo). Hoy el grafo está detrás de un mock con la misma interfaz; sustituirlo no debe obligar a cambiar controladores ni la app.

Orden de `app.ts`: `cors`, `express.json()`, `/health`, routers bajo `/api`, y al final `errorMiddleware`.

### 3.2 Mobile (Expo Router)

```text
src/app/          pantallas y layouts. Leen stores y navegan
src/components/   UI sin acceso a la red ni a Secure Store
src/store/        Zustand. Llaman a services/*.api.ts
src/services/     HTTP, Secure Store, URL del API
src/types/        contratos JSON
src/utils/        funciones puras
src/theme/        tokens de docs/specs/01-design-system.md
src/constants/    ontología y etiquetas visibles
```

Navegación file-based. `Stack` y `Tabs` salen de `expo-router`. La sesión no se decide dentro de cada pantalla: `src/app/_layout.tsx` hidrata `useAuthStore` y separa grupos con `Stack.Protected` (`(app)` si hay token, `(auth)` si no). `typedRoutes` está activo en `app.json`; los paths de `router` y `Link` deben ser rutas que existan como archivo.

No hay carpetas `ios/` ni `android/` en el repositorio. El nativo se genera (Continuous Native Generation). Comportamiento nativo se configura en `app.json` y con plugins (`expo-router`, `expo-secure-store`). Dependencias nativas se instalan con `npx expo install` para fijar la versión compatible con SDK 58.

Una pantalla puede componer componentes y leer un store. Un componente visual recibe datos por props. La llamada HTTP vive en `services/*.api.ts`, invocada desde el store.

### 3.3 Qué verifica cada capa

| Pregunta de V&V | Dónde se mira |
| --- | --- |
| ¿El endpoint existe y exige JWT? | `*.routes.ts` |
| ¿El cuerpo se rechaza si no cumple la spec? | `*.schemas.ts` y el `parse` del controlador |
| ¿La regla de negocio coincide con el flujo de la spec? | `*.service.ts` |
| ¿El campo existe en el modelo y no se filtra `passwordHash`? | `schema.prisma` y el `select` del repositorio |
| ¿La pantalla y el mensaje de error son los de la spec? | `src/app/` y el texto de `AppError` / `http.ts` |

---

## 4. Manejo de errores y logging

### 4.1 Forma de un error HTTP

Todo error de `/api` sale por `errorMiddleware` con este cuerpo (`ErrorResponse` en `middlewares/error.middleware.ts`):

```json
{ "message": "Datos inválidos", "details": ["El correo es obligatorio"] }
```

`details` solo viaja en errores de validación. El cliente nunca recibe stack, código de Prisma ni el nombre de una columna.

| Origen | Estado | `message` |
| --- | --- | --- |
| `ZodError` | 400 | `"Datos inválidos"` y `details` con `issue.message` |
| `AppError` y subclases | `statusCode` de la clase | Texto fijo de la spec |
| Cualquier otra cosa | 500 | `"Error interno del servidor"` |

Subclases ya definidas en `lib/errors.ts`:

| Clase | Estado | Mensaje |
| --- | --- | --- |
| `InvalidCredentialsError` | 401 | Credenciales incorrectas |
| `UnauthorizedError` | 401 | No autorizado |
| `NotFoundError` | 404 | El que reciba el constructor |
| `CannotFollowSelfError` | 400 | No puedes seguirte a ti mismo |
| `EmailAlreadyInUseError` | 409 | Este correo ya está en uso |

Login con usuario inexistente y login con contraseña incorrecta lanzan el mismo `InvalidCredentialsError`. Un caso de uso nuevo añade una subclase con el texto de su spec; el controlador no escribe el mensaje.

Éxitos usados hoy: `200` en lecturas y en login, `201` en registro y en alta de bitácora.

### 4.2 Controladores

Cada método async va envuelto en `try/catch`. El `catch` solo hace `next(error)`. No hay `res.status(500)` dentro del controlador, porque ese atajo se salta el formato común.

```ts
async login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
```

### 4.3 Zod y errores de Prisma

La validación de formato (email, longitud de contraseña, enums, rangos) está en `*.schemas.ts` con Zod 4, tal como `auth.schemas.ts`: `z.email()`, mensajes en español, y `export type XInput = z.infer<typeof schema>`. El controlador llama `schema.parse`, no `safeParse`, para que el fallo llegue al middleware como `ZodError`.

Los invariantes de base de datos se traducen en el repositorio:

- `P2002` (único violado) en `user.create` → `EmailAlreadyInUseError`.
- `P2003` (foreign key) en bitácoras → error de dominio del caso de uso, no un 500 opaco.
- Cualquier otro error de Prisma se relanza y termina en 500.

La comprobación de negocio que se puede hacer antes del `INSERT` (correo ya usado, seguirse a uno mismo) vive en el servicio. El `P2002` cubre la carrera entre dos altas simultáneas; no reemplaza esa comprobación.

### 4.4 Cliente móvil

`http.ts` traduce la red a dos errores:

- `NetworkError` — sin respuesta, timeout de 10 s o aborto. Mensaje: `"Error de red. Intenta nuevamente"`.
- `ApiError` — respuesta con estado ≥ 400. El mensaje visible es el `message` del JSON, o `"Ocurrió un error inesperado. Intenta nuevamente"`.

`getErrorMessage` es la única función que convierte un `unknown` en texto para la UI. Los stores guardan ese string en `error` y lo limpian con `clearError` al reintentar. Un `401` de una ruta autenticada cierra la sesión con `clearSession`.

### 4.5 Logging

El registro de fallos inesperados es `console.error(error)` dentro de `errorMiddleware`, antes del 500. `server.ts` puede informar el puerto al arrancar.

No se escribe en el log: `password`, `passwordHash`, `JWT_SECRET`, `Authorization`, ni la cadena completa de `DATABASE_URL`. Un `AppError` previsto (401, 404, 409) no se registra como fallo interno: es una respuesta de negocio.

---

## 5. Estilo de código y formato

### 5.1 ESLint y Prettier

Ningún paquete tiene todavía ESLint ni Prettier en sus dependencias. Hasta que se añadan, la verificación de estilo es `npm run typecheck` más la revisión de este apartado. Cuando se incorporen, la configuración de aceptación es esta, sin reglas que contradigan el `tsconfig`:

- Prettier: comillas dobles, punto y coma, ancho 100, indentación de 2 espacios, final de línea LF. El código existente ya sigue esa forma.
- ESLint con `typescript-eslint` en modo type-checked: `@typescript-eslint/no-explicit-any` en error, `@typescript-eslint/no-unused-vars` en error (argumentos que empiezan por `_` permitidos, como `_req` y `_next`), prohibido `console.log` en `backend/src` salvo `server.ts` y el `console.error` del middleware de errores.
- Mobile: `eslint-config-expo` (SDK 58) más la misma prohibición de `any`. `npx expo lint` pasa limpio.

Un formateador no reordena imports de forma distinta a la sección 5.2.

### 5.2 Imports

**Backend.** Rutas relativas, porque `tsconfig` no define `paths` y el módulo es `nodenext`. Desde un controlador, el servicio es `../services/auth.service`. No se crean alias nuevos.

Orden dentro del archivo:

1. Paquetes (`express`, `zod`, `bcryptjs`).
2. Módulos de otra carpeta de `src/` (`../lib/errors`, `../repositories/user.repository`).
3. Módulos del mismo directorio (`./auth.schemas`).

Tipo solo-tipo se importa con `import type`. Un valor y un tipo del mismo módulo pueden compartir el import si el valor se usa en runtime.

**Mobile.** Alias `@/` apunta a `mobile/src/*` (`tsconfig` `paths`). Todo import que sale del directorio actual usa el alias:

```ts
import { useAuthStore } from "@/store/auth.store";
import { colors } from "@/theme";
```

El relativo `./` queda para el vecino de la misma carpeta (`http.ts` importa `./config`). No se usa `../../` para cruzar capas.

Los dos lados usan imports ESM en el fuente (`import` / `export`). El backend los emite como CommonJS; no se escribe `require`.

### 5.3 React Native

- Componentes funcionales. No hay componentes de clase, salvo el límite ya existente `GraphErrorBoundary` (un error boundary de React exige clase).
- La pantalla de ruta es `export default function`. El componente reutilizable es export con nombre, igual al archivo.
- Estilos con `StyleSheet.create` en el mismo archivo, colores y radios desde `@/theme` (los hex de `docs/specs/01-design-system.md`). No se copian hex sueltos en la pantalla.
- El usuario toca `Pressable`, no `TouchableOpacity`. Botones e iconos de acción declaran `accessibilityRole` y `accessibilityState` cuando el control puede estar deshabilitado o en carga.
- Listas largas (feed, bitácoras) usan un componente virtualizado de React Native. No se mapea un arreglo grande dentro de un `ScrollView`.
- El JWT se lee y se escribe solo en `services/secureStorage.ts` (`expo-secure-store`). Ningún otro módulo importa Secure Store. La clave actual es `auth_token`.

### 5.4 Zustand

Un store por caso de uso, en `src/store/<contexto>.store.ts`, creado con `create<Estado>`. El estado se describe con `interface` (datos, banderas `isLoading` / `error`, y acciones).

- El componente se suscribe a un campo: `useAuthStore((state) => state.token)`. No se toma el store entero, para no rerenderizar de más.
- La acción async pone `isLoading`, llama al `*Api`, y en el `catch` guarda `getErrorMessage(error)`.
- El store no importa componentes ni `expo-router`. Navegar es trabajo de la pantalla, que observa el cambio de `token` o de `error`.
- No se persiste el usuario en disco. La sesión persistida es el JWT (F01). Si el almacenamiento falla, la app arranca sin sesión en lugar de quedarse en el splash.

---

## 6. Estrategia de commits y trazabilidad

Cada commit sigue Conventional Commits y nombra el caso de uso que permite verificarlo. El tipo va en inglés; el asunto, en español, en imperativo, con punto final opcional y menos de 72 caracteres en la primera línea.

```text
<tipo>(<alcance>): <asunto>

<cuerpo opcional: qué spec o criterio de aceptación queda cubierto>
```

| Tipo | Cuándo | Ejemplo |
| --- | --- | --- |
| `feat` | Comportamiento nuevo de una spec | `feat(F02): registra la bitácora y sus scrambles` |
| `fix` | El comportamiento se desvía de la spec o del estándar | `fix(F01): rechaza el login con el mensaje de credenciales` |
| `docs` | Specs, ontología o este estándar | `docs(F04): precisa el umbral verde del árbol` |
| `refactor` | Cambia estructura sin cambiar el comportamiento observable | `refactor(F06): mueve el conteo de follows al repositorio` |
| `test` | Añade o ajusta una prueba de V&V | `test(F03): cubre el feed vacío de un usuario sin seguidos` |

Alcances válidos: `F01`, `F02`, `F03`, `F04`, `F05`, `F06`. Un cambio de cimientos (Prisma, `http.ts`, `errorMiddleware`, este documento) usa `core` o `standards`.

```text
feat(core): traduce P2002 a correo ya en uso
docs(standards): fija el formato de error HTTP
```

Un commit no mezcla dos casos de uso. Si un arreglo de F02 obliga a tocar el cliente HTTP común, el asunto dice F02 y el cuerpo menciona el archivo compartido.

La matriz de trazabilidad que usa la fase de pruebas:

| Caso de uso | Spec | Backend | Mobile |
| --- | --- | --- | --- |
| F01 Autenticación | `features/F01-autenticacion.md` | `auth.routes`, `auth.controller`, `auth.service`, `auth.schemas`, `user.repository`, `lib/jwt`, `middlewares/auth.middleware` | `(auth)/login`, `(auth)/register`, `auth.store`, `auth.api`, `secureStorage` |
| F02 Bitácora | `features/F02-registrar-bitacora.md` | `log.routes`, `log.controller`, `log.service`, `log.schemas`, `log.repository`, `graph.service` | `(app)/log`, `log.store`, `logs.api` |
| F03 Feed | `features/F03-visualizar-feed.md` | `feed.routes`, `feed.controller`, `feed.service`, `feed.repository` | `(tabs)/feed`, `feed.store`, `feed.api` |
| F04 Árbol | `features/F04-visualizar-grafo.md`, `ONTOLOGY.md` | `skills.routes`, `skills.controller`, `skills.service`, `graph.service`, `ontology/` | `(tabs)/skills`, `skills.store`, `skills.api` |
| F05 Perfil | `features/F05-visualizar-perfil.md` | `users` `GET /me`, `GET /me/logs` | `(tabs)/profile`, `profile.store`, `profile.api` |
| F06 Conexiones | `features/F06-conexiones-sociales.md` | `follows.service`, `follow.repository`, `users` follow | `user/[id]`, `userProfile.store`, `FollowButton` |

Un informe de prueba cita el commit (`feat(F01): …`) y el criterio de aceptación de la spec. Un commit sin tipo, sin alcance o con un alcance que no está en esta tabla no entra en la línea base de V&V.

---

## Lista de verificación

Se marca durante la revisión. Un ítem fallido devuelve el cambio antes de ejecutar las pruebas de validación.

1. El diff cita una spec de `docs/specs/features/` o un apartado de este estándar, y no añade campos fuera de `schema.prisma`.
2. Los archivos nuevos respetan `<contexto>.<rol>.ts`, PascalCase en componentes y `useXStore` / `useX` en hooks.
3. `npm run typecheck` pasa en cada paquete tocado. No hay `any`.
4. Las funciones exportadas declaran parámetros y retorno. Los contratos de objeto son `interface`; las uniones y los `z.infer` son `type`.
5. Ningún controlador, servicio o pantalla importa `PrismaClient`. Las consultas nuevas están en un repositorio. Neo4j solo se alcanza desde `GraphService`.
6. El controlador hace `schema.parse` dentro de `try/catch` y delega con `next(error)`.
7. Un error HTTP tiene `message` y, solo si es Zod, `details`. El 500 no filtra el error interno. No se loguean secretos.
8. Mobile importa con `@/`. El JWT solo pasa por `secureStorage`. La pantalla no llama a `fetch`.
9. Variables nuevas están en `config/env.ts` o, en mobile, llevan prefijo `EXPO_PUBLIC_`.
10. El mensaje del commit es `<tipo>(F0x|core|standards): …` y el tipo es uno de `feat`, `fix`, `docs`, `refactor`, `test`.

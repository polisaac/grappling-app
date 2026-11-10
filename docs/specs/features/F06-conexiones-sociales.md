# Feature F06: Conexiones Sociales y Perfiles Públicos

## 1. Objetivo
Permitir a los usuarios descubrir a otros atletas, ver sus perfiles públicos y construir su propia red mediante un sistema de "Seguidores/Seguidos" (Followers/Following) para visualizar un feed personalizado.

## 2. Modelo de Datos (Prisma)
Se debe agregar una relación "muchos a muchos" en el `schema.prisma` para manejar los seguidores.
- **Modelo `Follows`**:
  - `followerId` (String, relación a User)
  - `followingId` (String, relación a User)
  - `createdAt` (DateTime)
  - Clave primaria compuesta: `@@id([followerId, followingId])`
- **Modelo `User`**:
  - Agregar relaciones inversas: `followers` (Follows[] @relation("following")) y `following` (Follows[] @relation("followers")).

## 3. Endpoints del Backend
- **`POST /api/users/:id/follow`**
  - Acción: Crea un registro en `Follows` donde el usuario autenticado es el `follower` y el `:id` es el `following`.
  - Respuesta: 200 OK.
- **`DELETE /api/users/:id/follow`**
  - Acción: Elimina el registro de `Follows`.
  - Respuesta: 200 OK.
- **`GET /api/users/:id`**
  - Acción: Obtiene los datos públicos de un usuario (id, name), métricas de seguidores/seguidos, y su estado de conexión con el usuario autenticado (ej. `isFollowing: boolean`).
- **`GET /api/users/:id/logs`**
  - Acción: Obtiene el historial de bitácoras del usuario especificado.
- **Actualización `GET /api/feed`**:
  - Parámetro opcional: `?tab=following`.
  - Si se envía, filtra las bitácoras usando `where: { userId: { in: [...misSeguidos] } }`.

## 4. UI / UX Mobile
- **Navegación en el Feed (`feed.tsx`)**:
  - Implementar un selector superior (Top Tab) estilo X con dos opciones: "Para ti" (Global) y "Siguiendo".
  - Al cambiar de pestaña, se recarga la `FlatList` con el endpoint correspondiente.
- **Perfil Público (`app/(app)/user/[id].tsx`)**:
  - Al hacer tap en el avatar o nombre de un usuario en el `LogCard`, navegar a esta pantalla.
  - Mostrar cabecera de perfil, métricas (Seguidores/Siguiendo) y botón de acción.
  - **Botón de Seguir (Diseño)**:
    - No seguido: Botón relleno de blanco con texto negro (estilo X).
    - Seguido: Botón con fondo `#000000`, borde `#2F3336` y texto blanco (dice "Siguiendo").
  - Mostrar el historial de bitácoras del usuario visitado reutilizando `LogCard`.

## 5. Criterios de Aceptación
1. El usuario puede alternar entre el feed global y el de seguidos.
2. Hacer clic en el autor de una bitácora abre su perfil público.
3. El usuario puede seguir y dejar de seguir a otro sin errores.
4. El feed de "Siguiendo" debe mostrar instantáneamente las publicaciones de los nuevos seguidos.
# Feature: F05 - Ver Perfil Propio

## Objetivo

Proporcionar un espacio personal donde el usuario pueda consultar su propia biografía, métricas resumidas y el historial cronológico de todas sus bitácoras de entrenamiento.

## Actor

Atleta (Usuario autenticado).

## Precondiciones

- Sesión activa.

## Flujo principal

1. El usuario presiona la pestaña "Perfil" en la barra de navegación.
2. El sistema obtiene la información del usuario (`GET /users/me`) y su historial de bitácoras.
3. Se renderiza la cabecera (Header) mostrando:
   - Foto de perfil (si existe) y Nombre.
   - Estadísticas rápidas (Ej. total de entrenamientos).
4. Debajo de la cabecera, se renderiza un _FlatList_ exclusivamente con las bitácoras creadas por el usuario.
5. Se muestra un botón de engranaje (Settings) para acceder al cierre de sesión.

## Validaciones

- Confirmar que el ID del perfil consultado corresponde al del token activo.

## Resultado esperado

Una vista centralizada de la identidad del atleta dentro de la plataforma y su registro personal.

## Casos de error

- Error al obtener los datos del usuario: Mostrar pantalla de error y opción de reintentar.

## Criterios de aceptación

- [ ] La cabecera muestra el nombre correcto extraído de la base de datos (Postgres).
- [ ] La lista de posts pertenece única y exclusivamente al usuario actual.
- [ ] El botón de ajustes está visible y permite ejecutar la acción de cerrar sesión (eliminar JWT y volver al Login).

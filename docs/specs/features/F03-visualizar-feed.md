# Feature: F03 - Visualizar el Feed Social

## Objetivo

Mostrar un muro cronológico con las bitácoras de entrenamiento del propio usuario y de sus conexiones (amigos), permitiéndole estar al tanto de la actividad de su comunidad.

## Actor

Atleta (Usuario autenticado).

## Precondiciones

- El usuario debe tener una sesión activa.

## Datos de entrada

- Acción de _Pull to refresh_ (deslizar hacia abajo) para recargar los datos.

## Flujo principal

1. El usuario abre la app y es dirigido (o navega) a la pestaña "Feed".
2. El sistema muestra un estado de carga (skeleton loaders).
3. El frontend hace una petición GET al backend para obtener los últimos posts.
4. El sistema renderiza una lista de tarjetas (cards), donde cada una muestra:
   - Nombre del autor.
   - Fecha y lugar.
   - Modalidad (Gi/No Gi).
   - Lista resumida de _scrambles_ (Técnicas aplicadas/recibidas).
5. El usuario hace scroll hacia abajo para ver bitácoras más antiguas.

## Validaciones

- El token JWT debe ir en los headers de la petición para autorizar la lectura.

## Resultado esperado

Una lista de publicaciones fluida que el usuario puede explorar verticalmente.

## Casos de error

- Si falla la conexión: Mostrar un componente visual de error con un botón "Reintentar".
- Si el usuario no tiene amigos ni posts propios: Mostrar un estado vacío amigable (ej. "¡Tu feed está vacío! Agrega tu primer entrenamiento o busca amigos.").

## Criterios de aceptación

- [ ] Al entrar a la pestaña, se muestra feedback visual de carga.
- [ ] Las publicaciones aparecen ordenadas de la más reciente a la más antigua.
- [ ] La acción de _pull-to-refresh_ vuelve a consultar el backend y actualiza la lista.
- [ ] El estado vacío (lista sin elementos) muestra un diseño específico y no una pantalla en blanco.

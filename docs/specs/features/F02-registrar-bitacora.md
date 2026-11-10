# Feature: F02 - Registrar bitácora y scrambles

## Objetivo

Permitir que el usuario registre los datos generales de su sesión de entrenamiento y mapee las técnicas que aplicó o recibió, para alimentar su árbol de habilidades y el muro social.

## Actor

Atleta (Usuario autenticado).

## Precondiciones

- El usuario debe tener una sesión activa (Token JWT válido).
- El sistema debe tener precargada la lista de posiciones y técnicas (Ontología).

## Datos de entrada

**Paso 1: Metadatos de la sesión**

- Fecha y Hora (automático, editable).
- Modalidad (Gi, No Gi, Judo, Sambo).
- Ubicación (Texto opcional).
- Satisfacción (1 al 5 estrellas).
- Nota general / Foto (Opcionales).

**Paso 2: Registro de Scrambles (Flujo rápido)**

- Posición inicial (ej. Guardia Cerrada).
- Técnica intentada (ej. Armbar).
- Resultado (A favor / En contra / Fallido).

## Flujo principal

1. El usuario presiona el Botón Flotante "+" desde el Feed o Perfil.
2. El sistema muestra el formulario "Paso 1" (Metadatos).
3. El usuario completa los metadatos y presiona "Agregar acciones (Scrambles)".
4. El sistema muestra selectores rápidos de Posición y Técnica.
5. El usuario guarda las acciones.
6. El usuario presiona "Publicar Bitácora".
7. El sistema valida los datos.
8. El backend guarda la información relacional (Postgres) y actualiza el grafo (Neo4j).
9. El usuario regresa al Feed Social.

## Validaciones

- La Fecha y la Modalidad son obligatorias.
- Si el usuario decide registrar un Scramble, la Posición inicial y el Resultado son obligatorios.
- El tamaño de la foto (si se sube) no debe exceder 5MB.

## Resultado esperado

La bitácora aparece como una publicación en el Feed Social del usuario y de sus amigos. Las acciones registradas modifican el color de los nodos en el Árbol de Habilidades.

## Casos de error

- Si no hay conexión a Internet, mostrar alerta: "No se pudo guardar la bitácora. Revisa tu conexión".
- Si falta una validación obligatoria, el botón "Publicar" debe estar deshabilitado.
- Si falla la conexión con Neo4j (grafo), revertir el guardado en Postgres para mantener consistencia.

## Criterios de aceptación

- [ ] El botón flotante abre correctamente el formulario.
- [ ] El botón "Publicar" se bloquea si falta la modalidad.
- [ ] El usuario puede agregar más de un scramble en la misma bitácora.
- [ ] Al guardar con éxito, la app redirige al Feed.
- [ ] La nueva bitácora es visible inmediatamente en el top de la lista del Feed.

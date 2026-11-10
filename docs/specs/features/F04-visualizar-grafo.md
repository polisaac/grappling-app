# Feature: F04 - Visualizar el Árbol de Habilidades (Grafo)

## Objetivo

Renderizar un mapa visual (nodos y conexiones) que represente el estilo de juego del atleta, calculado a partir de su historial de _scrambles_, destacando sus caminos más efectivos y sus principales fugas o debilidades.

## Actor

Atleta (Usuario autenticado).

## Precondiciones

- El usuario tiene sesión activa.
- (Idealmente) El usuario ha registrado al menos 1 bitácora con scrambles para tener datos que mostrar.

## Datos de entrada

- Interacción de pellizco (Pinch to zoom) o arrastre sobre el área del lienzo visual.

## Flujo principal

1. El usuario navega a la pestaña "Skill Tree".
2. El frontend solicita el grafo personal del usuario a la API.
3. El backend consulta a Neo4j, calcula los pesos (win rate) de cada técnica y devuelve un JSON estructurado.
4. La librería de visualización (D3/SVG) dibuja los nodos (Posiciones y Técnicas) y las flechas (Relaciones).
5. El sistema aplica colores:
   - Verde: Tasa de éxito alta.
   - Rojo: Tasa de fallo o contraataque alta.
   - Gris/Neutral: Tasa en desarrollo.
6. El usuario explora el mapa.

## Validaciones

- Los cálculos de porcentaje de éxito deben sumarizase correctamente en el backend antes de llegar al móvil.

## Resultado esperado

Un lienzo interactivo que permite al atleta identificar de un vistazo, mediante códigos de color, en qué posiciones domina y en cuáles está perdiendo posiciones.

## Casos de error

- Si no hay datos suficientes (usuario nuevo): Mostrar un mensaje "Registra tus primeros entrenamientos para desbloquear tu árbol".
- Si el renderizado de la librería falla: Capturar el error y mostrar un texto de fallback para que la app no crashee.

## Criterios de aceptación

- [ ] La pantalla lee correctamente el JSON provisto por Neo4j/Backend.
- [ ] Los caminos con más de X% de fallos se pintan de color rojo.
- [ ] Los caminos con más de X% de éxito se pintan de color verde.
- [ ] Si el usuario tiene 0 bitácoras, se muestra el estado vacío informativo ("Sin datos aún").

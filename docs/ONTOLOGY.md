# Ontología del Grappling (Grafo Base - MVP)

## 1. Nodos Principales (Labels)
Para mantener el MVP ágil, categorizamos los nodos en solo dos tipos principales. Estos nodos son globales (todos los usuarios interactúan con los mismos nodos).

### Label: `Position` (Posiciones)
El estado estático de la pelea. Se dividen en dominantes (Top/Control) y defensivas (Bottom).
*   **De Pie:** `Standing`
*   **Guardias (Bottom):** `Closed Guard`, `Half Guard`, `Open Guard`, `De La Riva`
*   **Controles (Top):** `Side Control (Top)`, `Mount (Top)`, `Back Control`
*   **Desventaja (Bottom):** `Side Control (Bottom)`, `Mount (Bottom)`

### Label: `Technique` (Técnicas)
La acción ejecutada para cambiar de posición o finalizar el combate.
*   **Derribos (Takedowns):** `Double Leg`, `Single Leg`, `Judo Throw`
*   **Pases de Guardia (Passes):** `Torreando`, `Knee Slice`, `Body Lock`
*   **Raspadas (Sweeps):** `Scissor Sweep`, `Hip Bump Sweep`, `Flower Sweep`
*   **Sumisiones (Submissions):** `Armbar`, `Triangle`, `Guillotine`, `Kimura`, `Rear Naked Choke`, `Heel Hook`
*   **Escapes/Defensas:** `Bridge & Roll`, `Shrimp Escape`, `Guard Retention`

---

## 2. Relaciones (Edges)
Las relaciones conectan los nodos y llevan "Propiedades" (Metadata) que determinan si la flecha del usuario se pintará verde (fortaleza) o roja (debilidad).

### Estructura de un Scramble (Flujo de Botones)
Cuando un usuario registra una acción, se crean o actualizan relaciones en el grafo vinculadas a su `userId`.

**Ejemplo de flujo del usuario:** 
*"Intenté una Guillotina desde Media Guardia abajo, fallé, y me pasaron a Control Lateral."*

**Cómo se dibuja en Neo4j:**
1. `(Position: Half Guard Bottom)` 
2. `-[ :ATTEMPTED_TECHNIQUE { userId: "123", result: "FAILED", timestamp: "..." } ]->`
3. `(Technique: Guillotine)` 
4. `-[ :TRANSITIONED_TO { userId: "123", context: "AFTER_FAILURE" } ]->` 
5. `(Position: Side Control Bottom)`

### Tipos de Relaciones
*   `ATTEMPTED_TECHNIQUE`: Conecta una `Position` con una `Technique`.
    *   *Propiedades:* `userId`, `result` (SUCCESS / FAILURE), `date`.
*   `TRANSITIONED_TO`: Conecta una `Technique` con la nueva `Position` resultante.
    *   *Propiedades:* `userId`, `context` (AFTER_SUCCESS / AFTER_FAILURE).
*   `SUBMITTED_OPPONENT`: Relación final (nodo terminal) si la técnica de sumisión fue exitosa. No transiciona a otra posición.

---

## 3. Lógica del Árbol de Habilidades (Skill Tree Analitics)
Para renderizar el mapa de un usuario específico, el backend calculará el "peso" de las relaciones basándose en los conteos de `SUCCESS` vs `FAILURE`:

*   **Camino Verde (Fortaleza):** `ATTEMPTED_TECHNIQUE` donde `SUCCESS` > 70%.
*   **Camino Amarillo (En desarrollo):** `ATTEMPTED_TECHNIQUE` donde `SUCCESS` está entre 40% y 70%.
*   **Camino Rojo (Fuga/Debilidad):** `ATTEMPTED_TECHNIQUE` donde `FAILURE` > 60%, especialmente si el `TRANSITIONED_TO` lleva a una posición de desventaja.
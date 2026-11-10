# Visión del Proyecto: Grappling Social & Skill Tree

## El Concepto

Una plataforma y red social para practicantes de artes de agarre (BJJ, Luta Livre, Judo, Catch Wrestling, Sambo). Combina la experiencia social de interacción y publicaciones especiales con el seguimiento analítico de entrenamientos mediante un **Árbol de Habilidades (Grafo Conexo)** que evalúa el progreso técnico, fortalezas y debilidades del atleta.

## Arquitectura de Navegación (UI/UX)

- **Barra de Navegación Inferior (Tab Bar):** `Feed` | `Árbol de Habilidades` | `Analíticas` | `Perfil` | `Búsqueda`.
- **Menú Lateral (Drawer):** Acceso rápido a la totalidad de los módulos y a la configuración de la cuenta.
- **Acción Global (FAB):** Botón flotante omnipresente para registrar bitácoras de entrenamiento en cualquier momento.

## Stack Tecnológico (MVP)

- **Frontend (Móvil):** React Native (Expo) + TypeScript + Zustand + React Navigation (Tabs + Drawer) + SVG/D3 para renderizado de grafos.
- **Backend:** Node.js (TypeScript) + Express / Fastify.
- **Autenticación:** JWT con arquitectura de _Access Token_ y _Refresh Token_.
- **Bases de Datos:**
  - **PostgreSQL (vía Prisma):** Usuarios, Bitácoras, Publicaciones Especiales, Relaciones Sociales y Ajustes.
  - **Neo4j:** Modelado de nodos (Técnicas/Posiciones) y aristas de sistemas de lucha (Favor vs. En Contra).
  - **Redis:** Gestión de sesiones de actualización (_refresh tokens_) y almacenamiento en caché del Feed.

## Módulos Principales del Sistema

1. **Autenticación:** Registro/Login por email y contraseña con refresco de sesión.
2. **Bitácora de Entrenamiento:** Entrada rápida con metadatos, fotos, rating, etiquetas y métricas Favor/Contra.
3. **Muro Social y Publicaciones Especiales:** Feed con publicaciones de amigos, entrenamientos, seminarios, torneos y medallas.
4. **Árbol de Habilidades (Grappling Graph):** Visualización interactiva del grafo conectado que resalta debilidades y fortalezas técnicas.
5. **Analíticas y Perfil:** Panel estadístico personal y perfil público social personalizable.
6. **Ajustes:** Modo claro/oscuro, calendario de rachas, notificaciones y privacidad.

## Reglas para Agentes de IA

1. Respetar la división entre **PostgreSQL** (datos sociales y bitácoras) y **Neo4j** (grafo técnico).
2. Mantener un tipado estricto en TypeScript sin hacer uso de `any`.
3. Garantizar que todos los componentes globales respeten el tema (Light/Dark Mode).
4. No alterar contratos de API ni firmas de funciones sin actualizar primero `/docs`.

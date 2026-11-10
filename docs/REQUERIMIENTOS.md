# Especificación de Requerimientos del Sistema (SRS)

## 1. Requerimientos Funcionales (RF)

### 1.1 Autenticación y Gestión de Sesión

- **RF-AUTH-01 (Registro):** El sistema debe permitir el registro de usuarios mediante correo electrónico y contraseña.
- **RF-AUTH-02 (Inicio de Sesión):** El sistema debe autenticar usuarios mediante credenciales (correo y contraseña).
- **RF-AUTH-03 (Tokens JWT & Refresh):** La autenticación debe manejarse mediante JSON Web Tokens (JWT) con un mecanismo de tokens de actualización (_refresh tokens_) para mantener la sesión activa de forma segura.
- **RF-AUTH-04 (Cierre de Sesión):** El usuario debe poder invalidar su token y cerrar sesión desde cualquier dispositivo.

### 1.2 Bitácora de Entrenamiento (Core Data Entry)

- **RF-LOG-01 (Registro de Entrenamiento):** El usuario debe poder registrar una entrada en su bitácora con los siguientes campos:
  - **Metadatos:** Fecha, Hora, Ubicación (Gimnasio/Lugar).
  - **Modalidad:** Gi, No Gi, Open Mat, Lucha, Judo.
  - **Conteo de Acciones (Favor vs. En Contra):** Derribos, Guardias, Barridos, Sumisiones.
  - **Adjuntos & Notas:** Fotografías, Nota de texto libre, Calificación de satisfacción (Escala 1 a 5).
  - **Social & Privacidad:** Etiquetado de amigos presentes, Nivel de visibilidad (Público, Solo Amigos, Privado).

### 1.3 Publicaciones Especiales y Muro Social

- **RF-POST-01 (Publicaciones Especiales):** El usuario podrá crear publicaciones dedicadas a eventos tipo Competiciones, Open Mats, Seminarios y Logros/Medallas autogeneradas.
- **RF-FEED-01 (Feed Social):** El sistema debe listar en orden cronológico las publicaciones y entrenamientos compartidos por los usuarios seguidos o agregados como amigos.
- **RF-NOTIF-01 (Notificaciones):** El sistema enviará notificaciones por desbloqueo de logros del sistema y menciones/etiquetas de amigos.

### 1.4 Árbol de Habilidades (Grappling Graph)

- **RF-TREE-01 (Modelado de Grafo Conexo):** El sistema debe procesar los datos de las bitácoras para construir un grafo conexo de nodos (técnicas y posiciones) y aristas (transiciones/resultados).
- **RF-TREE-02 (Cálculo de Efectividad):** El grafo debe resaltar visualmente caminos de fortalezas (alto éxito a favor) y debilidades (alto fallo o acciones en contra).

### 1.5 Analíticas y Perfil

- **RF-ANALYTICS-01 (Tablero de Control):** El sistema debe calcular analíticas visuales basadas en el historial de bitácoras (volumen de entrenamientos, ratio de sumisiones, balance favor/contra).
- **RF-PROFILE-01 (Perfil Social):** Debe mostrar la biografía del usuario, medallas de gamificación, fotos de bitácoras y analíticas seleccionadas como públicas.
- **RF-PROFILE-02 (Perfiles de Amigos):** El usuario podrá visualizar el perfil de otros luchadores según las reglas de privacidad configuradas por estos.
- **RF-SEARCH-01 (Búsqueda de Usuarios):** El sistema permitirá buscar otros perfiles por nombre o usuario para enviar solicitudes de amistad.

### 1.6 Configuración y Ajustes

- **RF-SETT-01 (Personalización & Privacidad):** El usuario podrá cambiar el tema gráfico (Light/Dark Mode), gestionar recordatorios de entrenamiento, ver su calendario de racha (_streaks_), gestionar la privacidad del perfil y administrar la lista de usuarios bloqueados.

---

## 2. Requerimientos No Funcionales (RNF)

- **RNF-SEC-01 (Seguridad de Contraseñas):** Las contraseñas deben procesarse mediante Hashing unidireccional (Argon2id o bcrypt con salting) antes de almacenarse en la base de datos.
- **RNF-SEC-02 (Cifrado en Tránsito):** Toda la comunicación entre cliente y backend debe realizarse bajo el protocolo HTTPS/TLS.
- **RNF-PERF-01 (Tiempo de Respuesta):** El Feed y la consulta del Árbol de Habilidades deben responder en menos de 200 ms.
- **RNF-DATA-01 (Persistencia Dual):** Los datos relacionales y sociales se almacenarán en PostgreSQL; la topología del Árbol de Habilidades en Neo4j.

---

## 3. Requerimientos de Interfaz de Usuario (RUI)

- **RUI-NAV-01 (Barra Inferior de Navegación):** Accesos directos permanentes a: `Feed`, `Árbol de Habilidades`, `Analíticas`, `Perfil` y `Búsqueda`.
- **RUI-NAV-02 (Menú Lateral / Drawer):** Menú desplegable con acceso total a todos los módulos y ajustes del sistema.
- **RUI-ACT-01 (Boton Flotante de Acción - FAB):** Botón flotante accesible desde las pantallas de Feed, Árbol de Habilidades, Analíticas y Perfil para lanzar inmediatamente la pantalla de _Crear Bitácora_.

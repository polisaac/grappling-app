# Feature: F01 - Autenticación (Registro y Login)

## Objetivo

Permitir que un usuario cree una cuenta nueva o inicie sesión en una existente para acceder a las funcionalidades del sistema de forma segura.

## Actor

Usuario no autenticado (Visitante).

## Precondiciones

- El usuario ha descargado y abierto la aplicación.
- El usuario no tiene un token JWT activo en su dispositivo.

## Datos de entrada

- **Registro:** Nombre completo, Correo electrónico, Contraseña.
- **Login:** Correo electrónico, Contraseña.

## Flujo principal (Login)

1. El usuario abre la aplicación y ve la pantalla de bienvenida/login.
2. Ingresa su correo electrónico y contraseña.
3. Presiona el botón "Iniciar Sesión".
4. El sistema muestra un indicador de carga.
5. El backend verifica las credenciales y devuelve un token JWT.
6. La aplicación guarda el token de forma segura en el dispositivo (Secure Store).
7. El sistema redirige al usuario a la pantalla principal (Feed).

## Validaciones

- El formato del correo electrónico debe ser válido (ej. usuario@dominio.com).
- La contraseña debe tener un mínimo de 6 caracteres.
- Los campos no pueden estar vacíos al presionar los botones de acción.

## Resultado esperado

El usuario ingresa exitosamente a su cuenta, manteniendo su sesión activa para no tener que loguearse cada vez que abra la app.

## Casos de error

- Si el usuario no existe o la contraseña es incorrecta: Mostrar mensaje "Credenciales incorrectas".
- Si el correo ya está registrado (al crear cuenta): Mostrar mensaje "Este correo ya está en uso".
- Si no hay conexión a internet: Mostrar "Error de red. Intenta nuevamente".

## Criterios de aceptación

- [ ] El botón de submit se deshabilita si los campos obligatorios están vacíos.
- [ ] El formulario valida correctamente el formato del email antes de enviarlo al servidor.
- [ ] Un login exitoso almacena el JWT localmente.
- [ ] Tras el login/registro, el usuario es redirigido inmediatamente al _Feed_.
- [ ] Si la app se cierra y se vuelve a abrir, y el token es válido, el usuario entra directo al _Feed_ sin ver la pantalla de login.

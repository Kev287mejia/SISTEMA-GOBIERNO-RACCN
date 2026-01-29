# 🕵️ DIAGNÓSTICO DE LOGIN PASO A PASO

Si sigues teniendo problemas para ingresar con Julio, sigue estos pasos para diagnosticar exactamente dónde está fallando.

## PASO 1: Accede a la herramienta de diagnóstico

He creado una página especial que nos dirá qué está viendo tu navegador.

1. Abre tu navegador (preferiblemente Chrome o Edge).
2. Ve a esta URL exacta:
   ```
   https://637419696d67.ngrok-free.app/debug
   ```

## PASO 2: Interpreta los resultados

Verás una pantalla oscura con letras verdes.

### CASO A: Dice "Status: unauthenticated" y NO hay cookies
Esto significa que el navegador no está guardando la sesión.
- **Causa probable**: Bloqueo de cookies de terceros o el reloj del sistema.
- **Solución**:
  1. Verifica que la fecha y hora de tu computadora estén correctas.
  2. Intenta usar otro navegador (Firefox suele ser más permisivo).
  3. Asegúrate de haber hecho clic en "Ingresar al Portal" después de limpiar cookies.

### CASO B: Dice "Status: authenticated" y ves los datos de Julio
Esto significa que **SÍ estás logueado**, pero el Dashboard tiene problemas.
- **Solución**: Haz clic en el botón verde "Ir a Dashboard" en esa misma página.

### CASO C: Ves cookies pero "Status: unauthenticated"
Esto significa que las cookies son inválidas o corruptas.
- **Solución**: Necesitas limpiar las cookies OBLIGATORIAMENTE.
  - En la página `/debug`, abre la consola (F12).
  - Ve a Application > Storage > Cookies.
  - Borra todo.
  - Recarga la página.

## PASO 3: Intenta el Login de nuevo

1. Desde la página `/debug`, haz clic en "Ir a Login".
2. Ingresa:
   - `julio.lopez@graccnn.gob.ni`
   - `julio123`
3. Si te devuelve al login sin error, es un problema de cookies (Bloqueo).
4. Si se queda cargando eternamente, es un problema de red (tu conexión con ngrok).

---

## 💡 UN TRUCO RÁPIDO

Si nada funciona, intenta abrir una **Ventana de Incógnito** y ve directamente a:
`https://637419696d67.ngrok-free.app`

A veces las extensiones del navegador bloquean el login.

---

**Resumen de Credenciales Validadas:**
- Usuario: `julio.lopez@graccnn.gob.ni`
- Password: `julio123`
- Estado: Activo y verificado en base de datos.

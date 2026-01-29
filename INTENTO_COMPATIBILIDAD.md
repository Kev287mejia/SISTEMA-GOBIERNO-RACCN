# 🧪 SOLUCIÓN DE COMPATIBILIDAD

He desactivado los requisitos estrictos de seguridad de cookies para permitir el acceso desde ngrok sin restricciones.

## ⚠️ PASOS OBLIGATORIOS:

1. **LIMPIA LAS COOKIES OBLIGATORIAMENTE**.
   - Haz clic en el candado 🔒.
   - Borra TODAS las cookies de ngrok.
   - (El nombre de la cookie ha cambiado, las viejas causarán conflicto).

2. **RECARGA LA PÁGINA DE LOGIN**.

3. **INTENTA ENTRAR:**
   - User: `julio.lopez@graccnn.gob.ni`
   - Pass: `julio123`

Ahora la cookie se llama simplemente `next-auth.session-token` y no requiere HTTPS estricto, lo que evita conflictos entre ngrok y el servidor local.

¡Esto debe dejarte entrar!

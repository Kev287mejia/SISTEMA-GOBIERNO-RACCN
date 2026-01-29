# 🔐 GUÍA DE INICIO DE SESIÓN - MÓDULO DE PRESUPUESTO

## ✅ ESTADO ACTUAL DEL SISTEMA

### Servidor
- ✅ **Estado**: CORRIENDO
- ✅ **URL**: http://localhost:3000
- ✅ **Puerto**: 3000

### Usuario Configurado
- ✅ **Email**: yahira.tucker@graccnn.gob.ni
- ✅ **Contraseña**: yahira123
- ✅ **Nombre**: Yahira Tucker Medina
- ✅ **Rol**: ResponsablePresupuesto
- ✅ **Estado**: ACTIVO
- ✅ **Permisos**: VERIFICADOS para /presupuesto

---

## 📝 PASOS PARA INICIAR SESIÓN

### Paso 1: Abrir el Navegador
1. Abre tu navegador web (Chrome, Firefox, Safari, etc.)
2. Ve a la URL: **http://localhost:3000**

### Paso 2: Ir a la Página de Login
- Si no estás logueado, te redirigirá automáticamente al login
- O puedes ir directamente a: **http://localhost:3000/auth/login**

### Paso 3: Ingresar Credenciales
**IMPORTANTE**: Copia y pega exactamente estas credenciales:

```
Email: yahira.tucker@graccnn.gob.ni
Contraseña: yahira123
```

**⚠️ NOTAS IMPORTANTES:**
- El email debe estar en **minúsculas**
- NO debe haber espacios antes o después del email
- La contraseña es sensible a mayúsculas/minúsculas
- Asegúrate de copiar exactamente como está escrito

### Paso 4: Hacer Click en "Iniciar Sesión"
- Presiona el botón de inicio de sesión
- Espera a que cargue (debería ser rápido)

### Paso 5: Acceder al Módulo de Presupuesto
Una vez logueado, tienes 2 opciones:

**Opción A - Desde el menú lateral:**
1. Busca "Presupuesto" en el menú de navegación izquierdo
2. Haz click en el enlace

**Opción B - URL directa:**
1. Ve directamente a: **http://localhost:3000/presupuesto**

---

## 🎯 QUÉ DEBERÍAS VER

### En la Página de Login:
- Formulario con campos de Email y Contraseña
- Botón "Iniciar sesión"
- Diseño limpio y profesional

### Después de Iniciar Sesión:
- Serás redirigido al Dashboard
- Verás tu nombre en la esquina superior derecha
- Tendrás acceso al menú lateral

### En el Módulo de Presupuesto:
- **Header verde premium** con gradiente
- Botón **"Nueva Partida SNIP"**
- Botón **"Generar Documentación Oficial"**
- **3 tarjetas de estadísticas** (Techo Asignado, Gasto Ejecutado, Saldo Disponible)
- **Filtros de búsqueda**
- **Tabla de partidas presupuestarias**

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "No me deja iniciar sesión"

**Solución 1 - Verificar credenciales:**
```bash
# Ejecuta este comando en la terminal:
cd "/Users/kevinmejia/Documents/SISTEMA GOBIERNO"
npx -y ts-node --compiler-options '{"module": "CommonJS"}' scripts/fix-yahira-login.ts
```

**Solución 2 - Limpiar caché del navegador:**
1. Presiona `Ctrl+Shift+Delete` (Windows/Linux) o `Cmd+Shift+Delete` (Mac)
2. Selecciona "Cookies y otros datos de sitios"
3. Haz click en "Borrar datos"
4. Recarga la página con `Ctrl+F5` o `Cmd+Shift+R`

**Solución 3 - Usar modo incógnito:**
1. Abre una ventana de incógnito/privada
2. Ve a http://localhost:3000
3. Intenta iniciar sesión nuevamente

### Problema: "Me redirige al login después de iniciar sesión"

**Causa**: La sesión no se está guardando correctamente

**Solución:**
1. Verifica que las cookies estén habilitadas en tu navegador
2. Cierra todas las pestañas del localhost:3000
3. Abre una nueva pestaña
4. Ve a http://localhost:3000/auth/login
5. Inicia sesión nuevamente

### Problema: "Página en blanco en /presupuesto"

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Recarga la página con `Ctrl+Shift+R`

---

## 📊 VERIFICACIÓN DEL SISTEMA

Para verificar que todo está funcionando correctamente:

```bash
# 1. Verificar que el servidor está corriendo
curl http://localhost:3000

# 2. Verificar el usuario
cd "/Users/kevinmejia/Documents/SISTEMA GOBIERNO"
npx -y ts-node --compiler-options '{"module": "CommonJS"}' scripts/verify-budget-user.ts

# 3. Verificar la contraseña
npx -y ts-node --compiler-options '{"module": "CommonJS"}' scripts/fix-yahira-login.ts
```

---

## 💡 CONSEJOS ADICIONALES

1. **Usa Chrome o Firefox** para mejor compatibilidad
2. **Mantén la consola abierta** (F12) para ver posibles errores
3. **No cierres la terminal** donde está corriendo el servidor
4. Si algo falla, **reinicia el servidor**:
   ```bash
   # En la terminal, presiona Ctrl+C para detener el servidor
   # Luego ejecuta:
   npm run dev
   ```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de intentar iniciar sesión, verifica:

- [ ] El servidor está corriendo (puerto 3000)
- [ ] Puedes acceder a http://localhost:3000
- [ ] Estás usando las credenciales exactas (copia y pega)
- [ ] No hay espacios extra en el email
- [ ] Las cookies están habilitadas en tu navegador
- [ ] Has limpiado el caché si ya intentaste antes

---

## 📞 ÚLTIMA VERIFICACIÓN

Si después de seguir todos estos pasos aún no puedes acceder:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Intenta iniciar sesión
4. Busca la petición a `/api/auth/callback/credentials`
5. Revisa la respuesta (debería ser 200 OK)

Si ves un error 401 o 403, el problema es de autenticación.
Si ves un error 500, el problema es del servidor.

# MANUAL INTEGRAL DEL SISTEMA GRACCNN - VOLUMEN IV
## MANUAL TÉCNICO DE DESPLIEGUE Y MANTENIMIENTO

**Versión del Documento:** 1.0  
**Fecha de Auditoría:** 02 de Febrero, 2026  
**Auditor:** Antigravity AI - Senior Systems Auditor

---

## 1. REQUISITOS DEL SISTEMA

Para garantizar la operación óptima del sistema GRACCNN, se requiere la siguiente infraestructura:

### 1.1 Servidor (Hardware / Virtual)
-   **CPU:** 2 vCPU mínimo (Recomendado 4 vCPU).
-   **RAM:** 4 GB mínimo (Recomendado 8 GB para producción).
-   **Almacenamiento:** 50 GB SSD (Crecimiento según documentos adjuntos).
-   **SO:** Linux (Ubuntu 22.04 LTS recomendado) o macOS (Desarrollo).

### 1.2 Software Base
-   **Node.js:** Versión 18.17.0 o superior (LTS).
-   **PostgreSQL:** Versión 15 o superior.
-   **Git:** Para control de versiones.
-   **PM2:** (Opcional) Para gestión de procesos en producción.

---

## 2. INSTALACIÓN Y PUESTA EN MARCHA (DESDE CERO)

Siga estos pasos para levantar el sistema en un entorno limpio.

### Paso 1: Obtención del Código
Clonar el repositorio oficial en el servidor destino.
```bash
git clone [URL_DEL_REPOSITORIO]
cd SISTEMA_GOBIERNO
```

### Paso 2: Instalación de Dependencias
Instalar las librerías necesarias del proyecto.
```bash
npm install
```

### Paso 3: Configuración de Entorno
1.  Copiar el archivo de ejemplo de variables de entorno.
    ```bash
    cp .env.example .env
    ```
2.  Editar el archivo `.env` con los credenciales reales:
    -   `DATABASE_URL`: Cadena de conexión a PostgreSQL.
    -   `NEXTAUTH_SECRET`: Llave hash para seguridad de sesiones.
    -   `NEXTAUTH_URL`: URL canónica del sitio (ej. `https://contabilidad.gob.ni`).

### Paso 4: Base de Datos (Prisma ORM)
Sincronizar el esquema de la base de datos y generar el cliente de acceso.

```bash
# Generar cliente
npx prisma generate

# Aplicar migraciones (Crear tablas)
npx prisma migrate deploy

# (Opcional) Poblar con datos semilla iniciales (Admin user, catálogos base)
npm run db:seed
```

### Paso 5: Ejecución
Para iniciar el sistema:

**Modo Desarrollo (Pruebas):**
```bash
npm run dev
```
*Acceso en: `http://localhost:3000`*

**Modo Producción (Servidor Real):**
```bash
npm run build
npm start
```

---

## 3. MANTENIMIENTO Y OPERACIÓN TÉCNICA

### 3.1 Copias de Seguridad (Backup)
Se recomienda una política de respaldo diario de la base de datos PostgreSQL.
```bash
pg_dump -U [usuario] [nombre_db] > backup_$(date +%Y%m%d).sql
```
Adicionalmente, respaldar la carpeta `/public/uploads` donde se almacenan los documentos adjuntos de Contabilidad y Tesorería.

### 3.2 Actualizaciones
Para aplicar parches o nuevas versiones:
1.  `git pull` (Descargar cambios).
2.  `npm install` (Si hay nuevas dependencias).
3.  `npx prisma migrate deploy` (Si hay cambios en BD).
4.  `npm run build` (Reconstruir aplicación).
5.  Reiniciar servicio.

### 3.3 Logs y Monitoreo
El sistema genera logs de aplicación visibles en la consola del servidor. Para auditoría de negocio, consultar la tabla `AuditLog` en la base de datos o desde el módulo `/auditoria` en la interfaz web.

---

## 4. ANEXO: STACK TECNOLÓGICO

El sistema está construido sobre tecnologías de estándar industrial:

*   **Frontend/Backend:** Next.js 14 (React Framework).
*   **Lenguaje:** TypeScript (JavaScript tipado).
*   **Base de Datos:** PostgreSQL.
*   **ORM:** Prisma.
*   **Estilos:** Tailwind CSS + ShadcnUI.
*   **Autenticación:** NextAuth.js.

---

**Fin del Volumen IV**

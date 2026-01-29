# Guía de Configuración

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL instalado y ejecutándose
- npm o yarn instalado

## Pasos de Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sistema_gobierno?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
```

**Importante:**
- Reemplaza `usuario`, `contraseña` y `sistema_gobierno` con tus credenciales de PostgreSQL
- Para generar `NEXTAUTH_SECRET`, ejecuta: `openssl rand -base64 32`

### 3. Crear Base de Datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE sistema_gobierno;
```

### 4. Configurar Prisma

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push
```

### 5. Poblar Base de Datos con Usuarios de Prueba

```bash
npm run db:seed
```

Esto creará 7 usuarios de prueba, uno para cada rol.

### 6. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 7. Acceder a la Aplicación

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Usuarios de Prueba

Después de ejecutar `npm run db:seed`, puedes usar estos usuarios para iniciar sesión:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@sistema.com | admin123 | Admin |
| contador@sistema.com | contador123 | Contador General |
| auxiliar@sistema.com | auxiliar123 | Auxiliar Contable |
| presupuesto@sistema.com | presupuesto123 | Presupuesto |
| bodega@sistema.com | bodega123 | Bodega |
| rrhh@sistema.com | rrhh123 | RRHH |
| auditor@sistema.com | auditor123 | Auditor |

## Solución de Problemas

### Error: "Prisma Client hasn't been generated yet"

Ejecuta: `npm run db:generate`

### Error: "Can't reach database server"

Verifica que PostgreSQL esté ejecutándose y que la `DATABASE_URL` en `.env` sea correcta.

### Error: "NEXTAUTH_SECRET is missing"

Asegúrate de tener `NEXTAUTH_SECRET` en tu archivo `.env`.

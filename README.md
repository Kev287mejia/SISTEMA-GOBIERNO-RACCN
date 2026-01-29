# Sistema de Contabilidad Institucional

Sistema de gestión contable para instituciones gubernamentales desarrollado con Next.js 14, TypeScript, Tailwind CSS y shadcn/ui.

## Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript para type safety
- ✅ Tailwind CSS para estilos
- ✅ shadcn/ui para componentes UI
- ✅ Diseño profesional y sobrio optimizado para dashboards
- ✅ Estructura de carpetas organizada para sistema contable institucional
- ✅ Autenticación con NextAuth.js
- ✅ Control de acceso basado en roles (RBAC)
- ✅ PostgreSQL con Prisma ORM

## Estructura del Proyecto

```
.
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Dashboard principal
│   ├── contabilidad/      # Módulo de contabilidad
│   ├── facturas/          # Gestión de facturas
│   ├── presupuesto/       # Control presupuestario
│   ├── reportes/          # Generación de reportes
│   ├── entidades/         # Gestión de entidades
│   ├── usuarios/          # Gestión de usuarios
│   ├── configuracion/     # Configuración del sistema
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # Componentes UI de shadcn/ui
│   └── layout/            # Componentes de layout
├── lib/                   # Utilidades y helpers
└── public/                # Archivos estáticos
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y configurar:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_URL`: URL de la aplicación (http://localhost:3000 para desarrollo)
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth (generar con: `openssl rand -base64 32`)

3. Configurar la base de datos:
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate
```

4. Poblar la base de datos con usuarios de prueba:
```bash
npm run db:seed
```

5. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

6. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Usuarios de Prueba

Después de ejecutar `npm run db:seed`, puedes usar estos usuarios:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@sistema.com | admin123 | Admin |
| contador@sistema.com | contador123 | Contador General |
| auxiliar@sistema.com | auxiliar123 | Auxiliar Contable |
| presupuesto@sistema.com | presupuesto123 | Presupuesto |
| bodega@sistema.com | bodega123 | Bodega |
| rrhh@sistema.com | rrhh123 | RRHH |
| auditor@sistema.com | auditor123 | Auditor |

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el schema con la base de datos
- `npm run db:migrate` - Ejecuta migraciones de base de datos
- `npm run db:seed` - Pobla la base de datos con datos de prueba

## Tecnologías Utilizadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Lucide React** - Iconos
- **NextAuth.js** - Autenticación y autorización
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **bcryptjs** - Encriptación de contraseñas

## Módulos del Sistema

- **Dashboard**: Vista general con métricas y resúmenes
- **Contabilidad**: Gestión de registros contables y asientos
- **Facturas**: Administración de facturas y documentos fiscales
- **Presupuesto**: Control y gestión presupuestaria
- **Reportes**: Generación de reportes financieros
- **Entidades**: Gestión de entidades gubernamentales
- **Usuarios**: Administración de usuarios y permisos
- **Configuración**: Ajustes y parámetros del sistema

## Control de Acceso Basado en Roles (RBAC)

El sistema implementa 7 roles con diferentes permisos:

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso completo a todos los módulos |
| **Contador General** | Dashboard, Contabilidad, Facturas, Reportes, Entidades |
| **Auxiliar Contable** | Dashboard, Contabilidad, Facturas, Reportes |
| **Presupuesto** | Dashboard, Presupuesto, Reportes |
| **Bodega** | Dashboard |
| **RRHH** | Dashboard, Usuarios |
| **Auditor** | Dashboard, Contabilidad, Facturas, Presupuesto, Reportes, Entidades |

Las rutas están protegidas mediante middleware que verifica los permisos del usuario antes de permitir el acceso.

## Modelos de Base de Datos

El sistema utiliza Prisma ORM con PostgreSQL y incluye los siguientes modelos principales:

- **User**: Usuarios del sistema con roles y autenticación
- **AccountingEntry**: Asientos contables (ingresos/egresos) con estados de aprobación
- **BudgetItem**: Partidas presupuestarias con seguimiento de ejecución
- **InventoryItem**: Items de inventario con sistema Kardex
- **InventoryTransaction**: Transacciones de inventario (entradas/salidas)
- **HRRecord**: Registros de recursos humanos
- **AuditLog**: Registro completo de auditoría para todas las acciones

Todos los modelos incluyen:
- ✅ Soft deletes (`deletedAt`)
- ✅ Timestamps (`createdAt`, `updatedAt`)
- ✅ Relaciones con integridad referencial
- ✅ Índices optimizados
- ✅ Validaciones de datos

Ver [Documentación del Schema](./docs/DATABASE_SCHEMA.md) para más detalles.

## Próximos Pasos

- Desarrollar funcionalidades de cada módulo
- Implementar generación de reportes
- Agregar validaciones y formularios
- Implementar auditoría de acciones
- Agregar exportación de datos
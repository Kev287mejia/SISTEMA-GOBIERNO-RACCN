# 👥 GUÍA DE GESTIÓN DE USUARIOS - CONTADOR GENERAL

**Usuario**: Cro. Julio Lopez Escobar  
**Rol**: Contador General  
**Fecha**: 23 de enero de 2026

---

## 🎯 NUEVA FUNCIONALIDAD HABILITADA

Como **Contador General**, ahora tienes acceso al módulo de **Gestión de Usuarios**, que te permite crear y administrar cuentas para el personal del área contable y financiera.

---

## 📍 CÓMO ACCEDER

1. Inicia sesión con tus credenciales:
   - Email: `julio.lopez@graccnn.gob.ni`
   - Contraseña: `julio2026`

2. En el menú lateral, haz clic en **"Usuarios"**

3. Verás la lista de usuarios registrados y el botón **"Nuevo Usuario"**

---

## ➕ CREAR NUEVO USUARIO

### Paso 1: Abrir el Formulario

Haz clic en el botón **"Nuevo Usuario"** (esquina superior derecha)

### Paso 2: Completar Información Personal

- **Nombre** (requerido)
- **Apellido** (opcional)
- **Cédula** (formato: 000-000000-0000X)

### Paso 3: Configurar Credenciales

- **Email Institucional** (requerido): Debe ser del dominio `@graccnn.gob.ni`
- **Contraseña Temporal** (requerido): El usuario deberá cambiarla en su primer inicio de sesión

💡 **Tip**: Puedes hacer clic en el ícono del ojo para ver/ocultar la contraseña mientras la escribes

### Paso 4: Seleccionar Rol y Permisos

Esta es la parte más importante. Al seleccionar un rol, el sistema te mostrará automáticamente:

- ✅ **Módulos autorizados** para ese rol
- 📋 **Descripción** de las responsabilidades
- 🔐 **Nivel de acceso** que tendrá el usuario

---

## 🔐 ROLES DISPONIBLES PARA ASIGNAR

### 1. Auxiliar Contable
**Descripción**: Registro de asientos contables y operaciones básicas

**Módulos Autorizados**:
- ✅ Contabilidad
- ✅ Reportes
- ✅ Dashboard

**Uso Recomendado**: Personal que registra transacciones diarias

---

### 2. Responsable de Caja
**Descripción**: Gestión de movimientos de caja y emisión de cheques

**Módulos Autorizados**:
- ✅ Caja
- ✅ Contabilidad
- ✅ Reportes
- ✅ Dashboard

**Uso Recomendado**: Cajero institucional

---

### 3. Responsable de Crédito (Caja Chica)
**Descripción**: Administración de cajas chicas y fondos rotatorios

**Módulos Autorizados**:
- ✅ Caja Chica
- ✅ Contabilidad
- ✅ Reportes
- ✅ Dashboard

**Uso Recomendado**: Encargado de fondos rotatorios

---

### 4. Responsable de Presupuesto
**Descripción**: Gestión y seguimiento de ejecución presupuestaria

**Módulos Autorizados**:
- ✅ Presupuesto
- ✅ Caja
- ✅ Caja Chica
- ✅ Contabilidad
- ✅ Reportes
- ✅ Dashboard

**Uso Recomendado**: Analista de presupuesto de la DAF

---

### 5. Auditor Interno
**Descripción**: Revisión y auditoría de operaciones financieras

**Módulos Autorizados**:
- ✅ Auditoría
- ✅ Contabilidad
- ✅ Presupuesto
- ✅ Caja
- ✅ Reportes
- ✅ Dashboard

**Uso Recomendado**: Personal de auditoría interna

---

### 6. Recursos Humanos
**Descripción**: Gestión de personal y nómina

**Módulos Autorizados**:
- ✅ RRHH
- ✅ Usuarios
- ✅ Dashboard

**Uso Recomendado**: Personal del departamento de RRHH

---

### 7. Responsable de Bodega
**Descripción**: Control de inventario y activos fijos

**Módulos Autorizados**:
- ✅ Inventario
- ✅ Dashboard

**Uso Recomendado**: Encargado de almacén y activos

---

## 📋 EJEMPLO PRÁCTICO

### Caso: Registrar un Auxiliar Contable

1. **Información Personal**:
   - Nombre: `María`
   - Apellido: `González`
   - Cédula: `001-150689-0001K`

2. **Credenciales**:
   - Email: `maria.gonzalez@graccnn.gob.ni`
   - Contraseña: `maria2026` (temporal)

3. **Rol y Cargo**:
   - Rol: `Auxiliar Contable`
   - Cargo: `Auxiliar Contable` (se completa automáticamente)
   - Departamento: `Dirección Administrativa Financiera - Contabilidad`

4. **Verificar Permisos**:
   - El sistema mostrará que tendrá acceso a: Contabilidad, Reportes, Dashboard

5. **Crear Usuario**:
   - Haz clic en "Crear Usuario"
   - Recibirás confirmación de éxito
   - El usuario aparecerá en la lista

---

## ✅ VERIFICACIÓN POST-CREACIÓN

Después de crear un usuario, verifica que:

1. ✅ Aparece en la lista de usuarios registrados
2. ✅ El rol asignado es correcto
3. ✅ El estado es "Activo" (badge verde)
4. ✅ El email es correcto

---

## 🔒 SEGURIDAD Y BUENAS PRÁCTICAS

### Contraseñas Temporales

- Usa contraseñas seguras pero fáciles de comunicar
- Formato recomendado: `nombre + año` (ej: `maria2026`)
- **IMPORTANTE**: Instruye al usuario a cambiarla en su primer inicio de sesión

### Emails Institucionales

- Siempre usa el dominio `@graccnn.gob.ni`
- Formato recomendado: `nombre.apellido@graccnn.gob.ni`
- Verifica que no exista antes de crear

### Asignación de Roles

- ✅ Asigna el rol con **menor privilegio** necesario
- ✅ Revisa los módulos autorizados antes de confirmar
- ❌ No asignes roles de auditor o RRHH sin autorización superior

---

## 📊 VISTA DE USUARIOS REGISTRADOS

La lista de usuarios te muestra:

- **Avatar** con iniciales
- **Nombre completo**
- **Email institucional**
- **Rol asignado** (badge)
- **Cargo** (si fue especificado)
- **Estado** (Activo/Inactivo)

---

## ⚠️ LIMITACIONES Y RESTRICCIONES

### No Puedes Crear:

- ❌ **Admin** (solo el administrador del sistema)
- ❌ **Contador General** (tu propio rol)
- ❌ **Coordinador de Gobierno** (requiere autorización superior)
- ❌ **Directores** (requiere autorización superior)

### Puedes Crear:

- ✅ Auxiliares Contables
- ✅ Responsables de Caja
- ✅ Responsables de Caja Chica
- ✅ Responsables de Presupuesto
- ✅ Auditores
- ✅ Personal de RRHH
- ✅ Responsables de Bodega

---

## 🔍 AUDITORÍA

Todas las acciones de creación de usuarios quedan registradas en el sistema de auditoría, incluyendo:

- Quién creó el usuario
- Cuándo se creó
- Qué rol se asignó
- Datos completos del nuevo usuario

---

## 💡 CONSEJOS PRÁCTICOS

1. **Antes de crear**, verifica que el usuario no exista ya en el sistema

2. **Comunica las credenciales** de forma segura (preferiblemente en persona)

3. **Documenta** en tu registro interno quién tiene acceso a qué módulos

4. **Revisa periódicamente** la lista de usuarios activos

5. **Coordina con RRHH** para usuarios que ya no laboran en la institución

---

## 📞 SOPORTE

Si tienes dudas o necesitas crear usuarios con roles especiales (Coordinador, Directores), contacta al:

- **Administrador del Sistema**
- **Dirección Administrativa Financiera**

---

## ✅ CHECKLIST DE CREACIÓN DE USUARIO

Antes de crear un usuario, verifica:

- [ ] Tengo autorización para crear este usuario
- [ ] El rol seleccionado es el apropiado
- [ ] El email institucional es correcto
- [ ] La contraseña temporal es segura
- [ ] He revisado los permisos que tendrá
- [ ] He documentado la creación

---

**Última Actualización**: 23 de enero de 2026  
**Versión**: 1.0

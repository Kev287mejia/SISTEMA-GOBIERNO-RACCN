# 🎯 MÓDULO COMPLETO DE GESTIÓN DE USUARIOS

**Actualizado**: 23 de enero de 2026, 19:36  
**Usuario**: Contador General - Julio Lopez Escobar

---

## ✨ NUEVAS FUNCIONALIDADES IMPLEMENTADAS

El módulo de gestión de usuarios ahora incluye **funcionalidades completas** de administración:

### 1. ➕ Crear Usuarios
- Registro de nuevos usuarios con selección de rol
- Vista previa de permisos por rol
- Validación de emails únicos
- Contraseñas temporales seguras

### 2. ✏️ Editar Usuarios
- Modificar información personal
- Cambiar rol y permisos
- Actualizar cargo y departamento
- Vista previa de nuevos permisos

### 3. 🔐 Resetear Contraseñas
- Generar nuevas contraseñas temporales
- Comunicar credenciales de forma segura
- Registro en auditoría

### 4. ⚡ Activar/Desactivar Usuarios
- Suspender acceso temporalmente
- Reactivar usuarios suspendidos
- Sin eliminar datos del sistema

---

## 📋 MENÚ DE ACCIONES POR USUARIO

Cada usuario en la lista tiene un **menú de 3 puntos** (⋮) con las siguientes opciones:

### ✏️ Editar Usuario
**Permite modificar**:
- Nombre y apellido
- Cédula
- Rol del sistema
- Cargo institucional
- Departamento

**Proceso**:
1. Click en "Editar Usuario"
2. Se abre diálogo con datos actuales
3. Modificar campos necesarios
4. Ver permisos actualizados si cambió el rol
5. Click en "Guardar Cambios"

**Restricciones**:
- ❌ No puedes editar tu propio usuario
- ❌ No puedes cambiar el email (identificador único)

---

### 🔑 Resetear Contraseña
**Permite generar nueva contraseña temporal**

**Proceso**:
1. Click en "Resetear Contraseña"
2. Ingresar nueva contraseña temporal
3. Usar botón de ojo para ver/ocultar
4. Click en "Actualizar Contraseña"
5. Comunicar nueva contraseña al usuario

**Recomendaciones**:
- Usa formato: `nombre + año` (ej: `maria2026`)
- Comunica la contraseña de forma segura
- Instruye al usuario a cambiarla en su primer inicio

**Seguridad**:
- ✅ Contraseña hasheada con bcrypt (12 rounds)
- ✅ Registro en auditoría (sin guardar la contraseña)
- ✅ Solo Admin y ContadorGeneral pueden resetear

---

### ⚡ Activar/Desactivar Usuario
**Permite suspender o reactivar acceso**

**Desactivar Usuario**:
- El usuario **NO podrá** iniciar sesión
- Los datos se **mantienen** en el sistema
- Aparece con badge rojo "Inactivo"
- Útil para: Vacaciones, suspensiones temporales, usuarios que ya no laboran

**Activar Usuario**:
- Restaura el acceso al sistema
- El usuario puede iniciar sesión nuevamente
- Aparece con badge verde "Activo"

**Proceso**:
1. Click en "Desactivar Usuario" o "Activar Usuario"
2. Confirmar la acción en el diálogo
3. El estado cambia inmediatamente

**Restricciones**:
- ❌ No puedes desactivar tu propio usuario
- ✅ Puedes reactivar usuarios previamente desactivados

---

## 🎨 INTERFAZ VISUAL

### Lista de Usuarios

Cada tarjeta de usuario muestra:

```
┌─────────────────────────────────────────────────────────┐
│  [JL]  Julio Lopez Escobar                    ⋮         │
│        julio.lopez@graccnn.gob.ni                       │
│                                                          │
│        ContadorGeneral        ✅ Activo                 │
│        Contador General                                 │
└─────────────────────────────────────────────────────────┘
```

**Elementos**:
- **Avatar** con iniciales (círculo gris)
- **Nombre completo** en negrita
- **Email** en gris
- **Badge de rol** (borde, fuente monospace)
- **Cargo** en texto pequeño
- **Badge de estado** (verde "Activo" o rojo "Inactivo")
- **Menú de acciones** (3 puntos verticales)

---

## 🔒 SEGURIDAD Y AUDITORÍA

### Registro de Auditoría

**Todas las acciones quedan registradas**:

| Acción | Registro en Auditoría |
|--------|----------------------|
| Crear usuario | ✅ Usuario, timestamp, datos del nuevo usuario |
| Editar usuario | ✅ Usuario, timestamp, datos anteriores y nuevos |
| Resetear contraseña | ✅ Usuario, timestamp (sin guardar contraseña) |
| Activar/Desactivar | ✅ Usuario, timestamp, estado anterior y nuevo |

### Permisos Requeridos

**Solo pueden gestionar usuarios**:
- ✅ Admin (acceso completo)
- ✅ ContadorGeneral (acceso completo excepto Admin)
- ✅ RRHH (solo ver usuarios)
- ✅ DirectoraRRHH (solo ver usuarios)

---

## 📊 CASOS DE USO PRÁCTICOS

### Caso 1: Empleado de Vacaciones

**Situación**: María González sale de vacaciones por 2 semanas

**Acción**:
1. Buscar a María en la lista
2. Click en menú (⋮) → "Desactivar Usuario"
3. Confirmar

**Resultado**: María no puede iniciar sesión durante sus vacaciones

**Al Regresar**:
1. Click en menú (⋮) → "Activar Usuario"
2. Confirmar

---

### Caso 2: Cambio de Puesto

**Situación**: Pedro Martínez pasa de Auxiliar Contable a Responsable de Caja

**Acción**:
1. Buscar a Pedro en la lista
2. Click en menú (⋮) → "Editar Usuario"
3. Cambiar rol de "AuxiliarContable" a "ResponsableCaja"
4. Actualizar cargo a "Responsable de Caja"
5. Ver que ahora tiene acceso a módulo de Caja
6. Guardar cambios

**Resultado**: Pedro ahora tiene permisos de Responsable de Caja

---

### Caso 3: Contraseña Olvidada

**Situación**: Ana Rodríguez olvidó su contraseña

**Acción**:
1. Buscar a Ana en la lista
2. Click en menú (⋮) → "Resetear Contraseña"
3. Ingresar nueva contraseña: `ana2026`
4. Actualizar
5. Comunicar a Ana su nueva contraseña

**Resultado**: Ana puede iniciar sesión con la nueva contraseña temporal

---

### Caso 4: Empleado que Renuncia

**Situación**: Luis Torres renuncia a la institución

**Acción**:
1. Buscar a Luis en la lista
2. Click en menú (⋮) → "Desactivar Usuario"
3. Confirmar

**Resultado**: 
- Luis no puede acceder al sistema
- Sus datos históricos se mantienen para auditoría
- Aparece como "Inactivo" en la lista

---

## ⚠️ RESTRICCIONES IMPORTANTES

### No Puedes:

❌ **Editar tu propio usuario**
- Razón: Prevenir auto-elevación de privilegios
- Solución: Pide a otro administrador que lo haga

❌ **Desactivar tu propio usuario**
- Razón: Evitar bloqueo accidental
- Solución: Otro administrador debe hacerlo

❌ **Cambiar el email de un usuario**
- Razón: El email es el identificador único
- Solución: Crear nuevo usuario si es necesario

❌ **Eliminar usuarios permanentemente**
- Razón: Mantener trazabilidad y auditoría
- Solución: Desactivar en lugar de eliminar

---

## 🎯 CHECKLIST DE GESTIÓN DE USUARIOS

### Al Crear Usuario:
- [ ] Verificar que el email no exista
- [ ] Seleccionar el rol apropiado
- [ ] Revisar permisos autorizados
- [ ] Usar contraseña temporal segura
- [ ] Documentar la creación
- [ ] Comunicar credenciales de forma segura

### Al Editar Usuario:
- [ ] Confirmar que el cambio es necesario
- [ ] Verificar nuevos permisos si cambió el rol
- [ ] Notificar al usuario del cambio
- [ ] Documentar la modificación

### Al Resetear Contraseña:
- [ ] Verificar identidad del solicitante
- [ ] Generar contraseña temporal segura
- [ ] Comunicar de forma segura
- [ ] Instruir cambio en primer inicio

### Al Desactivar Usuario:
- [ ] Confirmar autorización
- [ ] Verificar que no sea tu propio usuario
- [ ] Documentar motivo de desactivación
- [ ] Notificar a RRHH si aplica

---

## 📈 ESTADÍSTICAS Y MONITOREO

### Vista General

En el header del módulo verás:
```
Usuarios Registrados
X usuarios activos en el sistema
```

### Filtros Futuros (Próxima Versión)

- Filtrar por rol
- Filtrar por estado (Activo/Inactivo)
- Buscar por nombre o email
- Ordenar por fecha de creación

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "No puedes editar tu propio usuario"

**Causa**: Estás intentando editar tu cuenta  
**Solución**: Pide a otro ContadorGeneral o Admin que lo haga

---

### Problema: "El email ya está registrado"

**Causa**: Ya existe un usuario con ese email  
**Solución**: 
1. Busca el usuario existente en la lista
2. Si está inactivo, actívalo
3. Si es un error, usa otro email

---

### Problema: Usuario desactivado accidentalmente

**Causa**: Click accidental en desactivar  
**Solución**:
1. Buscar al usuario en la lista
2. Click en menú → "Activar Usuario"
3. Confirmar

---

## 📞 SOPORTE

Para dudas o problemas con la gestión de usuarios:

- **Administrador del Sistema**
- **Dirección Administrativa Financiera**
- **Departamento de TI**

---

## ✅ RESUMEN DE FUNCIONALIDADES

| Funcionalidad | Descripción | Restricciones |
|---------------|-------------|---------------|
| **Crear** | Registrar nuevos usuarios con rol | Email único requerido |
| **Editar** | Modificar datos y permisos | No editar propio usuario |
| **Resetear Contraseña** | Nueva contraseña temporal | Comunicar de forma segura |
| **Activar/Desactivar** | Suspender o restaurar acceso | No desactivar propio usuario |
| **Ver Lista** | Consultar todos los usuarios | Solo roles autorizados |
| **Auditoría** | Todas las acciones registradas | Automático |

---

**Última Actualización**: 23 de enero de 2026, 19:36  
**Versión**: 2.0 (Funcionalidades Completas)

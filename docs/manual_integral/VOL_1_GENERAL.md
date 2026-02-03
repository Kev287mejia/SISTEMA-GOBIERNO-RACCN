# MANUAL INTEGRAL DEL SISTEMA GRACCNN - VOLUMEN I
## VISIÓN GENERAL, ACCESO Y GOBERNANZA

**Versión del Documento:** 1.0  
**Fecha de Auditoría:** 02 de Febrero, 2026  
**Auditor:** Antigravity AI - Senior Systems Auditor  
**Clasificación:** DOCUMENTACIÓN FORMAL / USO INTERNO

---

## 1. INTRODUCCIÓN Y ALCANCE

El Sistema de Gestión Gubernamental (GRACCNN) es una plataforma integral diseñada para la administración eficiente de recursos financieros y administrativos de instituciones públicas. Desarrollado bajo estándares modernos de web (Next.js 14), el sistema busca centralizar la información contable, presupuestaria y de tesorería en una única fuente de verdad.

### 1.1 Estado Actual del Sistema (Febrero 2026)
El sistema se encuentra en una etapa de **Madurez Operativa (87%)**. Los módulos críticos (Contabilidad, Tesorería, Presupuesto) están plenamente funcionales y listos para operación productiva. Existen módulos periféricos (RRHH, Inventario) en estados funcionales básicos, y módulos proyectados (Activos Fijos) pendientes de desarrollo.

**Nivel de Confianza:** ALTO para operaciones financieras core.

---

## 2. ACCESO Y SEGURIDAD

### 2.1 Arquitectura de Seguridad
El sistema implementa un modelo de seguridad robusto basado en capas:
1.  **Transporte:** Todo el tráfico debe ser segurizado vía HTTPS (TLS 1.2+).
2.  **Autenticación:** Gestión de sesiones vía `NextAuth.js` con encriptación de cookies.
3.  **Autorización:** Control de Acceso Basado en Roles (RBAC) estricto.
4.  **Trazabilidad:** Registro inmutable de auditoría (`AuditLog`) para acciones críticas.

### 2.2 Gestión de Identidad (Login)
El acceso al sistema es estrictamente mediante credenciales nominativas.
- **URL de Acceso:** `http://localhost:3000` (En entorno local/desarrollo).
- **Mecanismo:** Correo electrónico institucional y contraseña encriptada.

>**Nota de Auditoría:** Actualmente no se cuenta con Segundo Factor de Autenticación (2FA), lo cual representa una observación de seguridad media que debe ser mitigada con políticas de contraseñas fuertes.

---

## 3. GOBERNANZA DE USUARIOS Y ROLES (RBAC)

El sistema define jerarquías claras de acceso. A la fecha, se tienen configurados y probados los siguientes perfiles:

### 3.1 Nivel Estratégico
-   **Admin:**  
    *Privilegios:* Totales (Superusuario).  
    *Alcance:* Configuración global, gestión de usuarios, acceso irrestricto a todos los módulos.
    *Riesgo:* Crítico. Debe limitarse a máximo 2 personas.

-   **Auditor:**  
    *Privilegios:* Solo Lectura (Read-Only) profunda.  
    *Alcance:* Visualización de todos los módulos, reportes y logs de auditoría. No puede crear ni modificar registros.

### 3.2 Nivel Financiero (Core)
-   **Contador General:**  
    *Privilegios:* Gestión contable completa.  
    *Alcance:* Asientos, cierres, estados financieros, validación de cheques.
    
-   **Responsable de Presupuesto:**  
    *Privilegios:* Gestión presupuestaria.  
    *Alcance:* Creación de partidas, aprobación de ejecuciones, transferencias.

-   **Responsable de Caja / Tesorería:**  
    *Privilegios:* Gestión de flujo de efectivo.  
    *Alcance:* Emisión de cheques, gestión de cuentas bancarias, custodia de documentos.

### 3.3 Nivel Administrativo
-   **RRHH:** Gestión de expedientes de personal y nómina básica.
-   **Bodega:** Gestión de entradas y salidas de inventario.

---

## 4. INTERFAZ Y EXPERIENCIA DE USUARIO (UX)

El sistema utiliza una interfaz moderna y responsiva.

### 4.1 Navegación
-   **Barra Lateral (Sidebar):** Menú principal colapsable. Acceso directo a módulos según el rol del usuario.
-   **Barra Superior:** Información del usuario, notificaciones y cierre de sesión.
-   **Área de Trabajo:** Contenido dinámico con "Breadcrumbs" para facilitar la ubicación.

### 4.2 Estándares Visuales
-   **Modo Oscuro:** Implementado nativamente para reducir fatiga visual.
-   **Indicadores de Estado:** Uso consistente de colores (Verde=Aprobado, Ámbar=Pendiente, Rojo=Rechazado/Error).
-   **Feedback:** Notificaciones "Toast" (mensajes emergentes) para confirmar acciones (Guardado exitoso, Error de red).

---

## 5. AUDITORÍA DEL SISTEMA

El sistema cuenta con un módulo dedicado de Auditoría (`/auditoria`) accesible para Administradores y Auditores.

### 5.1 Capacidades de Rastreo
Se registra automáticamente:
-   **Quién:** ID y nombre del usuario.
-   **Qué:** Acción realizada (Crear, Editar, Eliminar, Login, Aprobar).
-   **Dónde:** Módulo y entidad afectada (ej. "Cheque #1234").
-   **Cuándo:** Fecha y hora exacta del servidor.
-   **Datos:** Snapshot de los datos antes y después del cambio (en ediciones).

### 5.2 Limitaciones Actuales
-   La auditoría de "lectura" (quién vio qué) no está implementada por razones de rendimiento. Solo se auditan acciones de modificación o exportación.

---

**Fin del Volumen I**

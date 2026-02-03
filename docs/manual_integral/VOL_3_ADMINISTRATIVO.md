# MANUAL INTEGRAL DEL SISTEMA GRACCNN - VOLUMEN III
## GESTIÓN ADMINISTRATIVA (RRHH E INVENTARIO)

**Versión del Documento:** 1.0  
**Fecha de Auditoría:** 02 de Febrero, 2026  
**Auditor:** Antigravity AI - Senior Systems Auditor

---

## 1. MÓDULO DE RECURSOS HUMANOS (RRHH)

Este módulo gestiona el capital humano de la institución. Actualmente se encuentra en una fase funcional básica orientada al registro y control.

### 1.1 Gestión de Empleados
-   **Expediente Digital:** Ficha completa del colaborador.
-   **Datos Personales:** Nombre, Cédula, Dirección, Contacto.
-   **Datos Laborales:**
    -   *Cargo:* Vinculado al catálogo de cargos.
    -   *Contrato:* Definición de tipo (Indeterminado, Determinado), Salario, Fecha de Inicio.
    -   *Estado:* Activo, Vacaciones, Suspendido, Baja.
-   **Campos de Ley (Nicaragua):**
    -   Número INSS.
    -   RUC (para servicios profesionales).

### 1.2 Planilla (Nómina)
-   **Funcionalidad Actual:** Generación de planilla base.
-   **Cálculos:**
    -   Salario Bruto.
    -   Deducciones (Manuales/Configurables).
    -   Salario Neto.
-   **Limitaciones:** El cálculo automático complejo de IR (Impuesto sobre la Renta) y deducciones variables de INSS patronal/laboral está en desarrollo. Actualmente requiere supervisión/ajuste manual.

### 1.3 Asistencia y Permisos
-   Registro de incidencias (ausencias, llegadas tardías).
-   Control de vacaciones (saldo de días).

---

## 2. MÓDULO DE INVENTARIO Y BODEGA

Control de bienes de consumo y activos corrientes de la institución.

### 2.1 Catálogo de Artículos
-   **Definición:** Código SKU, Nombre, Descripción, Unidad de Medida.
-   **Categorización:** Agrupación por familia (Limpieza, Papelería, Repuestos, etc.).
-   **Control de Stock:** Configuración de máximos y mínimos para alertas de reabastecimiento.

### 2.2 Movimientos de Inventario (Kardex)
El sistema utiliza el método de valoración **Promedio Ponderado** (Configurable a PEPS/FIFO).

-   **Entradas:**
    -   Compras (Vinculado a Facturas/Proveedores).
    -   Devoluciones internas.
    -   Ajustes de inventario (Sobrantes).
-   **Salidas:**
    -   Despacho a departamentos (Consumo interno).
    -   Bajas (Deterioro, vencimiento).
    -   Ajustes de inventario (Faltantes).

### 2.3 Proveedores
-   Gestión de base de datos de proveedores.
-   Historial de compras (Básico).

---

## 3. ESTADO DE DESARROLLO ADMINISTRATIVO

### 3.1 Lo que SI hace el sistema hoy:
-   Mantiene un registro centralizado de todo el personal y su estatus.
-   Permite generar la nómina mensual y exportarla para pago.
-   Controla existencias en bodega en tiempo real.
-   Genera alertas básicas de stock bajo.

### 3.2 Lo que AÚN NO hace (Próximas Fases):
-   Autoservicio del empleado (Portal para solicitar vacaciones/ver colillas).
-   Evaluación del desempeño 360°.
-   Integración automática con sistemas biométricos de asistencia.
-   Valorización fiscal compleja del inventario (automatizada 100%).
-   Gestión de depreciación de Activos Fijos (Vehículos, Edificios).

---

**Fin del Volumen III**

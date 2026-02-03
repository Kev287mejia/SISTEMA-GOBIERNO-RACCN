# MANUAL INTEGRAL DEL SISTEMA GRACCNN - VOLUMEN II
## GESTIÓN FINANCIERA (CONTABILIDAD, PRESUPUESTO Y TESORERÍA)

**Versión del Documento:** 1.0  
**Fecha de Auditoría:** 02 de Febrero, 2026  
**Auditor:** Antigravity AI - Senior Systems Auditor

---

## 1. MÓDULO DE CONTABILIDAD

El cerebro financiero del sistema. Centraliza toda la información transaccional para la generación de estados financieros.

### 1.1 Catálogo de Cuentas
-   **Estructura:** Jerárquica multinivel.
-   **Operación:** Permite crear, editar y desactivar cuentas.
-   **Validación:** No permite eliminar cuentas con saldo o movimientos asociados.

### 1.2 Gestión de Asientos Contables
-   **Registro:** Manual o Automático (desde otros módulos).
-   **Estados del Asiento:**
    1.  *Borrador:* En edición, no afecta saldos.
    2.  *Pendiente:* Listo para revisión.
    3.  *Aprobado:* Mayorizado, afecta estados financieros. Bloqueado para edición simple.
    4.  *Anulado:* Reverso contable.
-   **Evidencia:** Permite adjuntar documentos digitales (PDF/Img) a cada asiento.

### 1.3 Cierre Contable
-   **Funcionalidad:** Cierre mensual para bloquear modificaciones en periodos finalizados.
-   **Proceso:** El Contador General ejecuta el cierre, lo que congela los asientos del mes seleccionado.

---

## 2. MÓDULO DE PRESUPUESTO

Control preventivo del gasto público.

### 2.1 Estructura Presupuestaria
-   **Partidas:** Definición de códigos presupuestarios, nombres y montos asignados.
-   **Centros de Costo:** Asignación de presupuesto por áreas funcionales.

### 2.2 Ejecución del Gasto
-   **Control de Disponibilidad:** El sistema **bloquea** intentos de gasto si no existe saldo disponible en la partida (Configuración por defecto, anulable por Admin).
-   **Fases del Gasto:**
    1.  *Comprometido:* Reserva de saldo (ej. Orden de Compra).
    2.  *Devengado:* Reconocimiento de la obligación (ej. Factura recibida).
    3.  *Pagado:* Salida de efectivo (ej. Cheque entregado).

### 2.3 Reportes
-   **Ejecución Presupuestaria:** Comparativo de Asignado vs. Ejecutado vs. Disponible en tiempo real.

---

## 3. MÓDULO DE TESORERÍA (CAJA Y BANCOS)

Módulo crítico para la gestión de liquidez y cumplimiento de obligaciones. Implementa controles estrictos de flujo.

### 3.1 Gestión de Cuentas Bancarias
-   **Funcionalidad:** Administración de las 6 cuentas institucionales.
-   **Estados:**
    -   *Activa:* Operativa para emitir cheques/pagos.
    -   *Inactiva:* Solo consulta histórica.
-   **Documentación Legal (NUEVO - Feb 2026):**
    -   Sistema de expediente digital **POR CUENTA**.
    -   Requiere adjuntar 3 documentos obligatorios por cuenta:
        1.  Comprobante de Pago (Genérico/Modelo).
        2.  Recibo de Pago (Modelo).
        3.  Solicitud de Emisión de Cheques (Modelo).
    -   Ubicación: `Contabilidad > Bancos > Detalle de Cuenta`.

### 3.2 Emisión y Control de Cheques
El sistema maneja un flujo de estado riguroso para la emisión de cheques:

**Flujo de Aprobación:**
1.  **Solicitud (Caja):** Se crea la solicitud del cheque. Se adjuntan documentos soporte (Facturas, Cartas).
2.  **Aprobación Presupuestaria:** Validación de disponibilidad de fondos en la partida.
3.  **Auditoría Pre-Pago (Contabilidad):** Revisión de documentos y validez fiscal.
4.  **Emisión (Tesorería):** Generación física/sistema del cheque.
5.  **Pago:** Entrega al beneficiario.
6.  **Contabilización:** Registro automático en contabilidad.

**Nota Técnica:** El sistema permite adjuntar evidencia digital específica para cada cheque individualmente, además de la documentación base de la cuenta bancaria.

### 3.3 Conciliación Bancaria
-   **Método:** Manual / Asistido.
-   **Proceso:**
    1.  Carga de movimientos del sistema.
    2.  Cotejo checkbox contra extracto bancario físico.
    3.  Generación de "Acta de Conciliación".
-   **Saldos:** El sistema calcula y muestra:
    -   Saldo en Libros.
    -   Saldo en Bancos (Conciliado).
    -   Flotante (Cheques emitidos no cobrados).

### 3.4 Caja Chica
-   **Fondos:** Creación de fondos fijos (revolving funds).
-   **Vales:** Registro de gastos menores.
-   **Reembolso:** Proceso de liquidación de vales para reposición de fondo mediante cheque principal.
-   **Arqueo:** Herramienta para recuento físico de efectivo vs sistema.

---

**Fin del Volumen II**

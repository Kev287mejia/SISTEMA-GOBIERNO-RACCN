# 📋 Sistema de Adjuntos de Documentos - POR CUENTA BANCARIA

## ✅ Implementación Completada (ACTUALIZADA)

### **Decisión Arquitectónica Corregida: DOCUMENTOS POR CUENTA BANCARIA**

Los 3 documentos requeridos se montaron **POR CADA CUENTA BANCARIA**, no por cheque individual.

---

## 📄 Documentos Soportados (Por Cuenta)

Cada una de las **6 cuentas bancarias** puede tener hasta **3 documentos**:

1. **Comprobante de Pago**
2. **Recibo de Pago**
3. **Solicitud de Emisión de Cheques**

---

## 🏦 Ubicación en el Sistema

### **Módulo:** Contabilidad → Bancos
### **Rutas:**
- **Lista de cuentas:** `/contabilidad/bancos`
- **Detalle de cuenta:** `/contabilidad/bancos/[id]`

---

## 🔄 Flujo de Trabajo

```
1. Usuario accede a Contabilidad → Bancos
   ↓
2. Selecciona una cuenta bancaria específica
   ↓
3. En la página de detalle, encuentra sección "Documentos de la Cuenta Bancaria"
   ↓
4. Adjunta los 3 documentos requeridos
   ↓
5. Click en "Guardar Documentos"
   ↓
6. Documentos quedan vinculados permanentemente a esa cuenta
```

---

## 🛠️ Cambios Técnicos Realizados

### 1. **Base de Datos - Schema Prisma**
**Archivo:** `prisma/schema.prisma`

- ✅ Agregado campo `evidenceUrls String[] @default([])` al modelo `BankAccount`
- ✅ Migración creada: `20260203030308_add_evidence_urls_to_bank_accounts`
- ✅ Cliente Prisma regenerado

### 2. **Frontend - Componente de Documentos**
**Archivo:** `components/bank/bank-account-documents.tsx` (NUEVO)

- ✅ Componente dedicado para gestión de documentos
- ✅ Integración con `FileUploader`
- ✅ Límite de 3 archivos por cuenta
- ✅ Botón de guardado con feedback visual
- ✅ Detección automática de cambios

### 3. **Frontend - Página de Detalle de Cuenta**
**Archivo:** `app/contabilidad/bancos/[id]/page.tsx`

- ✅ Importado componente `BankAccountDocuments`
- ✅ Integrado en la página después de las estadísticas
- ✅ Pasa `accountId` y `evidenceUrls` iniciales

### 4. **Frontend - Lista de Cuentas**
**Archivo:** `app/contabilidad/bancos/page.tsx`

- ✅ Indicador visual de documentos adjuntos
- ✅ Badge mostrando cantidad de documentos
- ✅ Formato: "📎 X documento(s)"

### 5. **Backend - API de Cuentas Bancarias**
**Archivo:** `app/api/accounting/bank-accounts/[id]/route.ts`

- ✅ Endpoint PATCH actualizado para recibir `evidenceUrls`
- ✅ Validación de permisos mantenida
- ✅ Auditoría automática de cambios
- ✅ Respuesta con cuenta actualizada

### 6. **Modelo Check (Mantenido)**
**Archivo:** `prisma/schema.prisma` + `components/caja/check-form.tsx`

- ✅ Campo `evidenceUrls` también agregado al modelo `Check`
- ✅ Funcionalidad de documentos por cheque mantenida
- ✅ Migración: `20260203030022_add_evidence_urls_to_checks`

---

## 🎨 Experiencia de Usuario

### **En la Lista de Cuentas Bancarias:**
- Cada cuenta muestra un badge si tiene documentos adjuntos
- Ejemplo: "📎 3 documentos"
- Click en la cuenta para ver detalles

### **En la Página de Detalle:**
- Sección dedicada "Documentos de la Cuenta Bancaria"
- Descripción clara de los 3 documentos requeridos
- FileUploader con drag & drop
- Preview de archivos adjuntos
- Botón "Guardar Documentos" aparece solo si hay cambios
- Toast de confirmación al guardar

---

## 📊 Arquitectura de Datos

```
BankAccount (Modelo Prisma)
├── id: String
├── bankName: String
├── accountNumber: String
├── evidenceUrls: String[] ← NUEVO CAMPO
└── ... otros campos

Ejemplo de evidenceUrls:
[
  "/uploads/comprobante-banpro-2024.pdf",
  "/uploads/recibo-pago-lafise.pdf",
  "/uploads/solicitud-cheques-bac.pdf"
]
```

---

## 🔐 Seguridad y Validación

- ✅ Archivos se suben a través del endpoint `/api/upload`
- ✅ Validación de tipos de archivo (PDF, imágenes)
- ✅ Límite de 3 archivos por cuenta
- ✅ URLs almacenadas en array en PostgreSQL
- ✅ Control de acceso por roles (Admin, ResponsableContabilidad, DirectoraDAF, ContadorGeneral)
- ✅ Auditoría completa de cambios en `AuditLog`

---

## 📈 Ventajas de esta Implementación

1. **Organización por Cuenta**: Documentos vinculados directamente a cada cuenta bancaria
2. **Trazabilidad Completa**: Historial de auditoría de todos los cambios
3. **Acceso Centralizado**: Todos los documentos de una cuenta en un solo lugar
4. **Escalabilidad**: Fácil aumentar límite de documentos si es necesario
5. **Cumplimiento Normativo**: Evidencia digital permanente por cuenta
6. **Doble Sistema**: Documentos tanto por cuenta como por cheque individual

---

## 🚀 Estado del Sistema

### **Migraciones Aplicadas:**
1. `20260203030022_add_evidence_urls_to_checks` ✅
2. `20260203030308_add_evidence_urls_to_bank_accounts` ✅

### **Servidor:**
- ✅ Corriendo en `http://localhost:3000`
- ✅ Socket.IO inicializado
- ✅ Cliente Prisma regenerado

---

## 📝 Cómo Usar el Sistema

### **Para Adjuntar Documentos a una Cuenta:**

1. Ir a **Contabilidad** → **Bancos**
2. Click en cualquiera de las 6 cuentas bancarias
3. Scroll hasta la sección "Documentos de la Cuenta Bancaria"
4. Click en "Adjuntar Evidencia" o arrastrar archivos
5. Seleccionar los 3 documentos (PDF, JPG, PNG)
6. Click en "Guardar Documentos"
7. ✅ Confirmación: "Documentos guardados correctamente"

### **Para Ver Documentos:**
- En la lista de cuentas: Ver badge "📎 X documentos"
- En detalle de cuenta: Ver preview de cada documento
- Click en cualquier documento para abrirlo en nueva pestaña

---

## 🔄 Diferencia con Implementación Anterior

### **ANTES (Incorrecto):**
- Documentos adjuntos a cada **cheque individual**
- Ubicación: Módulo de Caja → Formulario de cheques

### **AHORA (Correcto):**
- Documentos adjuntos a cada **cuenta bancaria**
- Ubicación: Módulo de Contabilidad → Bancos → Detalle de cuenta
- **NOTA:** Ambas funcionalidades coexisten

---

## ✨ Resultado Final

El sistema ahora permite:
1. ✅ Adjuntar 3 documentos a cada una de las 6 cuentas bancarias
2. ✅ Ver indicador visual de documentos en la lista
3. ✅ Gestionar documentos desde la página de detalle
4. ✅ Auditoría completa de cambios
5. ✅ Acceso rápido a documentos con un click

**Ambos sistemas funcionan en paralelo:**
- Documentos por **cuenta bancaria** (Contabilidad → Bancos)
- Documentos por **cheque** (Caja → Cheques y Bancos)

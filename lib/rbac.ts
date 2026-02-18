import { Role } from "@prisma/client"

// Define which roles can access which routes
export const routePermissions: Record<string, Role[]> = {
  "/dashboard": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Presupuesto,
    Role.Bodega,
    Role.RRHH,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
    Role.DirectoraRRHH,
    Role.ResponsableContabilidad,
  ],
  "/caja": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.AuxiliarContable,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
  ],
  "/caja/tesoreria": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
  ],
  "/caja-chica": [
    Role.Admin,
    Role.ResponsableCredito,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
  ],
  "/api/caja-chica": [
    Role.Admin,
    Role.ResponsableCredito,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
  ],
  "/api/caja": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.CoordinadorGobierno,
  ],
  "/tesoreria": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.DirectoraDAF,
    Role.ResponsableContabilidad,
    Role.CoordinadorGobierno,
    Role.Auditor,
  ],
  "/api/tesoreria": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.DirectoraDAF,
    Role.ResponsableContabilidad,
    Role.CoordinadorGobierno,
    Role.Auditor,
  ],
  "/contabilidad": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
  ],
  "/contabilidad/bancos": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.Auditor,
  ],
  "/contabilidad/reportes": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.AuxiliarContable,
  ],
  "/contabilidad/cierres": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.Auditor,
  ],
  "/contabilidad/bancos/": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.Auditor,
  ],
  "/facturas": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Auditor,
    Role.ResponsableContabilidad,
  ],
  "/presupuesto": [
    Role.Admin,
    Role.Presupuesto,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
  ],
  "/inventario": [
    Role.Admin,
    Role.Bodega,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsableContabilidad,
  ],
  "/reportes": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Presupuesto,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
    Role.ResponsablePresupuesto,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
  ],
  "/compras": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.Presupuesto,
    Role.CoordinadorGobierno,
    Role.Auditor,
  ],
  "/entidades": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsableContabilidad,
  ],
  "/api/entities": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsableContabilidad,
  ],
  "/usuarios": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
  ],
  "/api/users": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
  ],
  "/rrhh": [
    Role.Admin,
    Role.RRHH,
    Role.DirectoraRRHH,
    Role.CoordinadorGobierno,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
  ],
  "/auditoria": [
    Role.Admin,
    Role.Auditor,
    Role.ContadorGeneral,
    Role.CoordinadorGobierno,
    Role.ResponsableContabilidad,
  ],
  "/configuracion": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
  ],
  "/api/accounting/bank-accounts": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.ResponsableCaja,
    Role.ResponsablePresupuesto,
  ],
  "/api/budget": [
    Role.Admin,
    Role.Presupuesto,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
  ],
  "/api/reports": [
    Role.Admin,
    Role.Presupuesto,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
  ],
  "/api/dashboard": [
    Role.Admin,
    Role.Presupuesto,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.CoordinadorGobierno,
    Role.DirectoraRRHH,
  ],
  "/api/notifications": [
    // All authenticated users can access their own notifications
    Role.Admin,
    Role.Presupuesto,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.ResponsableCaja,
    Role.DirectoraRRHH,
    Role.RRHH,
    Role.ResponsableCredito,
  ],
  "/api/audit": [
    Role.Admin,
    Role.Auditor,
    Role.ContadorGeneral,
    Role.CoordinadorGobierno,
    Role.ResponsableContabilidad,
  ],
  "/documentacion": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsableContabilidad,
  ],
  "/api/settings": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.CoordinadorGobierno,
  ],
  "/api/accounting-entries": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
    Role.ResponsablePresupuesto,
    Role.ResponsableCaja,
    Role.ResponsableContabilidad,
  ],
  "/api/upload": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.AuxiliarContable,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.DirectoraDAF,
    Role.ResponsableCaja,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
  ],
  "/api/accounting/analytics": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.Auditor,
    Role.CoordinadorGobierno,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad
  ],
  "/api/accounting/closures": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.Auditor,
  ],
  "/api/accounting/reports/comparative": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.AuxiliarContable,
  ],
  "/api/accounting/reports/budget-execution": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.AuxiliarContable,
  ],
  "/api/accounting/reconciliation": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.Auditor,
  ],
  "/api/inventory/items": [
    Role.Admin,
    Role.Bodega,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad
  ],
  "/api/inventory/transactions": [
    Role.Admin,
    Role.Bodega,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad
  ],
  "/api/inventory/sku-generator": [
    Role.Admin,
    Role.Bodega,
    Role.ContadorGeneral,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad
  ],
  "/api/accounting/checks": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.ResponsableCaja,
    Role.Auditor,
  ],
}

export function hasPermission(role: Role, pathname: string, deniedModules: string[] = []): boolean {
  // Check denied modules first
  // The logic is simple: if the pathname starts with a denied module path, deny.
  // We need to map module names to paths
  const modulePaths: Record<string, string> = {
    "Contabilidad": "/contabilidad",
    "Caja": "/caja",
    "Caja Chica": "/caja-chica",
    "Presupuesto": "/presupuesto",
    "Inventario": "/inventario",
    "RRHH": "/rrhh",
    "Auditoría": "/auditoria",
    "Reportes": "/reportes",
    "Usuarios": "/usuarios",
    "Configuración": "/configuracion"
  }

  for (const moduleName of deniedModules) {
    const deniedPath = modulePaths[moduleName]
    if (deniedPath && (pathname === deniedPath || pathname.startsWith(deniedPath + "/"))) {
      return false
    }
  }

  // Admin has access to everything (unless specifically denied, though unlikely for admin)
  if (role === Role.Admin) {
    return true
  }

  // Check if the pathname matches any route
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return allowedRoles.includes(role)
    }
  }

  // Default: deny access if route not found in permissions
  return false
}

export function getRoleDisplayName(role: Role): string {
  const roleNames: Record<Role, string> = {
    [Role.Admin]: "Administrador",
    [Role.ContadorGeneral]: "Contador General",
    [Role.AuxiliarContable]: "Auxiliar Contable",
    [Role.Presupuesto]: "Presupuesto",
    [Role.Bodega]: "Bodega",
    [Role.RRHH]: "Recursos Humanos",
    [Role.Auditor]: "Auditor",
    [Role.CoordinadorGobierno]: "Coordinador del Gobierno Regional",
    [Role.DirectoraDAF]: "Directora División Administrativa Financiera",
    [Role.DirectoraRRHH]: "Directora de Recursos Humanos",
    [Role.ResponsableCaja]: "Responsable de Caja",
    [Role.ResponsableCredito]: "Responsable de Crédito (Caja Chica)",
    [Role.ResponsablePresupuesto]: "Responsable de Presupuesto",
    [Role.ResponsableContabilidad]: "Responsable de Contabilidad",
  }
  return roleNames[role] || role
}

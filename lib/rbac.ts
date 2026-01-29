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
    Role.ResponsableCaja,
    Role.ResponsableCredito,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
  ],
  "/caja": [
    Role.Admin,
    Role.ResponsableCaja,
    Role.ContadorGeneral,
    Role.Auditor,
    Role.ResponsablePresupuesto,
    Role.ResponsableContabilidad,
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
  "/contabilidad": [
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
  "/contabilidad/bancos": [
    Role.Admin,
    Role.ContadorGeneral,
    Role.ResponsableContabilidad,
    Role.DirectoraDAF,
    Role.CoordinadorGobierno,
    Role.Auditor,
    Role.ResponsableCaja,
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
    Role.ResponsableContabilidad,
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
    Role.ResponsableCaja,
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
    Role.ResponsableCaja,
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
    Role.ResponsablePresupuesto,
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
    Role.ResponsableContabilidad
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

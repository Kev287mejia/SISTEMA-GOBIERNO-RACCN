import { hasPermission, routePermissions } from "../lib/rbac"
import { Role } from "@prisma/client"

console.log("--- DEBUGGING RBAC LOGIC ---")

const role = Role.ResponsableContabilidad
const path = "/api/accounting/bank-accounts"

console.log(`Testing Role: ${role}`)
console.log(`Testing Path: ${path}`)

const result = hasPermission(role, path)
console.log(`hasPermission Result: ${result}`)

// Debug the loop
console.log("\n--- Trace Loop ---")
for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    const match = path === route || path.startsWith(route + "/")
    if (match) {
        console.log(`Matched Route Key: ${route}`)
        console.log(`Allowed Roles: ${allowedRoles}`)
        console.log(`User Authorized? ${allowedRoles.includes(role)}`)
    }
}

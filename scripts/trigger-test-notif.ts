import { prisma } from "../lib/prisma"
import { Role, NotificationType } from "@prisma/client"
import { createNotification } from "../lib/notifications"

async function main() {
  console.log("🚀 Emitiendo notificación de prueba real-time...")
  
  // Buscar un usuario administrador para enviarle la prueba
  const admin = await prisma.user.findFirst({
    where: { role: Role.Admin }
  })

  if (!admin) {
    console.error("❌ No se encontró un usuario administrador")
    return
  }

  await createNotification({
    userId: admin.id,
    type: NotificationType.SUCCESS,
    title: "SISTEMA ACTIVO",
    message: "Las notificaciones en tiempo real han sido configuradas exitosamente.",
    link: "/dashboard"
  })

  console.log("✅ Notificación enviada exitosamente")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

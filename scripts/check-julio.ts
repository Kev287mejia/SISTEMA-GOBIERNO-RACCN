import { prisma } from "../lib/prisma"

async function checkUser() {
    console.log("🔍 Verificando usuario Julio López...")
    console.log("=".repeat(60))

    const user = await prisma.user.findUnique({
        where: { email: "julio.lopez@graccnn.gob.ni" }
    })

    if (!user) {
        console.log("❌ Usuario NO encontrado")
        return
    }

    console.log("✅ Usuario encontrado:")
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.nombre} ${user.apellido || ""}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Activo: ${user.activo ? "✅ SÍ" : "❌ NO"}`)
    console.log(`   2FA Habilitado: ${user.twoFactorEnabled ? "✅ SÍ" : "❌ NO"}`)
    console.log(`   Intentos fallidos: ${user.failedLoginAttempts}`)
    console.log(`   Bloqueado hasta: ${user.lockedUntil || "No bloqueado"}`)
    console.log(`   Último login: ${user.lastLoginAt || "Nunca"}`)
    console.log(`   Módulos denegados: ${user.deniedModules.length > 0 ? user.deniedModules.join(", ") : "Ninguno"}`)

    console.log("\n" + "=".repeat(60))
    console.log("🔐 Verificando contraseña...")

    const bcrypt = require("bcryptjs")
    const isValid = await bcrypt.compare("julio123", user.password)

    console.log(`   Contraseña "julio123": ${isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`)

    if (!isValid) {
        console.log("\n⚠️  La contraseña NO coincide. Actualizando...")
        const hashedPassword = await bcrypt.hash("julio123", 10)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                failedLoginAttempts: 0,
                lockedUntil: null
            }
        })
        console.log("✅ Contraseña actualizada correctamente")
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ Verificación completa")
    console.log("\n📝 Credenciales para login:")
    console.log(`   Email: julio.lopez@graccnn.gob.ni`)
    console.log(`   Contraseña: julio123`)
}

checkUser()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error)
        process.exit(1)
    })


import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: true,
})

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    console.log("Enviando correo de recuperación a:", email)
    console.log("Link de recuperación:", resetLink)

    try {
        await transporter.verify()
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Restablecer contraseña - SISTEMA GOBIERNO",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablecimiento de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña para el Sistema de Gobierno.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
        </div>
      `,
        })
        console.log("Correo enviado exitosamente")
    } catch (error) {
        console.error("Error enviando correo:", error)
        // No lanzar error para no bloquear el flujo en frontend, pero loguearlo
        // En dev mode, el usuario verá el link en consola gracias al log anterior
    }
}

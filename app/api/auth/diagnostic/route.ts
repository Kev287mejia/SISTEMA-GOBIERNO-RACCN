import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()
        const normalizedEmail = email.trim().toLowerCase()

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })

        if (!user) {
            return NextResponse.json({
                success: false,
                reason: "User not found in DB",
                searchedEmail: normalizedEmail
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        return NextResponse.json({
            success: isMatch,
            reason: isMatch ? "Match found" : "Password mismatch",
            userDetails: {
                id: user.id,
                email: user.email,
                activo: user.activo,
                role: user.role
            },
            hashLength: user.password.length
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message })
    }
}

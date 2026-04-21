import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const settings = await prisma.systemSetting.findMany({
            orderBy: [{ group: 'asc' }, { label: 'asc' }]
        })

        // Initial seed if empty
        if (settings.length === 0 && session?.user?.role === Role.Admin) {
            const initialSettings = [
                // INSTITUCION
                { key: 'inst_name', value: 'Gobierno Regional Autónomo de la Costa Caribe Norte (GRACCNN)', label: 'Nombre Institucional', group: 'Institucion', type: 'string' },
                { key: 'inst_ruc', value: 'J0110000000000', label: 'RUC / NIT', group: 'Institucion', type: 'string' },
                { key: 'inst_address', value: 'Puerto Cabezas, Bilwi, Nicaragua', label: 'Dirección Sede', group: 'Institucion', type: 'string' },
                { key: 'inst_legal_rep', value: 'Coordinador de Gobierno Regional', label: 'Representante Legal', group: 'Institucion', type: 'string' },

                // IDENTIDAD
                { key: 'viz_primary_color', value: '#1e40af', label: 'Color Primario del Sistema', group: 'Identidad', type: 'string' },
                { key: 'viz_logo_url', value: '/logo.png', label: 'URL del Escudo Institucional', group: 'Identidad', type: 'string' },
                { key: 'viz_report_header', value: 'true', label: 'Mostrar Encabezado en Reportes', group: 'Identidad', type: 'boolean' },

                // RRHH
                { key: 'hr_ss_percent', value: '6.25', label: '% Seguro Social (Empleado)', group: 'RRHH', type: 'number' },
                { key: 'hr_patronal_percent', value: '19.0', label: '% Seguro Social (Patronal)', group: 'RRHH', type: 'number' },
                { key: 'hr_working_hours', value: '8', label: 'Horas Laborales por Día', group: 'RRHH', type: 'number' },

                // CONTABILIDAD
                { key: 'acc_fiscal_year', value: '2026', label: 'Año Fiscal Corriente', group: 'Contabilidad', type: 'number' },
                { key: 'acc_currency', value: 'NIO', label: 'Moneda Local', group: 'Contabilidad', type: 'string' },
                { key: 'acc_vat_rate', value: '15', label: 'Tasa Impuesto (IVA)', group: 'Contabilidad', type: 'number' },

                // SEGURIDAD
                { key: 'sec_audit_level', value: 'ADVANCED', label: 'Nivel de Trazabilidad de Auditoría', group: 'Seguridad', type: 'string' },
                { key: 'sec_session_timeout', value: '30', label: 'Tiempo de Sesión (Minutos)', group: 'Seguridad', type: 'number' },
                { key: 'sec_2fa_required', value: 'false', label: 'Requerir Multi-factor para Administrativos', group: 'Seguridad', type: 'boolean' },
                { key: 'gen_notifications', value: 'true', label: 'Alertas de Seguridad Vía Email', group: 'Seguridad', type: 'boolean' },

                // GENERAL
                { key: 'gen_backup_freq', value: 'Diaria', label: 'Frecuencia de Respaldo en Nube', group: 'General', type: 'string' },
                { key: 'gen_maintenance_mode', value: 'false', label: 'Modo Mantenimiento', group: 'General', type: 'boolean' },
            ]

            await prisma.systemSetting.createMany({
                data: initialSettings
            })

            return NextResponse.json(await prisma.systemSetting.findMany({
                orderBy: [{ group: 'asc' }, { label: 'asc' }]
            }))
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("[SETTINGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const allowedRoles = [
            'Admin',
            'ContadorGeneral',
            'ResponsableContabilidad',
            'CoordinadorGobierno'
        ]

        console.log('[SETTINGS_POST] User role:', session?.user?.role)
        console.log('[SETTINGS_POST] User role type:', typeof session?.user?.role)
        console.log('[SETTINGS_POST] Allowed roles:', allowedRoles)
        console.log('[SETTINGS_POST] Is allowed?:', allowedRoles.includes(session?.user?.role as string))

        if (!allowedRoles.includes(session?.user?.role as string)) {
            console.log('[SETTINGS_POST] FORBIDDEN - Role not allowed')
            return new NextResponse("Forbidden", { status: 403 })
        }

        console.log('[SETTINGS_POST] Role check passed!')

        const body = await req.json()
        const { key, value, label, group, type } = body

        if (!key) {
            return new NextResponse("Key is required", { status: 400 })
        }

        // Handle string representation for Booleans from Switch
        const finalValue = typeof value === 'boolean' ? String(value) : String(value)

        // Default values for new keys if not provided
        const finalLabel = label || key
        const finalGroup = group || 'General'
        const finalType = type || 'string'

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: finalValue },
            create: {
                key,
                value: finalValue,
                label: finalLabel,
                group: finalGroup,
                type: finalType
            }
        })

        return NextResponse.json(setting)
    } catch (error) {
        console.error("[SETTINGS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

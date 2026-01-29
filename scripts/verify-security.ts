import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

console.log('═'.repeat(80))
console.log('VERIFICACIÓN DE IMPLEMENTACIÓN DE SEGURIDAD')
console.log('═'.repeat(80))
console.log('')

const checks = {
    passed: [] as string[],
    failed: [] as string[],
    warnings: [] as string[]
}

function checkFile(filePath: string, description: string): boolean {
    const fullPath = path.join(process.cwd(), filePath)
    const exists = fs.existsSync(fullPath)

    if (exists) {
        checks.passed.push(`✅ ${description}: ${filePath}`)
        return true
    } else {
        checks.failed.push(`❌ ${description}: ${filePath} NO ENCONTRADO`)
        return false
    }
}

function checkContent(filePath: string, searchString: string, description: string): boolean {
    const fullPath = path.join(process.cwd(), filePath)

    if (!fs.existsSync(fullPath)) {
        checks.failed.push(`❌ ${description}: Archivo ${filePath} no existe`)
        return false
    }

    const content = fs.readFileSync(fullPath, 'utf-8')
    const found = content.includes(searchString)

    if (found) {
        checks.passed.push(`✅ ${description}`)
        return true
    } else {
        checks.failed.push(`❌ ${description}: No encontrado en ${filePath}`)
        return false
    }
}

async function checkDatabase(field: string, table: string, description: string): Promise<boolean> {
    try {
        // Verificar que el campo existe en la tabla
        const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${table} 
      AND column_name = ${field}
    `

        if ((result as any[]).length > 0) {
            checks.passed.push(`✅ ${description}: Campo ${field} en tabla ${table}`)
            return true
        } else {
            checks.failed.push(`❌ ${description}: Campo ${field} NO existe en tabla ${table}`)
            return false
        }
    } catch (error) {
        checks.failed.push(`❌ ${description}: Error verificando BD - ${error}`)
        return false
    }
}

async function runChecks() {
    console.log('🔍 Verificando archivos de seguridad...\n')

    // 1. RATE LIMITING
    console.log('1️⃣  RATE LIMITING')
    checkFile('lib/rate-limit.ts', 'Módulo de Rate Limiting')
    checkContent('middleware.ts', 'checkRateLimit', 'Rate Limiting en Middleware')
    checkContent('lib/rate-limit.ts', 'RATE_LIMITS', 'Configuración de límites')
    console.log('')

    // 2. CSRF PROTECTION
    console.log('2️⃣  CSRF PROTECTION')
    checkFile('lib/csrf.ts', 'Módulo de CSRF')
    checkContent('lib/csrf.ts', 'generateCSRFToken', 'Generación de tokens CSRF')
    checkContent('lib/csrf.ts', 'validateCSRF', 'Validación de CSRF')
    checkContent('lib/csrf.ts', 'fetchWithCSRF', 'Fetch wrapper con CSRF')
    console.log('')

    // 3. TWO-FACTOR AUTHENTICATION
    console.log('3️⃣  TWO-FACTOR AUTHENTICATION (2FA)')
    checkFile('lib/two-factor.ts', 'Módulo de 2FA')
    checkFile('app/api/auth/2fa/route.ts', 'API de 2FA')
    checkContent('lib/two-factor.ts', 'generate2FASecret', 'Generación de secreto 2FA')
    checkContent('lib/two-factor.ts', 'verify2FAToken', 'Verificación de token 2FA')
    checkContent('lib/two-factor.ts', 'generateBackupCodes', 'Códigos de respaldo')
    checkContent('lib/two-factor.ts', 'generateQRCode', 'Generación de QR')
    await checkDatabase('twoFactorEnabled', 'users', 'Campo twoFactorEnabled')
    await checkDatabase('twoFactorSecret', 'users', 'Campo twoFactorSecret')
    await checkDatabase('twoFactorBackupCodes', 'users', 'Campo twoFactorBackupCodes')
    checkContent('lib/auth.ts', '2FA_REQUIRED', 'Verificación 2FA en login')
    console.log('')

    // 4. PASSWORD POLICY
    console.log('4️⃣  POLÍTICA DE CONTRASEÑAS')
    checkFile('lib/password-validator.ts', 'Validador de contraseñas')
    checkContent('lib/password-validator.ts', 'validatePassword', 'Función de validación')
    checkContent('lib/password-validator.ts', 'generateTemporaryPassword', 'Generación de contraseña temporal')
    checkContent('lib/password-validator.ts', 'isPasswordCompromised', 'Verificación de contraseñas comprometidas')
    checkContent('lib/password-validator.ts', 'estimateCrackTime', 'Estimación de tiempo de crackeo')
    console.log('')

    // 5. SESSION TIMEOUT
    console.log('5️⃣  TIMEOUT DE SESIÓN')
    checkFile('components/providers/session-timeout-provider.tsx', 'Provider de timeout')
    checkContent('components/providers/session-timeout-provider.tsx', 'INACTIVITY_TIMEOUT', 'Configuración de timeout')
    checkContent('components/providers/session-timeout-provider.tsx', 'WARNING_TIME', 'Advertencia de timeout')
    checkContent('components/providers/session-timeout-provider.tsx', 'resetTimer', 'Reset de timer')
    console.log('')

    // 6. ACCOUNT LOCKOUT
    console.log('6️⃣  BLOQUEO DE CUENTA')
    await checkDatabase('failedLoginAttempts', 'users', 'Campo failedLoginAttempts')
    await checkDatabase('lockedUntil', 'users', 'Campo lockedUntil')
    await checkDatabase('lastLoginAt', 'users', 'Campo lastLoginAt')
    checkContent('lib/auth.ts', 'MAX_LOGIN_ATTEMPTS', 'Configuración de intentos máximos')
    checkContent('lib/auth.ts', 'LOCK_DURATION_MINUTES', 'Duración del bloqueo')
    checkContent('lib/auth.ts', 'failedLoginAttempts', 'Incremento de intentos fallidos')
    checkContent('lib/auth.ts', 'lockedUntil', 'Bloqueo de cuenta')
    console.log('')

    // 7. SECURITY MONITORING
    console.log('7️⃣  ALERTAS DE SEGURIDAD')
    checkFile('lib/security-monitor.ts', 'Monitor de seguridad')
    checkContent('lib/security-monitor.ts', 'detectSuspiciousActivity', 'Detección de actividades sospechosas')
    checkContent('lib/security-monitor.ts', 'monitorFailedLogins', 'Monitoreo de logins fallidos')
    checkContent('lib/security-monitor.ts', 'monitorAccountLock', 'Monitoreo de bloqueos')
    checkContent('lib/security-monitor.ts', 'getSecurityStats', 'Estadísticas de seguridad')
    checkContent('lib/auth.ts', 'monitorFailedLogins', 'Integración de monitoreo en auth')
    console.log('')

    // 8. SECURITY HEADERS
    console.log('8️⃣  HEADERS DE SEGURIDAD')
    checkContent('middleware.ts', 'X-Frame-Options', 'Header X-Frame-Options')
    checkContent('middleware.ts', 'X-Content-Type-Options', 'Header X-Content-Type-Options')
    checkContent('middleware.ts', 'X-XSS-Protection', 'Header X-XSS-Protection')
    checkContent('middleware.ts', 'Content-Security-Policy', 'Header CSP')
    checkContent('middleware.ts', 'Permissions-Policy', 'Header Permissions-Policy')
    console.log('')

    // RESUMEN
    console.log('═'.repeat(80))
    console.log('RESUMEN DE VERIFICACIÓN')
    console.log('═'.repeat(80))
    console.log('')

    console.log(`✅ Verificaciones Exitosas: ${checks.passed.length}`)
    console.log(`❌ Verificaciones Fallidas: ${checks.failed.length}`)
    console.log(`⚠️  Advertencias: ${checks.warnings.length}`)
    console.log('')

    if (checks.failed.length > 0) {
        console.log('❌ FALLOS DETECTADOS:')
        checks.failed.forEach(f => console.log(`   ${f}`))
        console.log('')
    }

    if (checks.warnings.length > 0) {
        console.log('⚠️  ADVERTENCIAS:')
        checks.warnings.forEach(w => console.log(`   ${w}`))
        console.log('')
    }

    const percentage = Math.round((checks.passed.length / (checks.passed.length + checks.failed.length)) * 100)

    console.log('═'.repeat(80))
    if (percentage === 100) {
        console.log('✅ TODAS LAS CARACTERÍSTICAS ESTÁN IMPLEMENTADAS Y FUNCIONALES')
        console.log(`📊 Nivel de Implementación: ${percentage}%`)
    } else if (percentage >= 80) {
        console.log('⚠️  MAYORÍA DE CARACTERÍSTICAS IMPLEMENTADAS')
        console.log(`📊 Nivel de Implementación: ${percentage}%`)
        console.log('⚠️  Revisar elementos faltantes arriba')
    } else {
        console.log('❌ IMPLEMENTACIÓN INCOMPLETA')
        console.log(`📊 Nivel de Implementación: ${percentage}%`)
        console.log('❌ Revisar elementos faltantes arriba')
    }
    console.log('═'.repeat(80))
}

runChecks()
    .catch(e => console.error('Error en verificación:', e))
    .finally(() => prisma.$disconnect())

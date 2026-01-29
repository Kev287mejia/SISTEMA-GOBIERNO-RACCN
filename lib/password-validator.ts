/**
 * Validador de contraseñas seguras para sistema gubernamental
 */

export interface PasswordValidationResult {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = []
    let strength: 'weak' | 'medium' | 'strong' = 'weak'

    // Longitud mínima
    if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres')
    }

    // Longitud máxima
    if (password.length > 128) {
        errors.push('La contraseña no puede exceder 128 caracteres')
    }

    // Debe contener al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener al menos una letra mayúscula')
    }

    // Debe contener al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
        errors.push('Debe contener al menos una letra minúscula')
    }

    // Debe contener al menos un número
    if (!/[0-9]/.test(password)) {
        errors.push('Debe contener al menos un número')
    }

    // Debe contener al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Debe contener al menos un carácter especial (!@#$%^&*...)')
    }

    // Verificar contraseñas comunes
    const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'password1', '123456789', '111111', '1234567890', 'admin',
        'admin123', 'root', 'toor', 'pass', 'test', 'guest', 'info',
        'adm', 'mysql', 'user', 'administrator', 'oracle', 'ftp',
        'pi', 'puppet', 'ansible', 'ec2-user', 'vagrant', 'azureuser'
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Esta contraseña es demasiado común. Elija una más segura')
    }

    // Verificar patrones secuenciales
    if (/(.)\1{2,}/.test(password)) {
        errors.push('No use caracteres repetidos consecutivamente')
    }

    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
        errors.push('No use secuencias alfabéticas')
    }

    if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
        errors.push('No use secuencias numéricas')
    }

    // Calcular fortaleza
    if (errors.length === 0) {
        let score = 0

        // Longitud
        if (password.length >= 12) score += 2
        else if (password.length >= 10) score += 1

        // Complejidad
        if (/[A-Z]/.test(password)) score += 1
        if (/[a-z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1

        // Variedad de caracteres
        const uniqueChars = new Set(password).size
        if (uniqueChars >= password.length * 0.7) score += 1

        if (score >= 6) strength = 'strong'
        else if (score >= 4) strength = 'medium'
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength
    }
}

/**
 * Genera una contraseña temporal segura
 */
export function generateTemporaryPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Sin I, O para evitar confusión
    const lowercase = 'abcdefghijkmnopqrstuvwxyz' // Sin l para evitar confusión
    const numbers = '23456789' // Sin 0, 1 para evitar confusión
    const special = '!@#$%^&*'

    let password = ''

    // Asegurar al menos uno de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Rellenar el resto
    const allChars = uppercase + lowercase + numbers + special
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Mezclar caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Verifica si la contraseña ha sido comprometida (lista básica)
 */
export function isPasswordCompromised(password: string): boolean {
    // En producción, usar API como HaveIBeenPwned
    const compromisedPasswords = [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
        'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
        'bailey', 'passw0rd', 'shadow', '123123', '654321'
    ]

    return compromisedPasswords.includes(password.toLowerCase())
}

/**
 * Calcula el tiempo estimado para crackear la contraseña
 */
export function estimateCrackTime(password: string): string {
    const charsetSize =
        (/[a-z]/.test(password) ? 26 : 0) +
        (/[A-Z]/.test(password) ? 26 : 0) +
        (/[0-9]/.test(password) ? 10 : 0) +
        (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 32 : 0)

    const combinations = Math.pow(charsetSize, password.length)

    // Asumiendo 1 billón de intentos por segundo
    const secondsToCrack = combinations / 1_000_000_000_000

    if (secondsToCrack < 1) return 'Menos de 1 segundo'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} segundos`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutos`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} horas`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} días`
    if (secondsToCrack < 3153600000) return `${Math.round(secondsToCrack / 31536000)} años`

    return 'Más de 100 años'
}

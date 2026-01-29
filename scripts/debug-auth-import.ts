try {
    console.log('Cargando authOptions...')
    const { authOptions } = require('../lib/auth')
    console.log('authOptions cargado correctamente')

    console.log('Cargando two-factor...')
    const twoFactor = require('../lib/two-factor')
    console.log('two-factor cargado:', Object.keys(twoFactor))

    console.log('Cargando security-monitor...')
    const securityMonitor = require('../lib/security-monitor')
    console.log('security-monitor cargado')

} catch (error) {
    console.error('ERROR AL CARGAR MÓDULOS DE AUTENTICACIÓN:', error)
}

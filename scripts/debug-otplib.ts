try {
    console.log('Probando require otplib...')
    const otplib = require('otplib')
    console.log('otplib keys:', Object.keys(otplib))

    const { authenticator } = require('otplib')
    console.log('authenticator:', authenticator)

    if (!authenticator) {
        console.error('CRITICAL: authenticator is undefined')
    } else {
        console.log('check:', typeof authenticator.check)
        console.log('verify:', typeof authenticator.verify)
    }

} catch (error) {
    console.error('ERROR:', error)
}

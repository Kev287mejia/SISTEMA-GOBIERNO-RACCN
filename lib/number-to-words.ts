export function numberToSpanishWords(n: number): string {
    const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const specials = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const hundreds = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    if (n === 0) return 'CERO';

    const formatHundreds = (num: number) => {
        if (num === 100) return 'CIEN';
        if (num > 100 && num < 200) return 'CIENTO ' + formatTens(num % 100);
        return hundreds[Math.floor(num / 100)] + (num % 100 > 0 ? ' ' + formatTens(num % 100) : '');
    };

    const formatTens = (num: number) => {
        if (num < 10) return units[num];
        if (num < 20) return specials[num - 10];
        if (num % 10 === 0) return tens[Math.floor(num / 10)];
        if (num > 20 && num < 30) return 'VEINTI' + units[num % 10];
        return tens[Math.floor(num / 10)] + ' Y ' + units[num % 10];
    };

    const process = (num: number): string => {
        if (num < 100) return formatTens(num);
        if (num < 1000) return formatHundreds(num);
        if (num < 1000000) {
            const thousands = Math.floor(num / 1000);
            const rest = num % 1000;
            let result = '';
            if (thousands === 1) result = 'MIL';
            else result = process(thousands) + ' MIL';
            if (rest > 0) result += ' ' + process(rest);
            return result;
        }
        if (num < 1000000000) {
            const millions = Math.floor(num / 1000000);
            const rest = num % 1000000;
            let result = '';
            if (millions === 1) result = 'UN MILLON';
            else result = process(millions) + ' MILLONES';
            if (rest > 0) result += ' ' + process(rest);
            return result;
        }
        return 'NÚMERO DEMASIADO GRANDE';
    };

    const integerPart = Math.floor(n);
    const decimalPart = Math.round((n - integerPart) * 100);
    const centsStr = decimalPart.toString().padStart(2, '0') + '/100';

    return `${process(integerPart)} CORDOBAS CON ${centsStr} CENTAVOS`.toUpperCase();
}

/**
 * Formats a Rut string to the standard Chilean format (XX.XXX.XXX-Y)
 * @param {string} rut - The Rut string to format
 * @returns {string} - The formatted Rut
 */
export const formatRut = (rut) => {
    if (!rut) return '';

    // Remove everything that is not a number or k/K
    let value = rut.replace(/[^0-9kK]/g, '');

    // Limit to 9 characters (12.345.678-K is 12 formatted, 9 unformatted)
    if (value.length > 9) {
        value = value.slice(0, 9);
    }

    // Allow empty
    if (value.length === 0) return '';

    // Separate body and dv
    const dv = value.slice(-1);
    let body = value.slice(0, -1);

    // Format body with dots
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${body}-${dv}`;
};

/**
 * Cleans a Rut string for backend storage (XXXXXXXX-Y)
 * Removes dots but keeps the hyphen.
 * @param {string} rut - The formatted Rut
 * @returns {string} - The clean Rut
 */
export const cleanRut = (rut) => {
    if (!rut) return '';
    // Remove dots
    return rut.replace(/\./g, '');
};

/**
 * Validates a Chilean Rut
 * @param {string} rut - The Rut to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateRut = (rut) => {
    if (!rut) return false;

    // Clean formatting
    let value = rut.replace(/\./g, '').replace(/-/g, '');

    if (value.length < 2) return false;

    // Separate body and dv
    let body = value.slice(0, -1);
    let dv = value.slice(-1).toUpperCase();

    // Validate body is number
    if (!/^\d+$/.test(body)) return false;

    // Calculate expected DV
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const rest = sum % 11;
    const expectedDv = rest === 0 ? '0' : rest === 1 ? 'K' : (11 - rest).toString();

    return dv === expectedDv;
};

/**
 * Formats a Chilean phone number for display (+56 9 1234 5678)
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number
 */
export const formatPhone = (phone) => {
    if (!phone) return '';

    // Remove everything that is not a number or +
    let value = phone.replace(/[^0-9+]/g, '');

    // If starts with +56, remove it for processing
    if (value.startsWith('+56')) {
        value = value.slice(3);
    } else if (value.startsWith('56') && value.length > 9) {
        value = value.slice(2);
    }

    // Remove leading + if any remains
    value = value.replace(/\+/g, '');

    // Limit to 9 digits
    if (value.length > 9) {
        value = value.slice(0, 9);
    }

    if (value.length === 0) return '';

    // Format based on type
    if (value.startsWith('9') && value.length <= 9) {
        // Celular: +56 9 XXXX XXXX
        const part1 = value.slice(0, 1);
        const part2 = value.slice(1, 5);
        const part3 = value.slice(5, 9);
        let formatted = `+56 ${part1}`;
        if (part2) formatted += ` ${part2}`;
        if (part3) formatted += ` ${part3}`;
        return formatted;
    } else {
        // Fijo: +56 XX XXXX XXXX
        const part1 = value.slice(0, 2);
        const part2 = value.slice(2, 6);
        const part3 = value.slice(6, 9);
        let formatted = `+56 ${part1}`;
        if (part2) formatted += ` ${part2}`;
        if (part3) formatted += ` ${part3}`;
        return formatted;
    }
};

/**
 * Cleans a phone number for backend storage (+56XXXXXXXXX)
 * @param {string} phone - The formatted phone number
 * @returns {string} - The clean phone number
 */
export const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\s/g, '');
};

/**
 * Validates a Chilean phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhone = (phone) => {
    if (!phone) return false;

    // Clean formatting
    let value = phone.replace(/[^0-9]/g, '');

    // Remove country code if present
    if (value.startsWith('56') && value.length > 9) {
        value = value.slice(2);
    }

    // Must be exactly 9 digits
    if (value.length !== 9) return false;

    // Celular: starts with 9
    // Fijo Santiago: starts with 2
    // Fijo regiones: starts with 3,4,5,6,7
    const firstDigit = value.charAt(0);
    const validPrefixes = ['2', '3', '4', '5', '6', '7', '9'];

    return validPrefixes.includes(firstDigit);
};

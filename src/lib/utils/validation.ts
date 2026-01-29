/**
 * Input validation utilities
 */

/**
 * Validate IIN (Individual Identification Number) format for Kazakhstan
 * IIN should be 12 digits
 */
export function validateIIN(iin: string): boolean {
    return /^\d{12}$/.test(iin);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
    // Accept various formats: +7XXXXXXXXXX, 8XXXXXXXXXX, or without prefix
    const phoneRegex = /^(\+7|8)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input.trim().replace(/<[^>]*>/g, '');
}

/**
 * Validate numeric range
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

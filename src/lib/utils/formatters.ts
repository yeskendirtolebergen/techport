/**
 * Data formatting utilities
 */

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Get full name from first and last name
 */
export function getFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
}

/**
 * Format phone number to standard format
 */
export function formatPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +7 (XXX) XXX-XX-XX
    if (cleaned.startsWith('7')) {
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    } else if (cleaned.startsWith('8')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }

    return phone;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'green';
        case 'in_progress':
            return 'blue';
        case 'rejected':
            return 'red';
        case 'not_started':
        default:
            return 'gray';
    }
}

/**
 * Format status text for display
 */
export function formatStatus(status: string): string {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

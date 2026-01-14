// Frontend Input Validation Functions
// Mirrors backend validation logic for immediate user feedback

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} - {valid: boolean, message: string}
 */
export function validateEmail(email) {
    if (!email || email.trim() === '') {
        return { valid: false, message: 'Email is required' };
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    if (email.length > 254) {
        return { valid: false, message: 'Email is too long (max 254 characters)' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate password strength
 * Must be at least 8 characters with uppercase, lowercase, and number
 * @param {string} password - Password to validate
 * @returns {Object} - {valid: boolean, message: string}
 */
export function validatePassword(password) {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate amount (for receipts)
 * @param {string|number} amount - Amount to validate
 * @returns {Object} - {valid: boolean, message: string}
 */
export function validateAmount(amount) {
    if (amount === null || amount === undefined || amount === '') {
        return { valid: false, message: 'Amount is required' };
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
        return { valid: false, message: 'Amount must be a valid number' };
    }

    if (numAmount <= 0) {
        return { valid: false, message: 'Amount must be greater than 0' };
    }

    if (numAmount > 999999999) {
        return { valid: false, message: 'Amount is too large' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {Object} - {valid: boolean, message: string}
 */
export function validateDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') {
        return { valid: false, message: 'Date is required' };
    }

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(dateStr)) {
        return { valid: false, message: 'Date must be in YYYY-MM-DD format' };
    }

    // Check if it's a valid date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return { valid: false, message: 'Invalid date' };
    }

    return { valid: true, message: '' };
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return '';

    // Remove HTML tags and script content
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
}

/**
 * Show validation error message in UI
 * @param {HTMLElement} inputElement - Input element to show error for
 * @param {string} message - Error message to display
 */
export function showValidationError(inputElement, message) {
    // Remove existing error
    clearValidationError(inputElement);

    // Add error class
    inputElement.classList.add('input-error');

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    // Insert after input
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
}

/**
 * Clear validation error from input element
 * @param {HTMLElement} inputElement - Input element to clear error from
 */
export function clearValidationError(inputElement) {
    inputElement.classList.remove('input-error');

    const errorDiv = inputElement.parentNode.querySelector('.validation-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Clear all validation errors on the page
 */
export function clearAllValidationErrors() {
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });

    document.querySelectorAll('.validation-error').forEach(el => {
        el.remove();
    });
}

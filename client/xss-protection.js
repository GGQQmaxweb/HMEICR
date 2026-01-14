// XSS Protection Utilities
// Prevent Cross-Site Scripting attacks by safely handling user input

/**
 * Safely set text content of an element
 * Always use this instead of innerHTML for user-generated content
 * @param {HTMLElement} element - Element to update
 * @param {string} text - Text to set
 */
export function setTextSafely(element, text) {
    if (!element) return;
    // textContent automatically escapes HTML, preventing XSS
    element.textContent = String(text || '');
}

/**
 * Create a text node safely
 * @param {string} text - Text for the node
 * @returns {Text} Text node
 */
export function createTextNode(text) {
    return document.createTextNode(String(text || ''));
}

/**
 * Sanitize HTML to prevent XSS
 * Strips all HTML tags and dangerous characters
 * @param {string} input - Input string that may contain HTML
 * @returns {string} Safe text-only string
 */
export function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';

    // Remove all HTML tags
    const withoutTags = input.replace(/<[^>]*>/g, '');

    // Encode HTML special characters
    const div = document.createElement('div');
    div.textContent = withoutTags;
    return div.innerHTML;
}

/**
 * Safely append text to an element
 * @param {HTMLElement} parent - Parent element
 * @param {string} text - Text to append
 */
export function appendTextSafely(parent, text) {
    if (!parent) return;
    const textNode = createTextNode(text);
    parent.appendChild(textNode);
}

/**
 * Create an element with safe text content
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {string} className - Optional CSS class
 * @returns {HTMLElement} Created element
 */
export function createElementWithText(tag, text, className = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    setTextSafely(element, text);
    return element;
}

/**
 * Validate and sanitize currency code
 * Only allows 3 uppercase letters (ISO 4217 format)
 * @param {string} currency - Currency code to validate
 * @returns {string} Safe currency code or 'TWD' as default
 */
export function sanitizeCurrency(currency) {
    if (typeof currency !== 'string') return 'TWD';

    // Only allow A-Z, limit to 3 characters
    const cleaned = currency.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

    return cleaned || 'TWD';
}

/**
 * Validate and sanitize numeric amount
 * @param {any} amount - Amount value to validate
 * @returns {number} Safe number or 0
 */
export function sanitizeAmount(amount) {
    const num = parseFloat(amount);

    if (isNaN(num) || !isFinite(num)) return 0;
    if (num < 0) return 0;
    if (num > 999999999) return 999999999;

    return num;
}

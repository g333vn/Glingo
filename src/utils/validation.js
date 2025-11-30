// src/utils/validation.js
// Validation utilities for authentication

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateEmail(email) {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, error: string|null, strength: number (0-4) }
 */
export function validatePassword(password) {
    if (!password) {
        return { isValid: false, error: 'Password is required', strength: 0 };
    }

    // Minimum length check
    if (password.length < 8) {
        return {
            isValid: false,
            error: 'Password must be at least 8 characters',
            strength: 0
        };
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength++; // Has uppercase
    if (/[a-z]/.test(password)) strength++; // Has lowercase  
    if (/[0-9]/.test(password)) strength++; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Has special char

    // Normalize strength to 0-4 scale
    strength = Math.min(4, Math.floor(strength / 1.5));

    // Requirements for validity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[A-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase) {
        return {
            isValid: false,
            error: 'Password must contain at least one uppercase letter',
            strength
        };
    }

    if (!hasLowerCase) {
        return {
            isValid: false,
            error: 'Password must contain at least one lowercase letter',
            strength
        };
    }

    if (!hasNumber) {
        return {
            isValid: false,
            error: 'Password must contain at least one number',
            strength
        };
    }

    return {
        isValid: true,
        error: null,
        strength
    };
}

/**
 * Get password strength label
 * @param {number} strength - Strength score (0-4)
 * @returns {Object} { label: string, color: string }
 */
export function getPasswordStrengthInfo(strength) {
    const strengthMap = {
        0: { label: 'Very Weak', color: 'bg-red-500' },
        1: { label: 'Weak', color: 'bg-orange-500' },
        2: { label: 'Fair', color: 'bg-yellow-500' },
        3: { label: 'Good', color: 'bg-blue-500' },
        4: { label: 'Strong', color: 'bg-green-500' },
    };

    return strengthMap[strength] || strengthMap[0];
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

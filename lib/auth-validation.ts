/**
 * Authentication Validation Utilities
 * 
 * Provides reusable validation functions for authentication workflows
 */

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationErrors {
  [key: string]: string;
}

/**
 * Validates an email address format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates password strength
 * Returns detailed validation result with specific errors
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('One number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a name (full name, first name, etc.)
 */
export const validateName = (name: string, minChars = 2, maxChars = 50): boolean => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= minChars && trimmed.length <= maxChars;
};

/**
 * Validates a URL format
 */
export const validateUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Optional field
  
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates phone number (basic validation)
 * Accepts various formats: +1234567890, 123-456-7890, (123) 456-7890, etc.
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove common separators and check if remaining characters are digits
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const phoneRegex = /^\+?\d{10,15}$/;
  
  return phoneRegex.test(cleaned);
};

/**
 * Checks if a string is empty or whitespace only
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Sanitizes input by trimming whitespace
 */
export const sanitizeInput = (value: string): string => {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
};

/**
 * Gets password strength score (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  if (!password) return 0;
  
  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety scoring
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return Math.min(score, 4);
};

/**
 * Gets human-readable password strength label
 */
export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return '';
  }
};

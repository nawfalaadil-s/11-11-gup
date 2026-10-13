// Validation utilities

export const validateMobileNumber = (mobile) => {
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Indian mobile numbers: 10 digits starting with 6-9
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return { valid: true, normalized: cleaned };
  }
  
  // With country code +91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2);
    if (/^[6-9]/.test(number)) {
      return { valid: true, normalized: number };
    }
  }
  
  return { valid: false, normalized: null, error: 'Invalid mobile number' };
};

export const validateEmail = (email) => {
  if (!email) return { valid: true, normalized: '' }; // Email is optional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);
  
  return { 
    valid, 
    normalized: email.toLowerCase().trim(),
    error: valid ? null : 'Invalid email address'
  };
};

export const validateFullName = (name) => {
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, normalized: null, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, normalized: null, error: 'Name is too long' };
  }
  
  // Allow letters, spaces, and common name characters
  if (!/^[a-zA-Z\s.''-]+$/.test(trimmed)) {
    return { valid: false, normalized: null, error: 'Name contains invalid characters' };
  }
  
  return { valid: true, normalized: trimmed };
};

export const sanitizeInput = (input, maxLength = 500) => {
  if (!input) return '';
  return input.trim().slice(0, maxLength);
};

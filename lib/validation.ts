/**
 * Input Validation Utilities
 * Ensures all user input meets security and data requirements
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

// Residence name validation
export function validateResidenceName(name: string | null | undefined): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Residence name is required' }
  }

  const trimmed = name.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Residence name cannot be empty' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Residence name must be 100 characters or less' }
  }

  // Allow letters, numbers, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmed)) {
    return { valid: false, error: 'Residence name contains invalid characters' }
  }

  return { valid: true }
}

// Club name validation
export function validateClubName(name: string | null | undefined): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Club name is required' }
  }

  const trimmed = name.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Club name cannot be empty' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Club name must be 100 characters or less' }
  }

  if (!/^[a-zA-Z0-9\s\-'&]+$/.test(trimmed)) {
    return { valid: false, error: 'Club name contains invalid characters' }
  }

  return { valid: true }
}

// Event title validation
export function validateEventTitle(title: string | null | undefined): ValidationResult {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Event title is required' }
  }

  const trimmed = title.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Event title cannot be empty' }
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Event title must be 200 characters or less' }
  }

  if (!/^[a-zA-Z0-9\s\-'&().,!?]+$/.test(trimmed)) {
    return { valid: false, error: 'Event title contains invalid characters' }
  }

  return { valid: true }
}

// Description validation (for clubs, events, giveaways, etc.)
export function validateDescription(description: string | null | undefined, maxLength: number = 5000): ValidationResult {
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Description is required' }
  }

  const trimmed = description.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Description cannot be empty' }
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Description must be ${maxLength} characters or less` }
  }

  // Allow common characters but prevent script tags and other malicious content
  if (/<script|<iframe|javascript:|on\w+=/i.test(trimmed)) {
    return { valid: false, error: 'Description contains invalid content' }
  }

  return { valid: true }
}

// Email validation
export function validateEmail(email: string | null | undefined): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address is too long' }
  }

  return { valid: true }
}

// Phone validation
export function validatePhone(phone: string | null | undefined): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: true } // Phone is optional
  }

  const trimmed = phone.trim()

  if (trimmed.length === 0) {
    return { valid: true } // Empty is OK if optional
  }

  // Allow common phone formats: (123) 456-7890, 123-456-7890, 1234567890, etc.
  if (!/^[\d\s\-().+]+$/.test(trimmed) || trimmed.length > 20) {
    return { valid: false, error: 'Invalid phone number format' }
  }

  return { valid: true }
}

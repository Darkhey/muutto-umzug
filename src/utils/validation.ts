/**
 * Validation utilities for muutto application
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []
  
  if (!email?.trim()) {
    errors.push('E-Mail ist erforderlich')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('E-Mail-Format ist ungültig')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = []
  
  if (!name?.trim()) {
    errors.push(`${fieldName} ist erforderlich`)
  } else if (name.trim().length < 2) {
    errors.push(`${fieldName} muss mindestens 2 Zeichen haben`)
  } else if (name.trim().length > 100) {
    errors.push(`${fieldName} darf maximal 100 Zeichen haben`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validatePostalCode = (postalCode: string): ValidationResult => {
  const errors: string[] = []
  
  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    errors.push('Postleitzahl muss 5 Ziffern haben')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateDate = (date: string, fieldName: string = 'Datum'): ValidationResult => {
  const errors: string[] = []
  
  if (!date) {
    errors.push(`${fieldName} ist erforderlich`)
  } else {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      errors.push(`${fieldName} ist ungültig`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateFutureDate = (date: string, fieldName: string = 'Datum'): ValidationResult => {
  const dateValidation = validateDate(date, fieldName)
  if (!dateValidation.isValid) {
    return dateValidation
  }
  
  const errors: string[] = []
  const dateObj = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (dateObj < today) {
    errors.push(`${fieldName} muss in der Zukunft liegen`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validatePositiveNumber = (
  value: number | null | undefined, 
  fieldName: string,
  required: boolean = false
): ValidationResult => {
  const errors: string[] = []
  
  if (required && (value === null || value === undefined)) {
    errors.push(`${fieldName} ist erforderlich`)
  } else if (value !== null && value !== undefined) {
    if (isNaN(value)) {
      errors.push(`${fieldName} muss eine Zahl sein`)
    } else if (value < 0) {
      errors.push(`${fieldName} kann nicht negativ sein`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  const errors: string[] = []
  
  if (value < min) {
    errors.push(`${fieldName} muss mindestens ${min} sein`)
  } else if (value > max) {
    errors.push(`${fieldName} darf maximal ${max} sein`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}
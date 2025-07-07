/**
 * Validation utilities for muutto application
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: Record<string, string> = {}
  
  if (!email?.trim()) {
    errors.email = 'E-Mail ist erforderlich'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'E-Mail-Format ist ungültig'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: Record<string, string> = {}
  const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_')
  
  if (!name?.trim()) {
    errors[fieldKey] = `${fieldName} ist erforderlich`
  } else if (name.trim().length < 2) {
    errors[fieldKey] = `${fieldName} muss mindestens 2 Zeichen haben`
  } else if (name.trim().length > 100) {
    errors[fieldKey] = `${fieldName} darf maximal 100 Zeichen haben`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePostalCode = (postalCode: string): ValidationResult => {
  const errors: Record<string, string> = {}
  
  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    errors.postal_code = 'Postleitzahl muss 5 Ziffern haben'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateDate = (date: string, fieldName: string = 'Datum'): ValidationResult => {
  const errors: Record<string, string> = {}
  const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_')
  
  if (!date) {
    errors[fieldKey] = `${fieldName} ist erforderlich`
  } else {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      errors[fieldKey] = `${fieldName} ist ungültig`
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateFutureDate = (date: string, fieldName: string = 'Datum'): ValidationResult => {
  const dateValidation = validateDate(date, fieldName)
  if (!dateValidation.isValid) {
    return dateValidation
  }
  
  const errors: Record<string, string> = {}
  const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_')
  const dateObj = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (dateObj < today) {
    errors[fieldKey] = `${fieldName} muss in der Zukunft liegen`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePositiveNumber = (
  value: number | null | undefined, 
  fieldName: string,
  required: boolean = false
): ValidationResult => {
  const errors: Record<string, string> = {}
  const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_')
  
  if (required && (value === null || value === undefined)) {
    errors[fieldKey] = `${fieldName} ist erforderlich`
  } else if (value !== null && value !== undefined) {
    if (isNaN(value)) {
      errors[fieldKey] = `${fieldName} muss eine Zahl sein`
    } else if (value < 0) {
      errors[fieldKey] = `${fieldName} kann nicht negativ sein`
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  const errors: Record<string, string> = {}
  const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_')
  
  if (value < min) {
    errors[fieldKey] = `${fieldName} muss mindestens ${min} sein`
  } else if (value > max) {
    errors[fieldKey] = `${fieldName} darf maximal ${max} sein`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateHouseholdData = (
  data: Partial<CreateHouseholdData>,
  isDraft: boolean = false
): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Nur Pflichtfelder validieren, wenn es kein Entwurf ist oder wenn die Felder bereits vorhanden sind
  if (!isDraft || data.name !== undefined) {
    if (!data.name?.trim()) {
      errors.name = 'Haushaltsname ist erforderlich'
    } else if (data.name.trim().length < 2) {
      errors.name = 'Haushaltsname muss mindestens 2 Zeichen haben'
    }
  }
  
  if (!isDraft || data.move_date !== undefined) {
    if (!data.move_date) {
      errors.move_date = 'Umzugsdatum ist erforderlich'
    } else {
      const moveDate = new Date(data.move_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (isNaN(moveDate.getTime())) {
        errors.move_date = 'Umzugsdatum ist ungültig'
      } else if (moveDate < today && !isDraft) {
        errors.move_date = 'Umzugsdatum muss in der Zukunft liegen'
      }
    }
  }
  
  if (!isDraft || data.property_type !== undefined) {
    if (!data.property_type) {
      errors.property_type = 'Wohnform ist erforderlich'
    }
  }
  
  if (!isDraft || data.household_size !== undefined) {
    if (data.household_size === undefined || data.household_size === null) {
      errors.household_size = 'Haushaltsgröße ist erforderlich'
    } else if (data.household_size < 1) {
      errors.household_size = 'Haushaltsgröße muss mindestens 1 sein'
    }
  }
  
  // Optionale Felder nur validieren, wenn sie vorhanden sind
  if (data.children_count !== undefined && data.children_count < 0) {
    errors.children_count = 'Anzahl Kinder kann nicht negativ sein'
  }
  
  if (data.pets_count !== undefined && data.pets_count < 0) {
    errors.pets_count = 'Anzahl Haustiere kann nicht negativ sein'
  }
  
  if (data.postal_code && !/^\d{5}$/.test(data.postal_code)) {
    errors.postal_code = 'Postleitzahl muss 5 Ziffern haben'
  }
  
  if (data.living_space !== undefined && data.living_space !== null && data.living_space < 0) {
    errors.living_space = 'Wohnfläche kann nicht negativ sein'
  }
  
  if (data.rooms !== undefined && data.rooms !== null && data.rooms < 0) {
    errors.rooms = 'Anzahl Zimmer kann nicht negativ sein'
  }
  
  if (data.furniture_volume !== undefined && data.furniture_volume !== null && data.furniture_volume < 0) {
    errors.furniture_volume = 'Möbelvolumen kann nicht negativ sein'
  }
  
  // Validiere Mitglieder, falls vorhanden
  if (data.members && Array.isArray(data.members)) {
    data.members.forEach((member, index) => {
      if (member.name || member.email) {
        if (!member.name?.trim()) {
          errors[`members.${index}.name`] = 'Name ist erforderlich'
        }
        
        if (!member.email?.trim()) {
          errors[`members.${index}.email`] = 'E-Mail ist erforderlich'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
          errors[`members.${index}.email`] = 'E-Mail-Format ist ungültig'
        }
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const combinedErrors: Record<string, string> = {};
  
  results.forEach(result => {
    Object.entries(result.errors).forEach(([key, value]) => {
      combinedErrors[key] = value;
    });
  });
  
  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors
  }
}
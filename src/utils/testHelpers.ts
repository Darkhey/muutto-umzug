/**
 * Test helpers and utilities for muutto application
 */

import { CreateHouseholdData, HouseholdMember } from '@/hooks/useHouseholds'

export const createMockHouseholdData = (overrides: Partial<CreateHouseholdData> = {}): CreateHouseholdData => {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30) // 30 days from now
  
  return {
    name: 'Test Haushalt',
    move_date: futureDate.toISOString().split('T')[0],
    household_size: 2,
    children_count: 0,
    pets_count: 0,
    property_type: 'miete',
    postal_code: '12345',
    old_address: 'Alte Straße 1, 12345 Berlin',
    new_address: 'Neue Straße 2, 54321 Hamburg',
    living_space: 80,
    rooms: 3,
    furniture_volume: 25,
    ...overrides
  }
}

export const createMockMember = (overrides: Partial<HouseholdMember> = {}): HouseholdMember => {
  return {
    name: 'Max Mustermann',
    email: 'max@example.com',
    role: 'vertragsmanager',
    ...overrides
  }
}

export const createMockMembers = (count: number): HouseholdMember[] => {
  return Array.from({ length: count }, (_, index) => ({
    name: `Person ${index + 1}`,
    email: `person${index + 1}@example.com`,
    role: index === 0 ? 'vertragsmanager' : undefined
  }))
}

export const generateTestEmail = (prefix: string = 'test'): string => {
  const timestamp = Date.now()
  return `${prefix}+${timestamp}@example.com`
}

export const generateTestName = (prefix: string = 'Test'): string => {
  const timestamp = Date.now()
  return `${prefix} ${timestamp}`
}

export const createInvalidHouseholdData = (): CreateHouseholdData => {
  return {
    name: '', // Invalid: empty name
    move_date: '2020-01-01', // Invalid: past date
    household_size: -1, // Invalid: negative
    children_count: -1, // Invalid: negative
    pets_count: -1, // Invalid: negative
    property_type: 'miete',
    postal_code: '123', // Invalid: wrong format
    old_address: '',
    new_address: '',
    living_space: -10, // Invalid: negative
    rooms: -1, // Invalid: negative
    furniture_volume: -5 // Invalid: negative
  }
}

export const createValidationTestCases = () => {
  return [
    {
      name: 'Valid household data',
      data: createMockHouseholdData(),
      shouldPass: true
    },
    {
      name: 'Empty name',
      data: createMockHouseholdData({ name: '' }),
      shouldPass: false
    },
    {
      name: 'Past move date',
      data: createMockHouseholdData({ move_date: '2020-01-01' }),
      shouldPass: false
    },
    {
      name: 'Negative household size',
      data: createMockHouseholdData({ household_size: -1 }),
      shouldPass: false
    },
    {
      name: 'Invalid postal code',
      data: createMockHouseholdData({ postal_code: '123' }),
      shouldPass: false
    },
    {
      name: 'Negative living space',
      data: createMockHouseholdData({ living_space: -10 }),
      shouldPass: false
    }
  ]
}

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockSupabaseResponse = <T>(data: T, error: any = null) => {
  return {
    data: error ? null : data,
    error,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }
}

export const mockSupabaseError = (message: string, code?: string) => {
  return {
    message,
    code: code || 'GENERIC_ERROR',
    details: null,
    hint: null
  }
}
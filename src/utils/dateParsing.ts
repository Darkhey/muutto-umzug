import { de } from 'chrono-node'

export function extractDate(text: string): Date | null {
  try {
    const result = de.parse(text)[0]
    return result ? result.start.date() : null
  } catch (error) {
    console.warn('Date parsing failed:', error)
    return null
  }
}

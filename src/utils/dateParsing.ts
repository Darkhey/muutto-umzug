import { parseDate, de } from 'chrono-node'

export function extractDate(text: string): Date | null {
  const result = de.parse(text)[0]
  return result ? result.start.date() : null
}

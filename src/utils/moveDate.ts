
import { Calendar, Clock, AlertCircle } from 'lucide-react'

export const getDaysUntilMove = (moveDate: string) => {
  const today = new Date()
  const move = new Date(moveDate)
  const diffTime = move.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getUrgencyColor = (daysUntilMove: number) => {
  if (daysUntilMove < 0) return 'text-red-600'
  if (daysUntilMove <= 7) return 'text-orange-600'
  if (daysUntilMove <= 30) return 'text-yellow-600'
  return 'text-green-600'
}

export const getUrgencyIcon = (daysUntilMove: number) => {
  if (daysUntilMove < 0) return AlertCircle
  if (daysUntilMove <= 7) return Clock
  return Calendar
}

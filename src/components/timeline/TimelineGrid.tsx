
import { addDays, format, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import { Star } from 'lucide-react'

interface TimelineGridProps {
  timelineStart: Date
  timelineEnd: Date
  zoomLevel: number
  moveDate: string
}

export const TimelineGrid = ({ timelineStart, timelineEnd, zoomLevel, moveDate }: TimelineGridProps) => {
  const generateTimelineGrid = () => {
    const days = []
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(timelineStart, i)
      const x = i * zoomLevel
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
      const isMoveDay = format(currentDate, 'yyyy-MM-dd') === moveDate
      const isCurrentDay = isToday(currentDate)
      const isFirstOfMonth = currentDate.getDate() === 1

      days.push(
        <div
          key={i}
          className={`absolute top-0 w-px h-full border-l ${
            isWeekend ? 'border-gray-200' : 'border-gray-100'
          } ${isMoveDay ? '!border-red-500 !border-l-2' : ''} ${
            isCurrentDay ? '!border-blue-500 !border-l-2' : ''
          }`}
          style={{ left: x }}
        >
          {isFirstOfMonth && (
            <div className="absolute -top-10 -left-8 text-xs font-semibold text-gray-700 whitespace-nowrap">
              {format(currentDate, 'MMM yyyy', { locale: de })}
            </div>
          )}
          {i % 7 === 0 && (
            <div className="absolute -top-6 -left-8 text-xs text-gray-500 whitespace-nowrap">
              {format(currentDate, 'dd.MM', { locale: de })}
            </div>
          )}
          {isMoveDay && (
            <div className="absolute -top-12 -left-16 flex items-center text-xs font-bold text-red-600 whitespace-nowrap">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" />
              Umzugstag {format(currentDate, 'dd.MM.yyyy', { locale: de })}
            </div>
          )}
          {isCurrentDay && (
            <div className="absolute -top-12 -left-12 text-xs font-bold text-blue-600 whitespace-nowrap">
              Heute {format(currentDate, 'dd.MM', { locale: de })}
            </div>
          )}
        </div>
      )
    }
    
    return days
  }

  return <>{generateTimelineGrid()}</>
}

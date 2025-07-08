
import { addDays, format, isToday, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Star, Calendar as CalendarIcon } from 'lucide-react';

interface TimelineGridProps {
  timelineStart: Date;
  timelineEnd: Date;
  zoomLevel: number;
  moveDate: string;
}

export const TimelineGrid = ({ timelineStart, timelineEnd, zoomLevel, moveDate }: TimelineGridProps) => {
  const generateTimelineGrid = () => {
    const days = [];
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const parsedMoveDate = parseISO(moveDate);

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(timelineStart, i);
      const x = i * zoomLevel;
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isMoveDay = format(currentDate, 'yyyy-MM-dd') === format(parsedMoveDate, 'yyyy-MM-dd');
      const isCurrentDay = isToday(currentDate);
      const isFirstOfMonth = currentDate.getDate() === 1;

      // Base styles for grid lines
      let lineClasses = 'absolute top-0 w-px h-full border-l';
      if (isWeekend) {
        lineClasses += ' border-gray-200';
      } else {
        lineClasses += ' border-gray-100';
      }

      // Special day markers
      let specialMarker = null;
      if (isMoveDay) {
        specialMarker = (
          <div style={{ left: x - 1 }} className="absolute top-0 z-10 w-1 h-full bg-green-500/80">
            <div className="absolute -top-12 -left-1/2 transform translate-x-[-50%] w-max">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100 border border-green-300 shadow-lg">
                <Star className="h-5 w-5 text-green-600 fill-green-400" />
                <span className="text-sm font-bold text-green-800">
                  Umzugstag: {format(currentDate, 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
            </div>
          </div>
        );
      } else if (isCurrentDay) {
        specialMarker = (
          <div style={{ left: x - 1 }} className="absolute top-0 z-10 w-1 h-full bg-blue-500/80">
            <div className="absolute -top-12 -left-1/2 transform translate-x-[-50%] w-max">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-100 border border-blue-300 shadow-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">
                  Heute: {format(currentDate, 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
            </div>
          </div>
        );
      }

      days.push(
        <div key={i}>
          <div className={lineClasses} style={{ left: x }}>
            {/* Date labels */}
            {isFirstOfMonth && (
              <div className="absolute -top-5 left-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                {format(currentDate, 'MMMM yyyy', { locale: de })}
              </div>
            )}
            {zoomLevel > 20 && i % 7 === 0 && (
              <div className="absolute top-2 left-2 text-xs text-gray-500 whitespace-nowrap">
                {format(currentDate, 'dd.MM', { locale: de })}
              </div>
            )}
          </div>
          {specialMarker}
        </div>
      );
    }
    
    return days;
  };

  return <>{generateTimelineGrid()}</>;
};

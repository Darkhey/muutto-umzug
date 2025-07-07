
import { useToast } from '@/hooks/use-toast'
import { TimelineItem } from '@/types/timeline'
import { format } from 'date-fns'

export const useTimelineExport = (timelineItems: TimelineItem[], householdName: string) => {
  const { toast } = useToast()

  const exportToICal = () => {
    const icalEvents = timelineItems
      .filter(item => item.start && !item.completed)
      .map(item => {
        const startDate = new Date(item.start!)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        
        return [
          'BEGIN:VEVENT',
          `UID:${item.id}@muutto.app`,
          `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `SUMMARY:${item.title}`,
          `DESCRIPTION:${item.description || ''}`,
          `CATEGORIES:${item.phase}`,
          `PRIORITY:${item.priority === 'kritisch' ? '1' : item.priority === 'hoch' ? '3' : '5'}`,
          'END:VEVENT'
        ].join('\r\n')
      })

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//muutto//Umzugsplaner//DE',
      'CALSCALE:GREGORIAN',
      ...icalEvents,
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `umzug-${householdName}-${format(new Date(), 'yyyy-MM-dd')}.ics`
    link.click()
    
    toast({
      title: 'iCal Export',
      description: 'Kalender wurde erfolgreich exportiert!'
    })
  }

  return { exportToICal }
}

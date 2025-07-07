import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'
import { HouseholdOverlap } from '@/utils/householdOverlaps'

interface OverlapTimelineProps {
  households: ExtendedHousehold[]
  overlaps: HouseholdOverlap[]
  onHouseholdClick?: (household: ExtendedHousehold) => void
  onOverlapClick?: (overlap: HouseholdOverlap) => void
}

interface TimelineEvent {
  date: Date
  type: 'move' | 'overlap'
  household?: ExtendedHousehold
  overlap?: HouseholdOverlap
  position: number
}

export const OverlapTimeline = ({
  households,
  overlaps,
  onHouseholdClick,
  onOverlapClick
}: OverlapTimelineProps) => {
  
  // Erstelle Timeline-Events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []
    
    // Füge Umzüge hinzu
    households.forEach((household, index) => {
      events.push({
        date: new Date(household.move_date),
        type: 'move',
        household,
        position: index
      })
    })
    
    // Füge Überlappungen hinzu
    overlaps.forEach((overlap, index) => {
      const affectedHouseholds = households.filter(h => 
        overlap.affectedHouseholds.includes(h.id)
      )
      
      if (affectedHouseholds.length > 0) {
        // Verwende das früheste Datum der betroffenen Haushalte
        const earliestDate = new Date(Math.min(
          ...affectedHouseholds.map(h => new Date(h.move_date).getTime())
        ))
        
        events.push({
          date: earliestDate,
          type: 'overlap',
          overlap,
          position: households.length + index
        })
      }
    })
    
    // Sortiere nach Datum
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [households, overlaps])

  // Berechne Timeline-Bereich
  const timelineRange = useMemo(() => {
    if (timelineEvents.length === 0) return { start: new Date(), end: new Date() }
    
    const dates = timelineEvents.map(e => e.date)
    const start = new Date(Math.min(...dates.map(d => d.getTime())))
    const end = new Date(Math.max(...dates.map(d => d.getTime())))
    
    // Füge Puffer hinzu
    start.setDate(start.getDate() - 7)
    end.setDate(end.getDate() + 7)
    
    return { start, end }
  }, [timelineEvents])

  // Berechne Position für ein Datum
  const getDatePosition = (date: Date) => {
    const totalDays = (timelineRange.end.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (date.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24)
    return (daysFromStart / totalDays) * 100
  }

  const getOverlapIcon = (type: HouseholdOverlap['type']) => {
    switch (type) {
      case 'move_date_conflict':
        return <Calendar className="h-4 w-4" />
      case 'address_overlap':
        return <MapPin className="h-4 w-4" />
      case 'member_duplicate':
        return <Users className="h-4 w-4" />
      case 'timeline_conflict':
        return <Clock className="h-4 w-4" />
      case 'resource_conflict':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: HouseholdOverlap['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (timelineEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Keine Timeline-Events verfügbar
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Überlappungs-Timeline
          <Badge variant="secondary">
            {timelineEvents.length} Events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline-Linie */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />
          
          {/* Timeline-Events */}
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const position = getDatePosition(event.date)
              const isOverlap = event.type === 'overlap'
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Timeline-Punkt */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      isOverlap 
                        ? getSeverityColor(event.overlap!.severity)
                        : 'bg-blue-500'
                    }`} />
                  </div>
                  
                  {/* Event-Inhalt */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                      {event.type === 'move' && event.household && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-blue-900">
                              {event.household.name}
                            </h4>
                            <Badge variant="outline" className="text-blue-600">
                              Umzug
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {event.date.toLocaleDateString('de-DE')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.household.household_size} {event.household.household_size === 1 ? 'Person' : 'Personen'}
                            {event.household.new_address && (
                              <span> • {event.household.new_address}</span>
                            )}
                          </p>
                          {onHouseholdClick && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onHouseholdClick(event.household!)}
                              className="mt-2"
                            >
                              Details anzeigen
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {event.type === 'overlap' && event.overlap && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getOverlapIcon(event.overlap.type)}
                              <h4 className="font-medium text-red-900">
                                {event.overlap.title}
                              </h4>
                            </div>
                            <Badge className={getSeverityColor(event.overlap.severity)}>
                              {event.overlap.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {event.overlap.description}
                          </p>
                          {event.overlap.suggestedAction && (
                            <p className="text-sm text-blue-600">
                              💡 {event.overlap.suggestedAction}
                            </p>
                          )}
                          {onOverlapClick && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOverlapClick(event.overlap!)}
                              className="mt-2"
                            >
                              Konflikt lösen
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Timeline-Labels */}
          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{timelineRange.start.toLocaleDateString('de-DE')}</span>
              <span>{timelineRange.end.toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
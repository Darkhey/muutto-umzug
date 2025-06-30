
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimeline } from '@/hooks/useTimeline'
import { ExtendedHousehold } from '@/types/household'
import { 
  Calendar, 
  ArrowLeft, 
  Clock, 
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface SimpleTimelineViewProps {
  household: ExtendedHousehold
  onBack?: () => void
}

export const SimpleTimelineView = ({ household, onBack }: SimpleTimelineViewProps) => {
  const { 
    timelineItems, 
    loading, 
    error
  } = useTimeline(household.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Zeitachse wird geladen...</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Zeitachse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Zeitachse</h1>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium">Fehler beim Laden der Zeitachse</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Gruppiere Tasks nach Datum
  const groupedTasks = timelineItems.reduce((groups, task) => {
    const dateKey = task.start ? format(new Date(task.start), 'yyyy-MM-dd') : 'no-date'
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(task)
    return groups
  }, {} as Record<string, typeof timelineItems>)

  // Sortiere Datumsgruppen
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'no-date') return 1
    if (b === 'no-date') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'kritisch': return 'bg-red-100 text-red-800 border-red-200'
      case 'hoch': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'mittel': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'niedrig': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'vor_umzug': return 'bg-blue-100 text-blue-800'
      case 'umzugstag': return 'bg-green-100 text-green-800'
      case 'nach_umzug': return 'bg-purple-100 text-purple-800'
      case 'langzeit': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Zeitachse: {household.name}</h1>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Umzugstag</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(household.move_date), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Aufgaben</h3>
                    <p className="text-sm text-gray-600">
                      {timelineItems.filter(item => item.completed).length} / {timelineItems.length} erledigt
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  {timelineItems.length > 0 ? Math.round((timelineItems.filter(item => item.completed).length / timelineItems.length) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Überfällig</h3>
                    <p className="text-sm text-gray-600">
                      {timelineItems.filter(item => item.is_overdue && !item.completed).length} Aufgaben
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={timelineItems.some(item => item.is_overdue && !item.completed) ? "destructive" : "outline"}
                  className="bg-red-50 text-red-800"
                >
                  {timelineItems.some(item => item.is_overdue && !item.completed) ? "Achtung" : "Keine"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Aufgaben-Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedDates.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Keine Aufgaben gefunden</p>
                </div>
              ) : (
                sortedDates.map(dateKey => (
                  <div key={dateKey} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                    
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {dateKey === 'no-date' 
                          ? 'Ohne Datum' 
                          : format(new Date(dateKey), 'dd. MMMM yyyy', { locale: de })
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {groupedTasks[dateKey].length} Aufgabe{groupedTasks[dateKey].length !== 1 ? 'n' : ''}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {groupedTasks[dateKey].map(task => (
                        <div 
                          key={task.id} 
                          className={`
                            p-3 rounded-lg border transition-all
                            ${task.completed 
                              ? 'bg-gray-50 border-gray-200 opacity-70' 
                              : task.is_overdue 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-white border-gray-200 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                            <div className="flex gap-2">
                              <Badge 
                                variant="outline" 
                                className={getPriorityColor(task.priority)}
                              >
                                {task.priority}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getPhaseColor(task.phase)}
                              >
                                {task.phase.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>
                              {task.assignee_name ? `Zugewiesen an: ${task.assignee_name}` : 'Nicht zugewiesen'}
                            </span>
                            {task.completed && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Erledigt
                              </div>
                            )}
                            {task.is_overdue && !task.completed && (
                              <div className="flex items-center gap-1 text-red-600">
                                <Clock className="h-3 w-3" />
                                Überfällig
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

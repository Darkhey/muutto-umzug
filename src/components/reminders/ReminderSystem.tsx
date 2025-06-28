import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  X,
  Snooze
} from 'lucide-react'

interface Reminder {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  completed: boolean
  snoozedUntil?: Date
}

interface ReminderSystemProps {
  householdId?: string
  className?: string
}

export const ReminderSystem = ({ householdId, className }: ReminderSystemProps) => {
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockReminders: Reminder[] = [
      {
        id: '1',
        title: 'Mietvertrag kündigen',
        description: 'Kündigungsschreiben für die alte Wohnung versenden',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'critical',
        category: 'Verträge',
        completed: false
      },
      {
        id: '2',
        title: 'Umzugsunternehmen buchen',
        description: 'Angebote vergleichen und Umzugsfirma beauftragen',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'high',
        category: 'Organisation',
        completed: false
      },
      {
        id: '3',
        title: 'Strom ummelden',
        description: 'Stromanbieter über Adressänderung informieren',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        priority: 'medium',
        category: 'Verträge',
        completed: false
      },
      {
        id: '4',
        title: 'Kartons besorgen',
        description: 'Umzugskartons und Verpackungsmaterial kaufen',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priority: 'medium',
        category: 'Material',
        completed: false
      }
    ]
    
    setReminders(mockReminders)
  }, [householdId])

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3" />
      case 'high':
        return <AlertTriangle className="h-3 w-3" />
      case 'medium':
        return <Clock className="h-3 w-3" />
      case 'low':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDueDate = (dueDate: Date) => {
    const daysUntil = getDaysUntilDue(dueDate)
    
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} Tage überfällig`
    } else if (daysUntil === 0) {
      return 'Heute fällig'
    } else if (daysUntil === 1) {
      return 'Morgen fällig'
    } else if (daysUntil <= 7) {
      return `In ${daysUntil} Tagen`
    } else {
      return dueDate.toLocaleDateString('de-DE')
    }
  }

  const handleCompleteReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: true }
          : reminder
      )
    )
    
    toast({
      title: 'Erinnerung abgeschlossen',
      description: 'Die Aufgabe wurde als erledigt markiert.'
    })
  }

  const handleSnoozeReminder = (id: string) => {
    const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, snoozedUntil: snoozeUntil }
          : reminder
      )
    )
    
    toast({
      title: 'Erinnerung verschoben',
      description: 'Die Erinnerung wird morgen erneut angezeigt.'
    })
  }

  const handleDismissReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id))
    
    toast({
      title: 'Erinnerung entfernt',
      description: 'Die Erinnerung wurde aus der Liste entfernt.'
    })
  }

  const activeReminders = reminders.filter(reminder => 
    !reminder.completed && 
    (!reminder.snoozedUntil || reminder.snoozedUntil <= new Date())
  )

  const urgentReminders = activeReminders.filter(reminder => 
    getDaysUntilDue(reminder.dueDate) <= 3
  )

  const upcomingReminders = activeReminders.filter(reminder => 
    getDaysUntilDue(reminder.dueDate) > 3
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Urgent Reminders */}
      {urgentReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Dringende Erinnerungen ({urgentReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <Badge className={getPriorityColor(reminder.priority)}>
                        {getPriorityIcon(reminder.priority)}
                        <span className="ml-1 capitalize">{reminder.priority}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(reminder.dueDate)}
                      </span>
                      <span>{reminder.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="h-8 px-2"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSnoozeReminder(reminder.id)}
                      className="h-8 px-2"
                    >
                      <Snooze className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReminder(reminder.id)}
                      className="h-8 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Kommende Erinnerungen ({upcomingReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
                        {getPriorityIcon(reminder.priority)}
                        <span className="ml-1 capitalize">{reminder.priority}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(reminder.dueDate)}
                      </span>
                      <span>{reminder.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="h-8 px-2"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReminder(reminder.id)}
                      className="h-8 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Reminders */}
      {activeReminders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Alle Erinnerungen abgearbeitet! 🎉
            </h3>
            <p className="text-gray-600">
              Du bist bestens organisiert. Neue Erinnerungen werden automatisch erstellt.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ExtendedHousehold } from '@/types/household'
import { calculateHouseholdProgress } from '@/utils/progressCalculator'
import { useTasks } from '@/hooks/useTasks'
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Lightbulb,
  Star
} from 'lucide-react'

interface MovingInsightsProps {
  household: ExtendedHousehold
  className?: string
}

export const MovingInsights = ({ household, className }: MovingInsightsProps) => {
  const { tasks } = useTasks(household.id)
  const completedTasks = tasks.filter(t => t.completed).length
  const progress = calculateHouseholdProgress(
    household.move_date,
    completedTasks,
    tasks.length
  )
  
  const getDaysUntilMove = () => {
    const today = new Date()
    const moveDate = new Date(household.move_date)
    const diffTime = moveDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilMove = getDaysUntilMove()
  
  const getPhaseInfo = () => {
    if (daysUntilMove > 60) {
      return {
        phase: 'Frühe Planung',
        color: 'bg-green-100 text-green-800',
        icon: <Target className="h-4 w-4" />,
        description: 'Perfekte Zeit für die Grundplanung'
      }
    } else if (daysUntilMove > 30) {
      return {
        phase: 'Aktive Vorbereitung',
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="h-4 w-4" />,
        description: 'Jetzt wird es konkret!'
      }
    } else if (daysUntilMove > 7) {
      return {
        phase: 'Finale Phase',
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Letzte Vorbereitungen treffen'
      }
    } else if (daysUntilMove > 0) {
      return {
        phase: 'Umzugswoche',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Endspurt!'
      }
    } else {
      return {
        phase: 'Nachbereitung',
        color: 'bg-purple-100 text-purple-800',
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Umzug abgeschlossen'
      }
    }
  }

  const phaseInfo = getPhaseInfo()

  const getPersonalizedTips = () => {
    const tips = []
    
    if (daysUntilMove > 60) {
      tips.push({
        icon: <Lightbulb className="h-4 w-4 text-yellow-600" />,
        title: 'Früh planen spart Geld',
        description: 'Umzugsunternehmen sind 2-3 Monate im Voraus oft günstiger.'
      })
    }
    
    if (household.children_count > 0) {
      tips.push({
        icon: <Star className="h-4 w-4 text-blue-600" />,
        title: 'Kinder einbeziehen',
        description: 'Lass deine Kinder beim Packen ihrer Sachen helfen - das reduziert Stress.'
      })
    }
    
    if (household.pets_count > 0) {
      tips.push({
        icon: <Star className="h-4 w-4 text-green-600" />,
        title: 'Haustiere vorbereiten',
        description: 'Plane einen ruhigen Ort für deine Haustiere am Umzugstag.'
      })
    }
    
    if (daysUntilMove <= 30 && daysUntilMove > 0) {
      tips.push({
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
        title: 'Notfall-Karton packen',
        description: 'Packe wichtige Dinge für die ersten Tage in einen separaten Karton.'
      })
    }
    
    return tips.slice(0, 3)
  }

  const tips = getPersonalizedTips()

  const getProgressInsight = () => {
    if (progress.overall >= 80) {
      return {
        text: 'Hervorragend! Du bist bestens vorbereitet.',
        color: 'text-green-600',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />
      }
    } else if (progress.overall >= 60) {
      return {
        text: 'Guter Fortschritt! Du liegst im Plan.',
        color: 'text-blue-600',
        icon: <TrendingUp className="h-4 w-4 text-blue-600" />
      }
    } else if (progress.overall >= 40) {
      return {
        text: 'Solide Basis. Jetzt Gas geben!',
        color: 'text-yellow-600',
        icon: <Clock className="h-4 w-4 text-yellow-600" />
      }
    } else {
      return {
        text: 'Zeit zu starten! Lass uns loslegen.',
        color: 'text-orange-600',
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
      }
    }
  }

  const progressInsight = getProgressInsight()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phase & Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Umzugs-Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className={phaseInfo.color}>
                {phaseInfo.icon}
                <span className="ml-1">{phaseInfo.phase}</span>
              </Badge>
              <p className="text-sm text-gray-600 mt-1">{phaseInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {daysUntilMove > 0 ? daysUntilMove : 0}
              </div>
              <div className="text-sm text-gray-600">
                {daysUntilMove > 0 ? 'Tage verbleibend' : 'Umzug abgeschlossen'}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Gesamtfortschritt</span>
              <div className="flex items-center gap-2">
                {progressInsight.icon}
                <span className={`text-sm font-medium ${progressInsight.color}`}>
                  {progress.overall}%
                </span>
              </div>
            </div>
            <Progress value={progress.overall} className="h-3" />
            <p className={`text-sm mt-1 ${progressInsight.color}`}>
              {progressInsight.text}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Persönliche Tipps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {tip.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{tip.title}</h4>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Auf einen Blick
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {household.household_size}
              </div>
              <div className="text-sm text-blue-800">
                {household.household_size === 1 ? 'Person' : 'Personen'}
              </div>
            </div>
            
            {household.children_count > 0 && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {household.children_count}
                </div>
                <div className="text-sm text-green-800">
                  {household.children_count === 1 ? 'Kind' : 'Kinder'}
                </div>
              </div>
            )}
            
            {household.pets_count > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {household.pets_count}
                </div>
                <div className="text-sm text-orange-800">
                  {household.pets_count === 1 ? 'Haustier' : 'Haustiere'}
                </div>
              </div>
            )}
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {household.property_type === 'miete' ? '🏠' : '🏡'}
              </div>
              <div className="text-sm text-purple-800">
                {household.property_type === 'miete' ? 'Miete' : 'Eigentum'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
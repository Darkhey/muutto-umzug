import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface DashboardHeroProps {
  household?: ExtendedHousehold
  totalTasks: number
  completedTasks: number
}

export const DashboardHero = ({ household, totalTasks, completedTasks }: DashboardHeroProps) => {
  if (!household) return null

  const moveDate = new Date(household.move_date)
  const today = new Date()
  const daysUntilMove = Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getCountdownText = () => {
    if (daysUntilMove > 0) {
      return `Noch ${daysUntilMove} Tage bis zum Umzug`
    } else if (daysUntilMove === 0) {
      return "Heute ist Umzugstag! 🎉"
    } else {
      return `Umzug war vor ${Math.abs(daysUntilMove)} Tagen`
    }
  }

  const getCountdownColor = () => {
    if (daysUntilMove <= 0) return "text-primary"
    if (daysUntilMove <= 7) return "text-destructive"
    if (daysUntilMove <= 30) return "text-yellow-600"
    return "text-muted-foreground"
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Countdown Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {household.name}
              </h2>
            </div>
            <div className={`text-lg font-semibold ${getCountdownColor()}`}>
              {getCountdownText()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Umzugsdatum: {moveDate.toLocaleDateString('de-DE')}
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Fortschritt</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-2" />
            <div className="text-xs text-muted-foreground">
              {completedTasks} von {totalTasks} Aufgaben erledigt
            </div>
          </div>

          {/* Time Indicator */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {new Date().toLocaleDateString('de-DE')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
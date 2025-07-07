import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'
import { getDaysUntilMove, getUrgencyColor, getUrgencyIcon } from '@/utils/moveDate'
import { getProgressColor } from '@/utils/progressCalculator'
import { TimelineButton } from '@/components/timeline/TimelineButton'

interface HouseholdCardProps {
  household: ExtendedHousehold
  progress: number
  onOpenHousehold: (household: ExtendedHousehold) => void
  onOpenTaskList: (household: ExtendedHousehold) => void
}

export const HouseholdCard = ({
  household,
  progress,
  onOpenHousehold,
  onOpenTaskList
}: HouseholdCardProps) => {
  const daysUntilMove = getDaysUntilMove(household.move_date)
  const progressColor = getProgressColor(progress)
  const UrgencyIcon = getUrgencyIcon(daysUntilMove)

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{household.name}</span>
          <Badge variant="secondary" className={progressColor}>
            {progress}%
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <UrgencyIcon className="h-4 w-4" />
          <span>
            Umzug: {new Date(household.move_date).toLocaleDateString('de-DE')}
            {daysUntilMove > 0 && ` (in ${daysUntilMove} Tagen)`}
            {daysUntilMove === 0 && ` (heute!)`}
            {daysUntilMove < 0 && ` (überfällig)`}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fortschritt</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'}
              {household.children_count > 0 && `, ${household.children_count} Kinder`}
              {household.pets_count > 0 && `, ${household.pets_count} Haustiere`}
            </div>
            <div className="flex gap-2">
              <TimelineButton household={household} size="sm" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenTaskList(household)}
              >
                Aufgaben
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenHousehold(household)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Öffnen
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ExtendedHousehold } from '@/types/household'
import { calculateHouseholdProgress, getProgressColor } from '@/utils/progressCalculator'
import { useTasks } from '@/hooks/useTasks'
import { PROPERTY_TYPES } from '@/config/app'
import { Users, Calendar, MapPin, Home, Settings, Square } from 'lucide-react'

interface HouseholdOverviewProps {
  household: ExtendedHousehold
  onManageMembers: () => void
  onEditHousehold: () => void
  onViewTasks: () => void
}

export const HouseholdOverview = ({
  household,
  onManageMembers,
  onEditHousehold,
  onViewTasks
}: HouseholdOverviewProps) => {
  const { tasks } = useTasks(household.id)
  const completedTasks = tasks.filter(t => t.completed).length
  const progressMetrics = calculateHouseholdProgress(
    household.move_date,
    completedTasks,
    tasks.length
  )
  const progressColor = getProgressColor(progressMetrics.overall)
  const propertyType = PROPERTY_TYPES.find(pt => pt.key === household.property_type)

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-blue-900">{household.name}</CardTitle>
              <CardDescription className="text-blue-700 mt-2">
                Umzug am {new Date(household.move_date).toLocaleDateString('de-DE')}
                {progressMetrics.daysRemaining > 0 && ` (in ${progressMetrics.daysRemaining} Tagen)`}
                {progressMetrics.daysRemaining <= 0 && ` (überfällig)`}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onEditHousehold}>
              <Settings className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Haushaltsgröße</p>
                <p className="font-semibold">{household.household_size} Personen</p>
              </div>
            </div>
            
            {household.children_count > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xl">👶</span>
                <div>
                  <p className="text-sm text-gray-600">Kinder</p>
                  <p className="font-semibold">{household.children_count}</p>
                </div>
              </div>
            )}
            
            {household.pets_count > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xl">🐾</span>
                <div>
                  <p className="text-sm text-gray-600">Haustiere</p>
                  <p className="font-semibold">{household.pets_count}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Wohnform</p>
                <p className="font-semibold">
                  {propertyType?.icon} {propertyType?.label}
                </p>
              </div>
            </div>
            
            {household.postal_code && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">PLZ</p>
                  <p className="font-semibold">{household.postal_code}</p>
                </div>
              </div>
            )}

            {household.new_address && (
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Neue Adresse</p>
                  <p className="font-semibold">{household.new_address}</p>
                </div>
              </div>
            )}

            {household.living_space && (
              <div className="flex items-center space-x-2">
                <Square className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Wohnfläche</p>
                  <p className="font-semibold">{household.living_space} m²</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fortschritt</span>
            <Badge variant="secondary" className={progressColor}>
              {progressMetrics.overall}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Gesamt-Fortschritt</span>
                <span>{progressMetrics.overall}%</span>
              </div>
              <Progress value={progressMetrics.overall} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Erledigte Aufgaben</p>
                <p className="font-semibold">{progressMetrics.tasksCompleted} von {progressMetrics.totalTasks}</p>
              </div>
              <div>
                <p className="text-gray-600">Verbleibende Tage</p>
                <p className="font-semibold">{progressMetrics.daysRemaining} Tage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Quick View */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mitglieder</CardTitle>
            <Button variant="outline" onClick={onManageMembers}>
              <Users className="h-4 w-4 mr-2" />
              Verwalten
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">
              {household.members?.length || 0} {(household.members?.length || 0) === 1 ? 'Mitglied' : 'Mitglieder'}
            </span>
          </div>
          {/* Quick member avatars could be added here */}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={onViewTasks} className="bg-blue-600 hover:bg-blue-700">
            Zur Aufgabenliste
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

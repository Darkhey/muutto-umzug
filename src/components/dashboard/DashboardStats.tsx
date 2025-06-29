import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExtendedHousehold } from '@/types/household'
import { Home, CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react'
import { getDaysUntilMove, getUrgencyColor, getUrgencyIcon } from '@/utils/moveDate'

interface DashboardStatsProps {
  households: ExtendedHousehold[]
  totalTasks: number
  completedTasks: number
  averageProgress: number
}

export const DashboardStats = ({
  households,
  totalTasks,
  completedTasks,
  averageProgress
}: DashboardStatsProps) => {
  // Find the earliest upcoming move date
  const getNextMoveInfo = () => {
    if (households.length === 0) return { date: null, days: 0 }
    
    let earliestDate: Date | null = null
    let earliestDays = Infinity
    
    households.forEach(household => {
      const days = getDaysUntilMove(household.move_date)
      if (days >= 0 && days < earliestDays) {
        earliestDays = days
        earliestDate = new Date(household.move_date)
      }
    })
    
    return { date: earliestDate, days: earliestDays }
  }
  
  const nextMove = getNextMoveInfo()
  const UrgencyIcon = nextMove.date ? getUrgencyIcon(nextMove.days) : Clock
  const urgencyColor = nextMove.date ? getUrgencyColor(nextMove.days) : 'text-gray-600'
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive Umzüge</CardTitle>
          <Home className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{households.length}</div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nächster Umzug</CardTitle>
          <UrgencyIcon className={`h-4 w-4 ${urgencyColor}`} />
        </CardHeader>
        <CardContent>
          {nextMove.date ? (
            <div className={`text-sm font-bold ${urgencyColor}`}>
              {nextMove.days > 0 
                ? `in ${nextMove.days} Tagen` 
                : nextMove.days === 0 
                  ? 'Heute!' 
                  : 'Überfällig'}
            </div>
          ) : (
            <div className="text-sm font-bold text-gray-600">Kein Umzug geplant</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {averageProgress}%
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
          <CheckCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {totalTasks - completedTasks}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
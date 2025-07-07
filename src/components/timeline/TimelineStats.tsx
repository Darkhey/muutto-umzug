
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { TimelineItem } from '@/types/timeline'

interface TimelineStatsProps {
  timelineItems: TimelineItem[]
}

export const TimelineStats = ({ timelineItems }: TimelineStatsProps) => {
  const completedCount = timelineItems.filter(item => item.completed).length
  const overdueCount = timelineItems.filter(item => item.is_overdue && !item.completed).length
  const completionPercentage = Math.round((completedCount / timelineItems.length) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Gesamt Aufgaben</h3>
              <p className="text-2xl font-bold text-blue-600">{timelineItems.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Erledigt</h3>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{completionPercentage}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Überfällig</h3>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

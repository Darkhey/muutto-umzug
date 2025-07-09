import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Home, 
  PawPrint, 
  Calendar,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface InsightsSidebarProps {
  household?: ExtendedHousehold
  upcomingTasks: Array<{
    id: string
    title: string
    due_date: string | null
    priority: string
  }>
}

export const InsightsSidebar = ({ household, upcomingTasks }: InsightsSidebarProps) => {
  if (!household) return null

  const moveDate = new Date(household.move_date)
  const today = new Date()
  const daysUntilMove = Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const tips = [
    "Beschrifte Kartons auf mehreren Seiten",
    "Wichtige Dokumente separat transportieren",
    "Nachbarn über Umzugstermin informieren",
    "Halteverbotszone rechtzeitig beantragen",
    "Erste-Hilfe-Kasten griffbereit halten"
  ]

  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  const getNextTasks = () => {
    return upcomingTasks
      .filter(task => task.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 3)
  }

  return (
    <div className="space-y-4">
      {/* Household Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            Haushalt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Personen</span>
            </div>
            <Badge variant="outline">{household.household_size}</Badge>
          </div>

          {household.children_count > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Kinder</span>
              </div>
              <Badge variant="outline">{household.children_count}</Badge>
            </div>
          )}

          {household.pets_count > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Haustiere</span>
              </div>
              <Badge variant="outline">{household.pets_count}</Badge>
            </div>
          )}

          {household.living_space && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Wohnfläche</span>
              </div>
              <Badge variant="outline">{household.living_space}m²</Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Wohnform</span>
            </div>
            <Badge variant="outline">
              {household.property_type === 'miete' ? 'Miete' : 'Eigentum'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Next Appointments */}
      {getNextTasks().length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Nächste Termine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getNextTasks().map((task) => {
              const taskDate = new Date(task.due_date!)
              const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={task.id} className="space-y-1">
                  <div className="text-sm font-medium leading-tight line-clamp-2">
                    {task.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {diffDays === 0 ? 'Heute' : 
                       diffDays === 1 ? 'Morgen' : 
                       diffDays > 0 ? `In ${diffDays} Tagen` : 
                       `Vor ${Math.abs(diffDays)} Tagen`}
                    </span>
                    <Badge 
                      variant={task.priority === 'hoch' ? 'destructive' : 'outline'}
                      className="text-xs px-1 py-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Tip of the Day */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            Tipp des Tages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 {randomTip}
          </p>
        </CardContent>
      </Card>

      {/* Weather or Time Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              {daysUntilMove > 0 ? daysUntilMove : '🎉'}
            </div>
            <div className="text-xs text-muted-foreground">
              {daysUntilMove > 0 
                ? `Tag${daysUntilMove === 1 ? '' : 'e'} bis zum Umzug`
                : 'Umzugstag erreicht!'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
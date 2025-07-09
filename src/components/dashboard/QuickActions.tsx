import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  UserPlus, 
  CheckSquare, 
  Package, 
  Calendar,
  Bot,
  Settings,
  Clock
} from 'lucide-react'

interface QuickActionsProps {
  onCreateTask: () => void
  onInviteMembers: () => void
  onOpenChecklist: () => void
  onManageBoxes: () => void
  onPlanSchedule: () => void
  onOpenAI?: () => void
  onOpenSettings?: () => void
  onOpenTimeline?: () => void
}

export const QuickActions = ({
  onCreateTask,
  onInviteMembers,
  onOpenChecklist,
  onManageBoxes,
  onPlanSchedule,
  onOpenAI,
  onOpenSettings,
  onOpenTimeline
}: QuickActionsProps) => {
  const actions = [
    {
      icon: Plus,
      label: 'Neue Aufgabe',
      description: 'Aufgabe hinzufügen',
      onClick: onCreateTask,
      primary: true
    },
    {
      icon: UserPlus,
      label: 'Helfer einladen',
      description: 'Mitglieder hinzufügen',
      onClick: onInviteMembers,
      primary: true
    },
    {
      icon: CheckSquare,
      label: 'Checkliste',
      description: 'Alle Aufgaben anzeigen',
      onClick: onOpenChecklist,
      primary: true
    },
    {
      icon: Package,
      label: 'Kartons',
      description: 'Inventar verwalten',
      onClick: onManageBoxes,
      primary: false
    },
    {
      icon: Calendar,
      label: 'Termine',
      description: 'Zeitplan organisieren',
      onClick: onPlanSchedule,
      primary: false
    },
    {
      icon: Clock,
      label: 'Timeline',
      description: 'Zeitstrahl anzeigen',
      onClick: onOpenTimeline,
      primary: false
    }
  ]

  const secondaryActions = [
    {
      icon: Bot,
      label: 'KI-Assistent',
      onClick: onOpenAI
    },
    {
      icon: Settings,
      label: 'Einstellungen',
      onClick: onOpenSettings
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schnellzugriffe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const IconComponent = action.icon
            return (
              <Button
                key={action.label}
                variant={action.primary ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${
                  action.primary 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={action.onClick}
              >
                <IconComponent className={`h-5 w-5 ${action.primary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <div>
                  <div className="text-sm font-medium leading-tight">
                    {action.label}
                  </div>
                  <div className={`text-xs leading-tight ${
                    action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {action.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Secondary Actions */}
        <div className="pt-2 border-t space-y-2">
          {secondaryActions.map((action) => {
            if (!action.onClick) return null
            
            const IconComponent = action.icon
            return (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-start h-9"
                onClick={action.onClick}
              >
                <IconComponent className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-sm">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
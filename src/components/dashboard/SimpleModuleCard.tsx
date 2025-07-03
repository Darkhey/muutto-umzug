import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { DashboardModule } from '@/hooks/useEnhancedDashboardModules'

interface SimpleModuleCardProps {
  module: DashboardModule
}

const getMinHeight = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'min-h-[240px]'
    case 'medium':
      return 'min-h-[360px]'
    case 'large':
      return 'min-h-[480px]'
    default:
      return 'min-h-[360px]'
  }
}

const getMaxHeight = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'max-h-[240px]'
    case 'medium':
      return 'max-h-[360px]'
    case 'large':
      return 'max-h-[480px]'
    default:
      return 'max-h-[360px]'
  }
}

export const SimpleModuleCard = ({ module }: SimpleModuleCardProps) => {
  const [open, setOpen] = useState(true)

  const heightClasses = open
    ? `${getMinHeight(module.size)} ${getMaxHeight(module.size)}`
    : 'min-h-0'

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={`bg-white shadow-lg flex flex-col transition-all duration-200 ${heightClasses}`}
        role="article"
        aria-label={`${module.title} module`}
      >
        <CardHeader className="flex flex-row items-center pb-2">
          <div className="flex items-center gap-2 flex-1">
            <span aria-hidden="true">{module.icon}</span>
            <CardTitle className="text-sm font-medium truncate">{module.title}</CardTitle>
          </div>
          <CollapsibleTrigger asChild>
            <button className="p-1 rounded hover:bg-gray-100" aria-label="Modul umschalten">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-auto">
            {module.component}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default SimpleModuleCard

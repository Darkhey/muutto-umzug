import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { DashboardModule } from '@/hooks/useEnhancedDashboardModules'

interface SimpleModuleCardProps {
  module: DashboardModule
}

export const SimpleModuleCard = ({ module }: SimpleModuleCardProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card 
      className="bg-white shadow-lg flex flex-col"
      role="article"
      aria-label={`${module.title} module`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <span aria-hidden="true">{module.icon}</span>
            <CardTitle className="text-sm font-medium">{module.title}</CardTitle>
          </div>
          <CollapsibleTrigger asChild>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
            {module.component}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default SimpleModuleCard

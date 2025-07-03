import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export const SimpleModuleCard = ({ module }: SimpleModuleCardProps) => (
  <Card className={`bg-white shadow-lg flex flex-col ${getMinHeight(module.size)}`}>
    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
      <div className="flex items-center gap-2">
        {module.icon}
        <CardTitle className="text-sm font-medium">{module.title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-1 overflow-auto">{module.component}</CardContent>
  </Card>
)

export default SimpleModuleCard

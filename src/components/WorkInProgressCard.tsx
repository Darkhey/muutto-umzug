import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorkInProgressCardProps {
  title: string
  icon?: string
}

export const WorkInProgressCard = ({ title, icon }: WorkInProgressCardProps) => (
  <Card className="bg-white shadow-lg relative">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <Badge variant="secondary">Work in Progress</Badge>
      </div>
    </CardContent>
  </Card>
)


import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface TimelineControlsProps {
  household: ExtendedHousehold
  zoomLevel: number
  showCompleted: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleCompleted: (checked: boolean) => void
  onExportToICal: () => void
}

export const TimelineControls = ({
  household,
  zoomLevel,
  showCompleted,
  onZoomIn,
  onZoomOut,
  onToggleCompleted,
  onExportToICal
}: TimelineControlsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Umzugs-Timeline: {household.name}
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onExportToICal}>
              <Download className="h-4 w-4 mr-2" />
              iCal Export
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">{zoomLevel}px/Tag</span>
              <Button variant="outline" size="sm" onClick={onZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="show-completed" 
                checked={showCompleted}
                onCheckedChange={onToggleCompleted}
              />
              <Label htmlFor="show-completed" className="text-sm">Erledigte anzeigen</Label>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

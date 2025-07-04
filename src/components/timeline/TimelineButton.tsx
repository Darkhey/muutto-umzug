
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { HorizontalTimelineView } from '@/components/timeline/HorizontalTimelineView'
import { Calendar, MoveHorizontal } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface TimelineButtonProps {
  household: ExtendedHousehold
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const TimelineButton = ({
  household,
  className,
  variant = 'outline',
  size = 'default'
}: TimelineButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MoveHorizontal className="mr-2 h-4 w-4" />
          Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Umzugs-Timeline
          </DialogTitle>
        </DialogHeader>
        <HorizontalTimelineView 
          household={household} 
          onBack={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}

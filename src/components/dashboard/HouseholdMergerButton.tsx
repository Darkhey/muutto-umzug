import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { HouseholdMerger } from '@/components/household/HouseholdMerger'
import { Merge } from 'lucide-react'

interface HouseholdMergerButtonProps {
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onMergeComplete?: () => void
}

export const HouseholdMergerButton = ({
  className,
  variant = 'outline',
  size = 'default',
  onMergeComplete
}: HouseholdMergerButtonProps) => {
  const [open, setOpen] = useState(false)

  const handleComplete = () => {
    setOpen(false)
    if (onMergeComplete) {
      onMergeComplete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Merge className="mr-2 h-4 w-4" />
          Haushalte zusammenführen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Haushalte zusammenführen</DialogTitle>
        </DialogHeader>
        <HouseholdMerger 
          onBack={() => setOpen(false)} 
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  )
}
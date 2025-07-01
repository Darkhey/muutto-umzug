import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { TimelineItem } from '@/types/timeline'
import { useTasks } from '@/hooks/useTasks'

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId?: string
  task: TimelineItem | null
}

export function EditTaskDialog({ open, onOpenChange, householdId, task }: EditTaskDialogProps) {
  const { updateTask } = useTasks(householdId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>()

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setDate(task.start ? new Date(task.start) : undefined)
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return
    await updateTask(task.id, {
      title,
      description,
      due_date: date ? format(date, 'yyyy-MM-dd') : null
    })
    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea value={description || ''} onChange={e => setDescription(e.target.value)} />
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button onClick={handleSave}>Speichern</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}


import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { useTasks } from '@/hooks/useTasks'
import { extractDate } from '@/utils/dateParsing'
import { TaskPhase, TaskPriority } from '@/types/database'

interface AddTaskFromChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  householdId?: string
  defaultPhase?: TaskPhase
  defaultPriority?: TaskPriority
}

export function AddTaskFromChatDialog({
  open,
  onOpenChange,
  message,
  householdId,
  defaultPhase = 'vor_umzug' as TaskPhase,
  defaultPriority = 'mittel' as TaskPriority,
}: AddTaskFromChatDialogProps) {
  const { createTask } = useTasks(householdId)
  const [title, setTitle] = useState(message)
  const [date, setDate] = useState<Date | undefined>(() => extractDate(message) || undefined)
  const [submitting, setSubmitting] = useState(false)

  // Reset state when dialog (re)opens
  useEffect(() => {
    if (open) {
      setTitle(message)
      setDate(extractDate(message) || undefined)
    }
  }, [open, message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await createTask({
        title: title.trim(),
        phase: defaultPhase,
        priority: defaultPriority,
        due_date: date ? format(date, 'yyyy-MM-dd') : null,
      })
      onOpenChange(false)
      // reset after success
      setTitle(message)
      setDate(extractDate(message) || undefined)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aufgabe aus Chat erstellen</DialogTitle>
          <DialogDescription>Bearbeite Titel und wähle optional ein Fälligkeitsdatum.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Aufgabentitel eingeben..."
            required
            aria-label="Aufgabentitel"
          />
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Abbrechen</Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

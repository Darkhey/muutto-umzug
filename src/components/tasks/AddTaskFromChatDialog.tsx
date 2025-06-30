import { useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { useTasks } from '@/hooks/useTasks'
import { extractDate } from '@/utils/dateParsing'

interface AddTaskFromChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  householdId?: string
}

export function AddTaskFromChatDialog({ open, onOpenChange, message, householdId }: AddTaskFromChatDialogProps) {
  const { createTask } = useTasks(householdId)
  const [title, setTitle] = useState(message)
  const [date, setDate] = useState<Date | undefined>(() => extractDate(message) || undefined)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await createTask({
        title: title.trim(),
        phase: 'vor_umzug',
        priority: 'mittel',
        due_date: date ? format(date, 'yyyy-MM-dd') : null
      })
      onOpenChange(false)
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
          <Input value={title} onChange={e => setTitle(e.target.value)} />
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

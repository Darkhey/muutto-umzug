import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  onCreate: (title: string) => Promise<void>
}

export function CreateTaskDialog({ open, onOpenChange, date, onCreate }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await onCreate(trimmed)
      setTitle('')
      onOpenChange(false)
    } catch (error) {
      // Error handling is delegated to onCreate, but we should ensure
      // the component state is consistent
      console.error('Failed to create task:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Aufgabe</DialogTitle>
          <DialogDescription>
            Aufgabe für {format(date, 'dd.MM.yyyy')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titel eingeben"
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              Anlegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

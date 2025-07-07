
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { TimelineItem } from '@/types/timeline';
import { useTasks } from '@/hooks/useTasks';
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers';
import { useTaskComments } from '@/hooks/useTaskComments';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { isSafeUrl } from '@/utils/url';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId?: string;
  task: TimelineItem | null;
}

export function EditTaskDialog({ open, onOpenChange, householdId, task }: EditTaskDialogProps) {
  const { updateTask } = useTasks(householdId);
  const { members } = useHouseholdMembers(householdId);
  const { comments, addComment } = useTaskComments(task?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [linkUrl, setLinkUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDate(task.start ? new Date(task.start) : undefined);
      setLinkUrl(task.link_url || '');
      setAttachmentUrl(task.attachment_url || '');
      setAssigneeId(task.assignee_id || null);
    }
  }, [task]);

  // Cleanup function to abort upload if component unmounts
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Sie müssen eine Datei zum Hochladen auswählen.');
      }

      const file = event.target.files[0];
      
      // File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('Datei ist zu groß. Maximale Größe ist 10MB.');
      }
      
      // File type validation
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error('Nur JPEG, PNG und PDF Dateien sind erlaubt.');
      }

      // Create AbortController for upload
      const controller = new AbortController();
      setAbortController(controller);

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${householdId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file, {
        abortSignal: controller.signal
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
      setAttachmentUrl(data.publicUrl);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload was aborted');
      } else {
        alert(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      }
    } finally {
      setUploading(false);
      setAbortController(null);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    await updateTask(task.id, {
      title,
      description,
      due_date: date ? format(date, 'yyyy-MM-dd') : null,
      link_url: linkUrl,
      attachment_url: attachmentUrl,
      assignee_id: assigneeId,
    });
    onOpenChange(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;
    await addComment(newComment);
    setNewComment('');
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea value={description || ''} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Link hinzufügen" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
          <div>
            <label htmlFor="attachment">Anhang</label>
            <Input id="attachment" type="file" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <p>Lädt hoch...</p>}
            {attachmentUrl && isSafeUrl(attachmentUrl) && (
              <a href={attachmentUrl} target="_blank" rel="noreferrer">Anhang anzeigen</a>
            )}
          </div>
          <Select onValueChange={setAssigneeId} defaultValue={assigneeId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Zuweisen an..." />
            </SelectTrigger>
            <SelectContent>
              {members.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />

          {/* Kommentarfunktion */}
          <div className="space-y-2">
            <h3 className="font-semibold">Kommentare</h3>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">Noch keine Kommentare.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="mb-2 p-2 bg-gray-50 rounded-md">
                    <p className="text-xs font-semibold">{comment.profiles?.full_name || 'Unbekannt'}</p>
                    <p className="text-sm">{comment.comment_text}</p>
                    <p className="text-xs text-gray-400 text-right">{format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm')}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Neuer Kommentar..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') handleAddComment();
                }}
              />
              <Button onClick={handleAddComment}>Senden</Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button onClick={handleSave}>Speichern</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


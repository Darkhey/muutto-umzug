
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TimelineItem } from '@/types/timeline';

interface InlineTaskEditorProps {
  task: TimelineItem;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

export const InlineTaskEditor = ({ task, onSave, onCancel }: InlineTaskEditorProps) => {
  const [title, setTitle] = useState(task.title);

  useEffect(() => {
    setTitle(task.title);
  }, [task]);

  const handleSave = () => {
    onSave(title);
  };

  return (
    <div className="p-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2"
      />
      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} variant="outline" size="sm">Abbrechen</Button>
        <Button onClick={handleSave} size="sm">Speichern</Button>
      </div>
    </div>
  );
};

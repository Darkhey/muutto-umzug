import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { TimelineItem } from '@/types/timeline';

interface AISuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: TimelineItem[];
  onAccept: (suggestion: TimelineItem) => void;
}

export const AISuggestionsDialog = ({ open, onOpenChange, suggestions, onAccept }: AISuggestionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>KI-Vorschläge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={suggestion.id || `suggestion-${index}`} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{suggestion.title}</h4>
              <p className="text-sm text-gray-500">{suggestion.description}</p>
              <div className="text-xs text-gray-400 mt-2">
                Voraussichtliches Fälligkeitsdatum: {suggestion.due_date ? new Date(suggestion.due_date).toLocaleDateString() : 'Nicht festgelegt'}
              </div>
              <Button onClick={() => onAccept(suggestion)} size="sm" className="mt-2">Hinzufügen</Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

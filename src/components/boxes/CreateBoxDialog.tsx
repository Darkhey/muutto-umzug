import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateBoxData, BoxCategory } from '@/types/box';

interface CreateBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBoxData) => Promise<void>;
  householdId: string;
}

const boxCategories: { value: BoxCategory; label: string; icon: string }[] = [
  { value: 'küche', label: 'Küche', icon: '🍳' },
  { value: 'wohnzimmer', label: 'Wohnzimmer', icon: '🛋️' },
  { value: 'schlafzimmer', label: 'Schlafzimmer', icon: '🛏️' },
  { value: 'bad', label: 'Bad', icon: '🚿' },
  { value: 'keller', label: 'Keller', icon: '🏠' },
  { value: 'dachboden', label: 'Dachboden', icon: '🏠' },
  { value: 'büro', label: 'Büro', icon: '💼' },
  { value: 'kinderzimmer', label: 'Kinderzimmer', icon: '🧸' },
  { value: 'garten', label: 'Garten', icon: '🌱' },
  { value: 'sonstiges', label: 'Sonstiges', icon: '📦' }
];

export function CreateBoxDialog({ open, onOpenChange, onSubmit, householdId }: CreateBoxDialogProps) {
  const [formData, setFormData] = useState<CreateBoxData>({
    box_number: '',
    name: '',
    description: '',
    category: 'sonstiges',
    room: '',
    weight_kg: undefined,
    dimensions_cm: undefined
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      // Form zurücksetzen
      setFormData({
        box_number: '',
        name: '',
        description: '',
        category: 'sonstiges',
        room: '',
        weight_kg: undefined,
        dimensions_cm: undefined
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Kartons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateBoxData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Karton erstellen</DialogTitle>
          <DialogDescription>
            Fülle die Details aus, um einen neuen Umzugskarton zu deinem Inventar hinzuzufügen.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="box_number">Kartonsnummer *</Label>
              <Input
                id="box_number"
                value={formData.box_number}
                onChange={(e) => handleInputChange('box_number', e.target.value)}
                placeholder="z.B. K001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value as BoxCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boxCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="z.B. Küchenutensilien"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detaillierte Beschreibung des Kartoninhalts..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Raum (optional)</Label>
              <Input
                id="room"
                value={formData.room || ''}
                onChange={(e) => handleInputChange('room', e.target.value)}
                placeholder="z.B. Wohnzimmer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Gewicht in kg (optional)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Abmessungen in cm (optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Länge"
                type="number"
                value={formData.dimensions_cm?.length || ''}
                onChange={(e) => handleInputChange('dimensions_cm', {
                  ...formData.dimensions_cm,
                  length: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
              <Input
                placeholder="Breite"
                type="number"
                value={formData.dimensions_cm?.width || ''}
                onChange={(e) => handleInputChange('dimensions_cm', {
                  ...formData.dimensions_cm,
                  width: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
              <Input
                placeholder="Höhe"
                type="number"
                value={formData.dimensions_cm?.height || ''}
                onChange={(e) => handleInputChange('dimensions_cm', {
                  ...formData.dimensions_cm,
                  height: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !formData.box_number}>
              {loading ? 'Erstelle...' : 'Karton erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
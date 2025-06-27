import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROPERTY_TYPES } from '@/config/app'
import { ExtendedHousehold } from '@/types/household'

interface EditHouseholdFormProps {
  household: ExtendedHousehold
  onSubmit: (updates: {
    name: string
    move_date: string
    household_size: number
    children_count: number
    pets_count: number
    property_type: 'miete' | 'eigentum'
    postal_code: string | null
  }) => void
  onCancel: () => void
}

export const EditHouseholdForm = ({ household, onSubmit, onCancel }: EditHouseholdFormProps) => {
  const [form, setForm] = useState({
    name: household.name,
    move_date: household.move_date,
    household_size: household.household_size,
    children_count: household.children_count,
    pets_count: household.pets_count,
    property_type: household.property_type,
    postal_code: household.postal_code || ''
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      household_size: Number(form.household_size),
      children_count: Number(form.children_count),
      pets_count: Number(form.pets_count),
      postal_code: form.postal_code || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name des Haushalts</Label>
        <Input
          id="edit-name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-date">Umzugsdatum</Label>
        <Input
          id="edit-date"
          type="date"
          value={form.move_date}
          onChange={(e) => updateField('move_date', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-size">Haushaltsgröße</Label>
          <Input
            id="edit-size"
            type="number"
            min={1}
            value={form.household_size}
            onChange={(e) => updateField('household_size', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-children">Kinder</Label>
          <Input
            id="edit-children"
            type="number"
            min={0}
            value={form.children_count}
            onChange={(e) => updateField('children_count', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-pets">Haustiere</Label>
          <Input
            id="edit-pets"
            type="number"
            min={0}
            value={form.pets_count}
            onChange={(e) => updateField('pets_count', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-property">Wohnform</Label>
          <Select
            value={form.property_type}
            onValueChange={(value) => updateField('property_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wohnform wählen" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((pt) => (
                <SelectItem key={pt.key} value={pt.key}>{pt.icon} {pt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-postal">Postleitzahl</Label>
        <Input
          id="edit-postal"
          value={form.postal_code}
          onChange={(e) => updateField('postal_code', e.target.value)}
          maxLength={5}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit">Speichern</Button>
      </div>
    </form>
  )
}

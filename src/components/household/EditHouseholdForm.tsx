import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { useDistanceCalculation } from '@/hooks/useDistanceCalculation'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROPERTY_TYPES } from '@/config/app'
import { ExtendedHousehold } from '@/types/household'
import { Home, Calendar, Users, MapPin, Ruler, DoorOpen, Package2, AlertTriangle } from 'lucide-react'

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
    old_address: string | null
    new_address: string | null
    living_space: number | null
    rooms: number | null
    furniture_volume: number | null
  }) => void
  onCancel: () => void
}

export const EditHouseholdForm = ({ household, onSubmit, onCancel }: EditHouseholdFormProps) => {
  const [form, setForm] = useState({
    name: household.name,
    move_date: household.move_date,
    household_size:
      household.household_size != null
        ? String(household.household_size)
        : '',
    children_count:
      household.children_count != null
        ? String(household.children_count)
        : '',
    pets_count:
      household.pets_count != null
        ? String(household.pets_count)
        : '',
    property_type: household.property_type,
    postal_code: household.postal_code ?? '',
    old_address: household.old_address ?? '',
    new_address: household.new_address ?? '',
    living_space:
      household.living_space != null ? String(household.living_space) : '',
    rooms: household.rooms != null ? String(household.rooms) : '',
    furniture_volume:
      household.furniture_volume != null
        ? String(household.furniture_volume)
        : ''
  })
  const {
    oldCoords,
    newCoords,
    setOldCoords,
    setNewCoords,
    distanceKm,
    distanceFact
  } = useDistanceCalculation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    if (field === 'old_address') {
      setOldCoords(null)
    }
    if (field === 'new_address') {
      setNewCoords(null)
    }
  }

  const parseNumber = (value: string): number | null => {
    if (value === '') return null
    const num = Number(value)
    return Number.isNaN(num) ? null : num
  }

  const handleOldSelect = (coords?: { lat: number; lon: number }) => {
    if (!coords || Number.isNaN(coords.lat) || Number.isNaN(coords.lon)) {
      setErrors(prev => ({ ...prev, old_address: 'Ungültige Koordinaten' }))
      setOldCoords(null)
      return
    }
    setOldCoords(coords)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.old_address
      return newErrors
    })
  }

  const handleNewSelect = (coords?: { lat: number; lon: number }) => {
    if (!coords || Number.isNaN(coords.lat) || Number.isNaN(coords.lon)) {
      setErrors(prev => ({ ...prev, new_address: 'Ungültige Koordinaten' }))
      setNewCoords(null)
      return
    }
    setNewCoords(coords)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.new_address
      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!form.name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    }
    
    if (!form.move_date) {
      newErrors.move_date = 'Umzugsdatum ist erforderlich'
    }
    
    if (!form.property_type) {
      newErrors.property_type = 'Wohnform ist erforderlich'
    }
    
    // Validate numbers
    const householdSize = parseNumber(form.household_size)
    if (householdSize === null || householdSize < 1) {
      newErrors.household_size = 'Haushaltsgröße muss mindestens 1 sein'
    }
    
    const childrenCount = parseNumber(form.children_count)
    if (childrenCount !== null && childrenCount < 0) {
      newErrors.children_count = 'Anzahl Kinder kann nicht negativ sein'
    }
    
    const petsCount = parseNumber(form.pets_count)
    if (petsCount !== null && petsCount < 0) {
      newErrors.pets_count = 'Anzahl Haustiere kann nicht negativ sein'
    }
    
    // Validate postal code format (German)
    if (form.postal_code && !/^\d{5}$/.test(form.postal_code)) {
      newErrors.postal_code = 'Postleitzahl muss 5 Ziffern haben'
    }
    
    // Validate numeric fields
    const livingSpace = parseNumber(form.living_space)
    if (livingSpace !== null && livingSpace < 0) {
      newErrors.living_space = 'Wohnfläche kann nicht negativ sein'
    }
    
    const rooms = parseNumber(form.rooms)
    if (rooms !== null && rooms < 0) {
      newErrors.rooms = 'Anzahl Zimmer kann nicht negativ sein'
    }
    
    const furnitureVolume = parseNumber(form.furniture_volume)
    if (furnitureVolume !== null && furnitureVolume < 0) {
      newErrors.furniture_volume = 'Möbelvolumen kann nicht negativ sein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    onSubmit({
      ...form,
      household_size: parseNumber(form.household_size) || 1,
      children_count: parseNumber(form.children_count) || 0,
      pets_count: parseNumber(form.pets_count) || 0,
      postal_code: form.postal_code.trim() ? form.postal_code : null,
      living_space: parseNumber(form.living_space),
      rooms: parseNumber(form.rooms),
      furniture_volume: parseNumber(form.furniture_volume),
      old_address: form.old_address || null,
      new_address: form.new_address || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name" className="flex items-center gap-2">
          <Home className="h-4 w-4 text-blue-600" />
          Name des Haushalts
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Home className="h-4 w-4" />
          </div>
          <Input
            id="edit-name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`pl-9 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
            required
            aria-invalid={!!errors.name}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          Umzugsdatum
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Calendar className="h-4 w-4" />
          </div>
          <Input
            id="edit-date"
            type="date"
            value={form.move_date}
            onChange={(e) => updateField('move_date', e.target.value)}
            className={`pl-9 ${errors.move_date ? 'border-red-500 focus:border-red-500' : ''}`}
            required
            aria-invalid={!!errors.move_date}
          />
        </div>
        {errors.move_date && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.move_date}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-size" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Haushaltsgröße
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Users className="h-4 w-4" />
            </div>
            <Input
              id="edit-size"
              type="number"
              min={1}
              value={form.household_size}
              onChange={(e) => updateField('household_size', e.target.value)}
              className={`pl-9 ${errors.household_size ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-invalid={!!errors.household_size}
            />
          </div>
          {errors.household_size && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.household_size}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-children" className="flex items-center gap-2">
            <span className="text-lg">👶</span>
            Kinder
          </Label>
          <Input
            id="edit-children"
            type="number"
            min={0}
            value={form.children_count}
            onChange={(e) => updateField('children_count', e.target.value)}
            className={errors.children_count ? 'border-red-500 focus:border-red-500' : ''}
            aria-invalid={!!errors.children_count}
          />
          {errors.children_count && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.children_count}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-pets" className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            Haustiere
          </Label>
          <Input
            id="edit-pets"
            type="number"
            min={0}
            value={form.pets_count}
            onChange={(e) => updateField('pets_count', e.target.value)}
            className={errors.pets_count ? 'border-red-500 focus:border-red-500' : ''}
            aria-invalid={!!errors.pets_count}
          />
          {errors.pets_count && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.pets_count}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-property" className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            Wohnform
          </Label>
          <Select
            value={form.property_type}
            onValueChange={(value) => updateField('property_type', value)}
          >
            <SelectTrigger className={errors.property_type ? 'border-red-500 focus:border-red-500' : ''}>
              <SelectValue placeholder="Wohnform wählen" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((pt) => (
                <SelectItem key={pt.key} value={pt.key}>{pt.icon} {pt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.property_type && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.property_type}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-postal" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Postleitzahl
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <MapPin className="h-4 w-4" />
          </div>
          <Input
            id="edit-postal"
            value={form.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
            maxLength={5}
            className={`pl-9 ${errors.postal_code ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="12345"
            aria-invalid={!!errors.postal_code}
          />
        </div>
        {errors.postal_code && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.postal_code}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-old" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Aktuelle Adresse (optional)
        </Label>
        <AddressAutocomplete
          value={form.old_address}
          onChange={(val) => updateField('old_address', val)}
          onSelect={handleOldSelect}
          error={errors.old_address}
          helpText="Deine aktuelle Wohnadresse"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-new" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          Neue Adresse
        </Label>
        <AddressAutocomplete
          value={form.new_address}
          onChange={(val) => updateField('new_address', val)}
          onSelect={handleNewSelect}
          error={errors.new_address}
          helpText="Deine zukünftige Wohnadresse"
        />
        {distanceKm != null && distanceFact != null && (
          <p
            className="text-sm text-gray-600 mt-1 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <MapPin className="h-3 w-3" />
            Entfernung ca. {distanceKm} km – {distanceFact}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-living" className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-blue-600" />
            Wohnfläche (m²)
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Ruler className="h-4 w-4" />
            </div>
            <Input
              id="edit-living"
              type="number"
              min={0}
              value={form.living_space}
              onChange={(e) => updateField('living_space', e.target.value)}
              className={`pl-9 ${errors.living_space ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-invalid={!!errors.living_space}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              m²
            </div>
          </div>
          {errors.living_space && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.living_space}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-rooms" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-blue-600" />
            Zimmer
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <DoorOpen className="h-4 w-4" />
            </div>
            <Input
              id="edit-rooms"
              type="number"
              min={0}
              value={form.rooms}
              onChange={(e) => updateField('rooms', e.target.value)}
              className={`pl-9 ${errors.rooms ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-invalid={!!errors.rooms}
            />
          </div>
          {errors.rooms && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.rooms}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-volume" className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-blue-600" />
            Möbelvolumen (m³)
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Package2 className="h-4 w-4" />
            </div>
            <Input
              id="edit-volume"
              type="number"
              min={0}
              value={form.furniture_volume}
              onChange={(e) => updateField('furniture_volume', e.target.value)}
              className={`pl-9 ${errors.furniture_volume ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-invalid={!!errors.furniture_volume}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              m³
            </div>
          </div>
          {errors.furniture_volume && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.furniture_volume}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit">Speichern</Button>
      </div>
    </form>
  )
}
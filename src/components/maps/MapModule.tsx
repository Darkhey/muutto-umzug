

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  CATEGORY_CONFIG,
  Category,
  RADIUS_OPTIONS,
  RadiusOption
} from '@/config/map'
import { usePOIs } from './usePOIs'
import { useGeocoding } from '@/hooks/useGeocoding'
import { ExtendedHousehold } from '@/types/household'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const houseIcon = L.divIcon({ html: '🏠', className: '', iconSize: [24, 24] })
const categoryIcons = CATEGORY_CONFIG.reduce<Record<Category, L.DivIcon>>(
  (acc, c) => {
    acc[c.key] = L.divIcon({
      html: `<span style="background:${c.color};width:1rem;height:1rem;display:block;border-radius:50%;border:2px solid white"></span>`,
      className: '',
      iconSize: [16, 16]
    })
    return acc
  },
  {} as Record<Category, L.DivIcon>
)

interface MapModuleProps {
  household: ExtendedHousehold
}

export const MapModule = ({ household }: MapModuleProps) => {
  const { coords, loading: geocodingLoading, error: geocodingError } = useGeocoding(household.new_address || '')

  const [selected, setSelected] = useState<Category[]>([
    'kita',
    'arzt',
    'supermarkt',
    'verwaltung'
  ])
  const [radius, setRadius] = useState<RadiusOption>(RADIUS_OPTIONS[1])
  const { pois, loading, error } = usePOIs(
    coords?.lat || 0,
    coords?.lon || 0,
    selected,
    radius.radius
  )

  const toggle = (key: Category) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const centerPosition: LatLngExpression = [
    coords?.lat || 0,
    coords?.lon || 0
  ]

  if (geocodingLoading) return <p>Lade Adresse...</p>
  if (geocodingError) return <p className="text-red-600">Fehler beim Laden der Adresse: {geocodingError}</p>
  if (!coords) return <p>Keine Adresse verfügbar oder konnte nicht gefunden werden.</p>

  return (
    <div className="space-y-2">
      <RadioGroup
        value={radius.key}
        onValueChange={key =>
          setRadius(RADIUS_OPTIONS.find(r => r.key === key) as RadiusOption)
        }
        className="flex gap-3"
      >
        {RADIUS_OPTIONS.map(opt => (
          <div key={opt.key} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.key} id={`rad-${opt.key}`} />
            <Label htmlFor={`rad-${opt.key}`}>{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex flex-wrap gap-3">
        {CATEGORY_CONFIG.map(opt => (
          <div key={opt.key} className="flex items-center space-x-2">
            <Checkbox
              id={`cat-${opt.key}`}
              checked={selected.includes(opt.key)}
              onCheckedChange={() => toggle(opt.key)}
            />
            <Label htmlFor={`cat-${opt.key}`}>{opt.label}</Label>
          </div>
        ))}
      </div>
      {loading && (
        <p className="text-sm text-gray-500">Lade Orte...</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div style={{ height: '400px', width: '100%' }} className="rounded-lg">
        <MapContainer
          center={centerPosition}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={centerPosition} icon={houseIcon}>
            <Popup>Zieladresse</Popup>
          </Marker>
          {pois.map(poi => (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lon] as LatLngExpression}
              icon={categoryIcons[poi.category]}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-medium">
                    {poi.tags?.name || 'Unbenannter Ort'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {poi.distance.toFixed(2)} km entfernt
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-4 pt-2 text-sm">
        {CATEGORY_CONFIG.map(c => (
          <div key={c.key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: c.color }}
            />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MapModule


import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

type Category = 'kita' | 'arzt' | 'supermarkt' | 'verwaltung'

interface POI {
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
  category: Category
  distance: number
}

interface OverpassElement {
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

interface MapModuleProps {
  latitude: number
  longitude: number
}

const CATEGORY_OPTIONS: { key: Category; label: string; query: string }[] = [
  { key: 'kita', label: 'Kitas', query: 'amenity=kindergarten' },
  { key: 'arzt', label: 'Ärzte', query: 'amenity=doctors' },
  { key: 'supermarkt', label: 'Supermärkte', query: 'shop=supermarket' },
  { key: 'verwaltung', label: 'Stadtverwaltung', query: 'amenity=townhall' }
]

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const MapModule = ({ latitude, longitude }: MapModuleProps) => {
  const [selected, setSelected] = useState<Category[]>([
    'kita',
    'arzt',
    'supermarkt',
    'verwaltung'
  ])
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (key: Category) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  useEffect(() => {
    const controller = new AbortController()
    async function fetchPOIs() {
      const queries = CATEGORY_OPTIONS.filter(o => selected.includes(o.key))
        .map(o => `node[${o.query}](around:3000,${latitude},${longitude});`)
        .join('')
      if (!queries) {
        setPois([])
        setError(null)
        setLoading(false)
        return
      }
      const url =
        'https://overpass-api.de/api/interpreter?data=' +
        encodeURIComponent(`[out:json];(${queries});out;`)
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          setError('Fehler beim Laden der Orte')
          setLoading(false)
          return
        }
        const data = await res.json()
        const elements = data.elements as OverpassElement[]
        const mapped: POI[] = elements.map(el => {
          const category = CATEGORY_OPTIONS.find(opt => {
            const [k, v] = opt.query.split('=')
            return el.tags?.[k] === v
          })?.key as Category
          return {
            id: el.id,
            lat: el.lat,
            lon: el.lon,
            tags: el.tags,
            category,
            distance: haversine(latitude, longitude, el.lat, el.lon)
          }
        })
        setPois(mapped)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setError('Fehler beim Abrufen der Orte')
        setLoading(false)
      }
    }
    fetchPOIs()
    return () => controller.abort()
  }, [selected, latitude, longitude])

  const center: LatLngExpression = [latitude, longitude]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {CATEGORY_OPTIONS.map(opt => (
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
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>Startpunkt</Popup>
        </Marker>
        {pois.map(poi => (
          <Marker key={poi.id} position={[poi.lat, poi.lon]}>
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
  )
}

export default MapModule

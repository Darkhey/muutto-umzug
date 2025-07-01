import { useEffect, useState } from 'react'
import { CATEGORY_CONFIG, Category } from '@/config/map'

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

interface OverpassResponse {
  elements: OverpassElement[]
}

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

export function usePOIs(
  latitude: number,
  longitude: number,
  selected: Category[],
  radius: number
) {
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function fetchPOIs() {
      const queries = CATEGORY_CONFIG.filter(o => selected.includes(o.key))
        .map(o => `node[${o.query}](around:${radius},${latitude},${longitude});`)
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
        const data: OverpassResponse = await res.json()
        const elements = data.elements
        const mapped: (POI | null)[] = elements.map(el => {
          const found = CATEGORY_CONFIG.find(opt => {
            const [k, v] = opt.query.split('=')
            return el.tags?.[k] === v
          })
          if (!found) return null
          const category = found.key
          return {
            id: el.id,
            lat: el.lat,
            lon: el.lon,
            tags: el.tags,
            category,
            distance: haversine(latitude, longitude, el.lat, el.lon)
          }
        })
        setPois(mapped.filter((p): p is POI => p !== null))
        setLoading(false)
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') {
          return
        }
        setError('Fehler beim Abrufen der Orte')
        setLoading(false)
      }
    }
    fetchPOIs()
    return () => controller.abort()
  }, [selected, latitude, longitude, radius])

  return { pois, loading, error }
}

export type { POI }

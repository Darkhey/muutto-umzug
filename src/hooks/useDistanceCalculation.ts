import { useState, useMemo } from 'react'
import { haversineDistance } from '@/lib/distance'
import { getDistanceFunFact } from '@/lib/funfacts'

export function useDistanceCalculation() {
  const [oldCoords, setOldCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [newCoords, setNewCoords] = useState<{ lat: number; lon: number } | null>(null)

  const distanceKm = useMemo(() => {
    if (oldCoords && newCoords) {
      return Math.round(
        haversineDistance(
          oldCoords.lat,
          oldCoords.lon,
          newCoords.lat,
          newCoords.lon
        )
      )
    }
    return null
  }, [oldCoords, newCoords])

  const distanceFact = useMemo(() => {
    if (distanceKm != null) {
      return getDistanceFunFact(distanceKm)
    }
    return null
  }, [distanceKm])

  return { oldCoords, newCoords, setOldCoords, setNewCoords, distanceKm, distanceFact }
}

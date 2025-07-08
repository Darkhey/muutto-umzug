
import { useEffect } from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { useHouseholds } from '@/hooks/useHouseholds'
import { HorizontalTimelineView } from '@/components/timeline/HorizontalTimelineView'

const Timeline = () => {
  const { households } = useHouseholds()
  const householdId = Array.isArray(households) && households.length > 0 ? households[0].id : undefined
  const { timelineItems, loading, error } = useTimeline(householdId)

  useEffect(() => {}, [householdId])

  if (!householdId || !households || households.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-center text-gray-500">Kein Haushalt ausgewählt</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lade Timeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>Fehler beim Laden der Timeline:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <HorizontalTimelineView household={households[0]} />
    </div>
  )
}

export default Timeline

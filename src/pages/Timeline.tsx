
import { useEffect } from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { useHouseholds } from '@/hooks/useHouseholds'
import { SimpleTimelineView } from '@/components/timeline/SimpleTimelineView'

const Timeline = () => {
  const { households } = useHouseholds()
  const householdId = Array.isArray(households) && households.length > 0 ? households[0].id : undefined
  const { timelineItems, loading, error } = useTimeline(householdId)

  useEffect(() => {
    console.log('Timeline page - household ID:', householdId)
    console.log('Timeline page - items:', timelineItems)
    console.log('Timeline page - loading:', loading)
    console.log('Timeline page - error:', error)
  }, [householdId, timelineItems, loading, error])

  if (!householdId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Kein Haushalt ausgewählt</p>
            <p className="text-sm text-gray-500 mt-2">Bitte erstellen Sie zuerst einen Haushalt.</p>
          </div>
        </div>
      </div>
    )
  }

  const household = households?.[0]
  if (!household) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Haushalt nicht gefunden</p>
          </div>
        </div>
      </div>
    )
  }

  return <SimpleTimelineView household={household} />
}

export default Timeline

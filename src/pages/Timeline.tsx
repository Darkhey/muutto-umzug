import { useEffect } from 'react'
import { useTimeline } from '@/hooks/useTimeline'
import { useHouseholds } from '@/hooks/useHouseholds'

const Timeline = () => {
  const { households } = useHouseholds()
  const householdId = Array.isArray(households) && households.length > 0 ? households[0].id : undefined
  const { timelineItems, loading, error } = useTimeline(householdId)

  useEffect(() => {}, [householdId])

  if (!householdId) {
    return <p className="text-center">Kein Haushalt ausgewählt</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Timeline</h1>
      {loading && <p>Lädt...</p>}
      {error && <div className="text-red-500">Fehler beim Laden der Timeline: {error.message}</div>}
      <ul className="space-y-2">
        {!loading && timelineItems.length === 0 && (
          <li className="text-center text-gray-500">Keine Aufgaben gefunden</li>
        )}
        {timelineItems.map((task) => (
          <li key={task.id} className="border rounded p-2">
            <div className="flex justify-between">
              <span>{task.title}</span>
              <span>{task.start ?? 'Kein Datum'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Timeline

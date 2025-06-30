import { useAuth } from '@/contexts/AuthContext'
import { useTimeline } from '@/hooks/useTimeline'
import { useEffect } from 'react'

const Timeline = () => {
  const { currentHousehold } = useAuth()
  const householdId = currentHousehold?.id
  const { timelineItems, loading, updateTaskDueDate } = useTimeline(householdId)


  if (!householdId) {
    return <p className="text-center">Kein Haushalt ausgewählt</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Timeline</h1>
      {loading && <p>Lädt...</p>}
      <ul className="space-y-2">
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

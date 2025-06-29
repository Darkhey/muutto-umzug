import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useHouseholds } from '@/hooks/useHouseholds'
import { HouseholdCard } from './HouseholdCard'
import { ExtendedHousehold } from '@/types/household'
import { Plus, ArrowDownUp, Calendar, AlphabeticalSortingAscending } from 'lucide-react'
import { HouseholdMergerButton } from '../dashboard/HouseholdMergerButton'
import { supabase } from '@/integrations/supabase/client'

interface HouseholdListProps {
  onCreateHousehold: () => void
  onOpenHousehold: (household: ExtendedHousehold) => void
  onOpenTaskList: (household: ExtendedHousehold) => void
}

type SortOption = 'date' | 'name'

export const HouseholdList = ({
  onCreateHousehold,
  onOpenHousehold,
  onOpenTaskList
}: HouseholdListProps) => {
  const { households, loading } = useHouseholds()
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [householdProgress, setHouseholdProgress] = useState<Record<string, number>>({})

  // Fetch progress for all households
  useEffect(() => {
    const fetchAllHouseholdProgress = async () => {
      if (households.length === 0) return

      try {
        // Single query for all households' tasks
        const { data: allTasks } = await supabase
          .from('tasks')
          .select('household_id, completed')
          .in('household_id', households.map(h => h.id))

        if (!allTasks) return

        // Group by household and calculate progress in memory
        const progressByHousehold = allTasks.reduce((acc, task) => {
          const { household_id, completed } = task
          if (!acc[household_id]) {
            acc[household_id] = { total: 0, completed: 0 }
          }
          acc[household_id].total++
          if (completed) acc[household_id].completed++
          return acc
        }, {} as Record<string, { total: number, completed: number }>)

        // Calculate progress percentages
        const progressMap: Record<string, number> = {}
        
        for (const household of households) {
          const stats = progressByHousehold[household.id]
          if (stats && stats.total > 0) {
            const completionRate = Math.round((stats.completed / stats.total) * 100)
            progressMap[household.id] = completionRate
          } else {
            progressMap[household.id] = 0
          }
        }

        setHouseholdProgress(progressMap)
      } catch (error) {
        console.error('Failed to fetch household progress:', error)
      }
    }

    fetchAllHouseholdProgress()
  }, [households])

  // Sort households based on selected option
  const sortedHouseholds = [...households].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.move_date).getTime() - new Date(b.move_date).getTime()
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (households.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-600 mb-4">Noch keine Haushalte vorhanden</p>
          <Button onClick={onCreateHousehold} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Ersten Haushalt erstellen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Deine Haushalte</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
          >
            {sortBy === 'date' ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Nach Datum
              </>
            ) : (
              <>
                <AlphabeticalSortingAscending className="mr-2 h-4 w-4" />
                Nach Name
              </>
            )}
          </Button>
          
          <HouseholdMergerButton />
          
          <Button 
            onClick={onCreateHousehold} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neuer Haushalt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedHouseholds.map(household => (
          <HouseholdCard
            key={household.id}
            household={household}
            progress={householdProgress[household.id] || 0}
            onOpenHousehold={onOpenHousehold}
            onOpenTaskList={onOpenTaskList}
          />
        ))}
      </div>
    </div>
  )
}
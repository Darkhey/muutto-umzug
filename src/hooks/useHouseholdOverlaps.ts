import { useState, useEffect, useMemo } from 'react'
import { useHouseholds } from './useHouseholds'
import { analyzeHouseholdOverlaps, type HouseholdOverlap, type OverlapAnalysis } from '@/utils/householdOverlaps'
import { ExtendedHousehold } from '@/types/household'

interface UseHouseholdOverlapsOptions {
  selectedHouseholdIds?: string[]
  showAllHouseholds?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseHouseholdOverlapsReturn {
  analysis: OverlapAnalysis | null
  loading: boolean
  error: string | null
  refresh: () => void
  resolveOverlap: (overlap: HouseholdOverlap) => Promise<void>
  getHouseholdsByOverlap: (overlap: HouseholdOverlap) => ExtendedHousehold[]
  getOverlapsByType: (type: HouseholdOverlap['type']) => HouseholdOverlap[]
  getOverlapsBySeverity: (severity: HouseholdOverlap['severity']) => HouseholdOverlap[]
}

export function useHouseholdOverlaps(options: UseHouseholdOverlapsOptions = {}): UseHouseholdOverlapsReturn {
  const {
    selectedHouseholdIds,
    showAllHouseholds = false,
    autoRefresh = false,
    refreshInterval = 30000 // 30 Sekunden
  } = options

  const { households, loading: householdsLoading, error: householdsError } = useHouseholds()
  const [analysis, setAnalysis] = useState<OverlapAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Filtere relevante Haushalte
  const relevantHouseholds = useMemo(() => {
    if (showAllHouseholds) {
      return households
    }
    if (selectedHouseholdIds && selectedHouseholdIds.length > 0) {
      return households.filter(h => selectedHouseholdIds.includes(h.id))
    }
    return households
  }, [households, showAllHouseholds, selectedHouseholdIds])

  // Führe Analyse durch
  const performAnalysis = useMemo(() => {
    if (relevantHouseholds.length === 0) {
      return null
    }
    
    try {
      return analyzeHouseholdOverlaps(relevantHouseholds)
    } catch (err) {
      console.error('Fehler bei der Überlappungsanalyse:', err)
      return null
    }
  }, [relevantHouseholds])

  // Update analysis when performAnalysis changes
  useEffect(() => {
    setAnalysis(performAnalysis)
    setError(householdsError)
  }, [performAnalysis, householdsError])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Refresh function
  const refresh = () => {
    setLastRefresh(new Date())
  }

  // Resolve overlap function
  const resolveOverlap = async (overlap: HouseholdOverlap): Promise<void> => {
    // Hier könnte man die Logik zum Lösen der Überlappung implementieren
    // z.B. API-Calls, Datenbank-Updates, etc.
    console.log('Resolving overlap:', overlap)
    
    // Simuliere async operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Refresh analysis after resolving
    refresh()
  }

  // Helper functions
  const getHouseholdsByOverlap = (overlap: HouseholdOverlap): ExtendedHousehold[] => {
    return relevantHouseholds.filter(h => overlap.affectedHouseholds.includes(h.id))
  }

  const getOverlapsByType = (type: HouseholdOverlap['type']): HouseholdOverlap[] => {
    return analysis?.overlaps.filter(o => o.type === type) || []
  }

  const getOverlapsBySeverity = (severity: HouseholdOverlap['severity']): HouseholdOverlap[] => {
    return analysis?.overlaps.filter(o => o.severity === severity) || []
  }

  return {
    analysis,
    loading: householdsLoading,
    error,
    refresh,
    resolveOverlap,
    getHouseholdsByOverlap,
    getOverlapsByType,
    getOverlapsBySeverity
  }
}

// Spezialisierte Hooks für häufige Anwendungsfälle
export function useAllHouseholdsOverlaps() {
  return useHouseholdOverlaps({ showAllHouseholds: true })
}

export function useSelectedHouseholdsOverlaps(selectedHouseholdIds: string[]) {
  return useHouseholdOverlaps({ selectedHouseholdIds })
}

export function useAutoRefreshingOverlaps(options: UseHouseholdOverlapsOptions = {}) {
  return useHouseholdOverlaps({ ...options, autoRefresh: true })
} 
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { useHouseholds } from '@/hooks/useHouseholds'
import { 
  analyzeHouseholdOverlaps, 
  generateOverlapSummary,
  type HouseholdOverlap,
  type OverlapAnalysis 
} from '@/utils/householdOverlaps'
import { ExtendedHousehold } from '@/types/household'

interface HouseholdOverlapViewerProps {
  selectedHouseholdIds?: string[]
  onResolveOverlap?: (overlap: HouseholdOverlap) => void
  showAllHouseholds?: boolean
}

export const HouseholdOverlapViewer = ({
  selectedHouseholdIds,
  onResolveOverlap,
  showAllHouseholds = false
}: HouseholdOverlapViewerProps) => {
  const { households, loading } = useHouseholds()
  const [analysis, setAnalysis] = useState<OverlapAnalysis | null>(null)
  const [expandedOverlaps, setExpandedOverlaps] = useState<Set<string>>(new Set())

  // Filtere Haushalte basierend auf Props
  const relevantHouseholds = showAllHouseholds 
    ? households 
    : selectedHouseholdIds 
      ? households.filter(h => selectedHouseholdIds.includes(h.id))
      : households

  // Führe Analyse durch
  useEffect(() => {
    if (relevantHouseholds.length > 0) {
      const result = analyzeHouseholdOverlaps(relevantHouseholds)
      setAnalysis(result)
    }
  }, [relevantHouseholds])

  const toggleOverlapExpansion = (overlapId: string) => {
    setExpandedOverlaps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(overlapId)) {
        newSet.delete(overlapId)
      } else {
        newSet.add(overlapId)
      }
      return newSet
    })
  }

  const getOverlapIcon = (type: HouseholdOverlap['type']) => {
    switch (type) {
      case 'move_date_conflict':
        return <Calendar className="h-4 w-4" />
      case 'address_overlap':
        return <MapPin className="h-4 w-4" />
      case 'member_duplicate':
        return <Users className="h-4 w-4" />
      case 'timeline_conflict':
        return <Clock className="h-4 w-4" />
      case 'resource_conflict':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: HouseholdOverlap['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: HouseholdOverlap['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Analysiere Haushalte...
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Keine Haushalte zur Analyse verfügbar
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Überlappungsanalyse
            {relevantHouseholds.length > 1 && (
              <Badge variant="secondary">
                {relevantHouseholds.length} Haushalte
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis.hasConflicts ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Keine Konflikte gefunden</AlertTitle>
              <AlertDescription>
                Alle analysierten Haushalte haben keine Überlappungen oder Konflikte.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={getSeverityColor('critical')}>
                  {analysis.criticalIssues} Kritisch
                </Badge>
                <Badge className={getSeverityColor('high')}>
                  {analysis.warnings} Warnungen
                </Badge>
              </div>
              
              {analysis.recommendations.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Empfehlungen</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detaillierte Überlappungen */}
      {analysis.overlaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detaillierte Konflikte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.overlaps.map((overlap, index) => {
                const overlapId = `${overlap.type}-${index}`
                const isExpanded = expandedOverlaps.has(overlapId)
                const affectedHouseholds = relevantHouseholds.filter(h => 
                  overlap.affectedHouseholds.includes(h.id)
                )

                return (
                  <div key={overlapId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getOverlapIcon(overlap.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{overlap.title}</h4>
                            <Badge className={getSeverityColor(overlap.severity)}>
                              {overlap.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {overlap.description}
                          </p>
                          
                          {isExpanded && (
                            <div className="space-y-3 mt-3">
                              <Separator />
                              
                              {/* Betroffene Haushalte */}
                              <div>
                                <h5 className="font-medium text-sm mb-2">Betroffene Haushalte:</h5>
                                <div className="space-y-2">
                                  {affectedHouseholds.map(household => (
                                    <div key={household.id} className="flex items-center gap-2 text-sm">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                      <span className="font-medium">{household.name}</span>
                                      <span className="text-gray-500">
                                        (Umzug: {new Date(household.move_date).toLocaleDateString('de-DE')})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Zusätzliche Daten */}
                              {overlap.data && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Details:</h5>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(overlap.data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOverlapExpansion(overlapId)}
                        >
                          {isExpanded ? 'Weniger' : 'Mehr'}
                        </Button>
                        
                        {onResolveOverlap && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onResolveOverlap(overlap)}
                          >
                            Lösen
                          </Button>
                        )}
                      </div>
                    </div>

                    {overlap.suggestedAction && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            <strong>Vorschlag:</strong> {overlap.suggestedAction}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zusammenfassung */}
      {analysis.hasConflicts && (
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {generateOverlapSummary(analysis)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
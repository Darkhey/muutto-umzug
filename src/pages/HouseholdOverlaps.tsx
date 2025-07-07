import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  RefreshCw,
  Filter
} from 'lucide-react'
import { HouseholdOverlapViewer } from '@/components/household/HouseholdOverlapViewer'
import { HouseholdList } from '@/components/households/HouseholdList'
import { useHouseholds } from '@/hooks/useHouseholds'
import { analyzeHouseholdOverlaps, type HouseholdOverlap } from '@/utils/householdOverlaps'
import { useToast } from '@/hooks/use-toast'

const HouseholdOverlaps = () => {
  const { households, loading } = useHouseholds()
  const { toast } = useToast()
  const [selectedHouseholdIds, setSelectedHouseholdIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Analysiere alle Haushalte
  const allHouseholdsAnalysis = analyzeHouseholdOverlaps(households)
  
  // Analysiere nur ausgewählte Haushalte
  const selectedHouseholds = households.filter(h => selectedHouseholdIds.includes(h.id))
  const selectedAnalysis = analyzeHouseholdOverlaps(selectedHouseholds)

  const handleHouseholdSelection = (householdId: string, isSelected: boolean) => {
    setSelectedHouseholdIds(prev => {
      if (isSelected) {
        return [...prev, householdId]
      } else {
        return prev.filter(id => id !== householdId)
      }
    })
  }

  const handleResolveOverlap = (overlap: HouseholdOverlap) => {
    toast({
      title: "Überlappung lösen",
      description: `Lösung für "${overlap.title}" wird implementiert...`,
    })
    // Hier könnte man einen Dialog zum Lösen der Überlappung öffnen
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          Lade Haushalte...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            Haushalts-Überlappungen
          </h1>
          <p className="text-gray-600 mt-2">
            Analysieren und lösen Sie Konflikte zwischen mehreren Haushalten
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
      </div>

      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamte Haushalte</p>
                <p className="text-2xl font-bold">{households.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kritische Konflikte</p>
                <p className="text-2xl font-bold text-red-600">{allHouseholdsAnalysis.criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnungen</p>
                <p className="text-2xl font-bold text-orange-600">{allHouseholdsAnalysis.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {allHouseholdsAnalysis.hasConflicts ? 'Konflikte' : 'OK'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="analysis">Detaillierte Analyse</TabsTrigger>
          <TabsTrigger value="selection">Haushalte auswählen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alle Haushalte Analyse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Analyse aller Haushalte
                <Badge variant="secondary">
                  {households.length} Haushalte
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!allHouseholdsAnalysis.hasConflicts ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Keine Konflikte gefunden</AlertTitle>
                  <AlertDescription>
                    Alle {households.length} Haushalte haben keine Überlappungen oder Konflikte.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge className={getSeverityColor('critical')}>
                      {allHouseholdsAnalysis.criticalIssues} Kritisch
                    </Badge>
                    <Badge className={getSeverityColor('high')}>
                      {allHouseholdsAnalysis.warnings} Warnungen
                    </Badge>
                  </div>
                  
                  {allHouseholdsAnalysis.recommendations.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Empfehlungen</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                          {allHouseholdsAnalysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={() => setActiveTab('analysis')}
                    className="w-full"
                  >
                    Detaillierte Analyse anzeigen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schnellauswahl für häufige Konflikte */}
          {allHouseholdsAnalysis.overlaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Häufige Konflikte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allHouseholdsAnalysis.overlaps.slice(0, 3).map((overlap, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{overlap.title}</h4>
                          <p className="text-sm text-gray-600">{overlap.description}</p>
                        </div>
                        <Badge className={getSeverityColor(overlap.severity)}>
                          {overlap.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <HouseholdOverlapViewer
            showAllHouseholds={true}
            onResolveOverlap={handleResolveOverlap}
          />
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Haushalte für detaillierte Analyse auswählen
                {selectedHouseholdIds.length > 0 && (
                  <Badge variant="secondary">
                    {selectedHouseholdIds.length} ausgewählt
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  {households.map(household => (
                    <div 
                      key={household.id} 
                      className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        selectedHouseholdIds.includes(household.id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleHouseholdSelection(
                        household.id, 
                        !selectedHouseholdIds.includes(household.id)
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedHouseholdIds.includes(household.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{household.name}</p>
                          <p className="text-sm text-gray-600">
                            Umzug: {new Date(household.move_date).toLocaleDateString('de-DE')}
                            {' '}• {household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedHouseholdIds.length > 1 && (
                  <div className="mt-6">
                    <HouseholdOverlapViewer
                      selectedHouseholdIds={selectedHouseholdIds}
                      onResolveOverlap={handleResolveOverlap}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HouseholdOverlaps 
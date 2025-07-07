import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, AlertTriangle, Home, Merge, Calendar } from 'lucide-react'
import { useHouseholds } from '@/hooks/useHouseholds'
import { useHouseholdMerger } from '@/hooks/useHouseholdMerger'
import { getDaysUntilMove } from '@/utils/moveDate'
import { Separator } from '@/components/ui/separator'
import { ExtendedHousehold } from '@/types/household'
import { HouseholdOverlapViewer } from './HouseholdOverlapViewer'
import { analyzeHouseholdOverlaps, type HouseholdOverlap } from '@/utils/householdOverlaps'

interface HouseholdMergerProps {
  onBack: () => void
  onComplete: () => void
  preselectedSourceId?: string
  preselectedDestinationId?: string
}

export const HouseholdMerger = ({
  onBack,
  onComplete,
  preselectedSourceId,
  preselectedDestinationId
}: HouseholdMergerProps) => {
  const { households, loading: householdsLoading } = useHouseholds()
  const { mergeHouseholds, loading: mergeLoading } = useHouseholdMerger()
  
  const [sourceHouseholdIds, setSourceHouseholdIds] = useState<string[]>(
    preselectedSourceId ? [preselectedSourceId] : []
  )
  const [destinationHouseholdId, setDestinationHouseholdId] = useState<string>(
    preselectedDestinationId || ''
  )
  const [confirmStep, setConfirmStep] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showOverlapAnalysis, setShowOverlapAnalysis] = useState(false)

  // Filter out households that are already selected as source
  const availableDestinationHouseholds = households.filter(
    h => !sourceHouseholdIds.includes(h.id)
  )

  // Get full household objects for selected IDs
  const selectedSourceHouseholds = households.filter(h => 
    sourceHouseholdIds.includes(h.id)
  )
  
  const selectedDestinationHousehold = households.find(
    h => h.id === destinationHouseholdId
  )

  // Analyze overlaps for selected households
  const allSelectedHouseholds = [...selectedSourceHouseholds]
  if (selectedDestinationHousehold) {
    allSelectedHouseholds.push(selectedDestinationHousehold)
  }
  const overlapAnalysis = analyzeHouseholdOverlaps(allSelectedHouseholds)

  // Handle source household selection
  const toggleSourceHousehold = (householdId: string) => {
    setSourceHouseholdIds(prev => {
      if (prev.includes(householdId)) {
        return prev.filter(id => id !== householdId)
      } else {
        return [...prev, householdId]
      }
    })
    
    // If the selected household was previously set as destination, clear it
    if (destinationHouseholdId === householdId) {
      setDestinationHouseholdId('')
    }
    
    // Reset validation error when selection changes
    setValidationError(null)
  }

  // Handle destination household selection
  const handleDestinationChange = (value: string) => {
    setDestinationHouseholdId(value)
    setValidationError(null)
  }

  // Validate selections before proceeding to confirmation
  const validateAndProceed = () => {
    if (sourceHouseholdIds.length === 0) {
      setValidationError('Bitte wähle mindestens einen Quell-Haushalt aus')
      return
    }
    
    if (!destinationHouseholdId) {
      setValidationError('Bitte wähle einen Ziel-Haushalt aus')
      return
    }
    
    setConfirmStep(true)
  }

  // Handle the merge operation
  const handleMerge = async () => {
    try {
      await mergeHouseholds(sourceHouseholdIds, destinationHouseholdId)
      onComplete()
    } catch (error) {
      // Error is already handled in the hook
      setConfirmStep(false)
    }
  }

  // Reset to selection step
  const backToSelection = () => {
    setConfirmStep(false)
  }

  if (householdsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If there are less than 2 households, merging is not possible
  if (households.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5 text-blue-600" />
            Haushalte zusammenführen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Nicht genügend Haushalte</AlertTitle>
            <AlertDescription>
              Du benötigst mindestens zwei Haushalte, um eine Zusammenführung durchzuführen.
            </AlertDescription>
          </Alert>
          <Button onClick={onBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Merge className="h-5 w-5 text-blue-600" />
          Haushalte zusammenführen
        </CardTitle>
        <CardDescription>
          Führe mehrere Haushalte zu einem gemeinsamen Haushalt zusammen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirmStep ? (
          // Selection Step
          <div className="space-y-6">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">1. Quell-Haushalte auswählen</h3>
              <p className="text-sm text-gray-600">
                Wähle die Haushalte aus, die in den Ziel-Haushalt überführt werden sollen.
                Diese Haushalte werden nach der Zusammenführung gelöscht.
              </p>
              
              <div className="grid gap-3">
                {households.map(household => (
                  <div 
                    key={household.id} 
                    className={`p-3 border rounded-lg flex items-center justify-between ${
                      sourceHouseholdIds.includes(household.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`source-${household.id}`}
                        checked={sourceHouseholdIds.includes(household.id)}
                        onCheckedChange={() => toggleSourceHousehold(household.id)}
                        disabled={household.id === destinationHouseholdId}
                      />
                      <div>
                        <Label 
                          htmlFor={`source-${household.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {household.name}
                        </Label>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          Umzug am {new Date(household.move_date).toLocaleDateString('de-DE')}
                          <span className="text-xs">
                            ({household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {household.id === destinationHouseholdId && (
                      <Badge className="bg-green-100 text-green-800">
                        Ziel-Haushalt
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. Ziel-Haushalt auswählen</h3>
              <p className="text-sm text-gray-600">
                Wähle den Haushalt aus, in den alle Mitglieder und Aufgaben übertragen werden sollen.
                Dieser Haushalt bleibt bestehen.
              </p>
              
              <Select
                value={destinationHouseholdId}
                onValueChange={handleDestinationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ziel-Haushalt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableDestinationHouseholds.map(household => (
                    <SelectItem key={household.id} value={household.id}>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        {household.name} ({new Date(household.move_date).toLocaleDateString('de-DE')})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button 
                onClick={validateAndProceed}
                disabled={sourceHouseholdIds.length === 0 || !destinationHouseholdId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Confirmation Step
          <div className="space-y-6">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Achtung: Diese Aktion kann nicht rückgängig gemacht werden</AlertTitle>
              <AlertDescription>
                Die ausgewählten Quell-Haushalte werden nach der Zusammenführung gelöscht.
                Alle Mitglieder und Aufgaben werden in den Ziel-Haushalt übertragen.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zusammenfassung</h3>
              
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-2">Ziel-Haushalt</h4>
                  {selectedDestinationHousehold && (
                    <div className="space-y-1">
                      <p className="font-semibold">{selectedDestinationHousehold.name}</p>
                      <p className="text-sm">
                        Umzug am {new Date(selectedDestinationHousehold.move_date).toLocaleDateString('de-DE')}
                        {' '}(in {getDaysUntilMove(selectedDestinationHousehold.move_date)} Tagen)
                      </p>
                      <p className="text-sm">
                        {selectedDestinationHousehold.household_size} {selectedDestinationHousehold.household_size === 1 ? 'Person' : 'Personen'}
                        {selectedDestinationHousehold.children_count > 0 && `, ${selectedDestinationHousehold.children_count} Kinder`}
                        {selectedDestinationHousehold.pets_count > 0 && `, ${selectedDestinationHousehold.pets_count} Haustiere`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Quell-Haushalte ({selectedSourceHouseholds.length})</h4>
                  <div className="space-y-2">
                    {selectedSourceHouseholds.map(household => (
                      <div key={household.id} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{household.name}</p>
                        <p className="text-xs text-gray-600">
                          Umzug am {new Date(household.move_date).toLocaleDateString('de-DE')}
                          {' '}• {household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Überlappungsanalyse */}
            {allSelectedHouseholds.length > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Überlappungsanalyse</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOverlapAnalysis(!showOverlapAnalysis)}
                  >
                    {showOverlapAnalysis ? 'Ausblenden' : 'Anzeigen'}
                  </Button>
                </div>
                
                {showOverlapAnalysis && (
                  <HouseholdOverlapViewer
                    selectedHouseholdIds={allSelectedHouseholds.map(h => h.id)}
                    onResolveOverlap={(overlap) => {
                      // Hier könnte man eine Dialog zum Lösen der Überlappung öffnen
                      console.log('Resolve overlap:', overlap)
                    }}
                  />
                )}
                
                {!showOverlapAnalysis && overlapAnalysis.hasConflicts && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Überlappungen gefunden</AlertTitle>
                    <AlertDescription>
                      {overlapAnalysis.criticalIssues} kritische und {overlapAnalysis.warnings} Warnungen in den ausgewählten Haushalten.
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                        onClick={() => setShowOverlapAnalysis(true)}
                      >
                        Details anzeigen
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Konfliktlösung
              </h4>
              <p className="text-sm text-yellow-800 mb-2">
                Bei Konflikten (z.B. gleiche E-Mail-Adresse) gilt das Prinzip &quot;first come wins&quot;:
              </p>
              <ul className="text-sm text-yellow-800 list-disc pl-5 space-y-1">
                <li>Mitglieder, die bereits im Ziel-Haushalt existieren, bleiben unverändert</li>
                <li>Nur neue, einzigartige Mitglieder werden hinzugefügt</li>
                <li>Alle Aufgaben werden übertragen, auch wenn sie ähnlich sind</li>
              </ul>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={backToSelection} disabled={mergeLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button 
                onClick={handleMerge}
                disabled={mergeLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {mergeLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Wird zusammengeführt...
                  </>
                ) : (
                  <>
                    <Merge className="mr-2 h-4 w-4" />
                    Haushalte zusammenführen
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
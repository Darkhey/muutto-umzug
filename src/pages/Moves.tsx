import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, ArrowLeft, Link as LinkIcon, Crown } from 'lucide-react'
import { useMoves } from '@/hooks/useMoves'
import { MoveMemberManagement } from '@/components/moves/MoveMemberManagement'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHouseholds } from '@/hooks/useHouseholds'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { useToast } from '@/hooks/use-toast'

const Moves = () => {
  const { moves, loading, error, createMove, linkHouseholdToMove } = useMoves()
  const { households, loading: householdsLoading } = useHouseholds()
  const { status: premiumStatus } = usePremiumStatus()
  const { toast } = useToast()

  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null)
  const [showCreateMoveDialog, setShowCreateMoveDialog] = useState(false)
  const [newMoveName, setNewMoveName] = useState('')
  const [newMoveDate, setNewMoveDate] = useState('')
  const [newMoveInitialHouseholds, setNewMoveInitialHouseholds] = useState<string[]>([])

  const [showLinkHouseholdDialog, setShowLinkHouseholdDialog] = useState(false)
  const [householdToLink, setHouseholdToLink] = useState<string | null>(null)

  const selectedMove = moves.find(move => move.id === selectedMoveId)

  const handleCreateMove = async () => {
    if (!newMoveName || !newMoveDate) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und ein Datum für den Umzug an.",
        variant: "destructive"
      })
      return
    }

    if (!premiumStatus?.is_premium && newMoveInitialHouseholds.length > 1) {
      toast({
        title: "Premium erforderlich",
        description: "Nur Premium-Nutzer können Umzüge mit mehreren Haushalten erstellen.",
        variant: "destructive"
      })
      return
    }

    try {
      await createMove({
        name: newMoveName,
        move_date: newMoveDate,
        initialHouseholdIds: newMoveInitialHouseholds
      })
      setNewMoveName('')
      setNewMoveDate('')
      setNewMoveInitialHouseholds([])
      setShowCreateMoveDialog(false)
    } catch (err) {
      console.error("Error creating move:", err)
      toast({
        title: "Fehler beim Erstellen des Umzugs",
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleLinkHousehold = async () => {
    if (!selectedMoveId || !householdToLink) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Umzug und einen Haushalt aus.",
        variant: "destructive"
      })
      return
    }

    if (!premiumStatus?.is_premium) {
      toast({
        title: "Premium erforderlich",
        description: "Nur Premium-Nutzer können Haushalte mit einem Umzug verknüpfen.",
        variant: "destructive"
      })
      return
    }

    try {
      await linkHouseholdToMove(selectedMoveId, householdToLink)
      setHouseholdToLink(null)
      setShowLinkHouseholdDialog(false)
    } catch (err) {
      console.error("Error linking household:", err)
      toast({
        title: "Fehler beim Verknüpfen des Haushalts",
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  if (loading || householdsLoading) {
    return <div className="text-center">Lade Daten...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Fehler beim Laden der Umzüge: {error}</div>
  }

  if (selectedMove) {
    const unlinkedHouseholds = households.filter(h => !selectedMove.households?.includes(h.id))
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setSelectedMoveId(null)} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{selectedMove.name}</h1>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Umzugsdetails</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Umzugsdatum: {new Date(selectedMove.move_date).toLocaleDateString()}</p>
              <p>Verknüpfte Haushalte: {selectedMove.households?.length || 0}</p>
              {/* Link Household Button */}
              {premiumStatus?.is_premium ? (
                <Dialog open={showLinkHouseholdDialog} onOpenChange={setShowLinkHouseholdDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Haushalt verknüpfen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Haushalt verknüpfen</DialogTitle>
                      <DialogDescription>Wähle einen Haushalt, der mit diesem Umzug verknüpft werden soll.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="household-to-link">Haushalt</Label>
                        <Select
                          value={householdToLink || ''}
                          onValueChange={(value) => setHouseholdToLink(value)}
                        >
                          <SelectTrigger id="household-to-link">
                            <SelectValue placeholder="Haushalt auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {unlinkedHouseholds.length === 0 ? (
                              <SelectItem value="no-households" disabled>Keine weiteren Haushalte zum Verknüpfen</SelectItem>
                            ) : (
                              unlinkedHouseholds.map(h => (
                                <SelectItem key={h.id} value={h.id}>
                                  {h.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowLinkHouseholdDialog(false)}>Abbrechen</Button>
                      <Button onClick={handleLinkHousehold} disabled={!householdToLink || unlinkedHouseholds.length === 0}>Verknüpfen</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Card className="mt-4 border-yellow-500 bg-yellow-50/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">Premium-Funktion</CardTitle>
                    <Crown className="h-4 w-4 text-yellow-800" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-yellow-700">Verknüpfe mehrere Haushalte mit diesem Umzug, um die Koordination zu vereinfachen. Nur für Premium-Nutzer verfügbar.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
          <MoveMemberManagement moveId={selectedMove.id} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meine Umzüge</h1>
        <Dialog open={showCreateMoveDialog} onOpenChange={setShowCreateMoveDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Neuen Umzug starten
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Umzug starten</DialogTitle>
              <DialogDescription>Erstelle einen neuen Umzug, der von mehreren Haushalten koordiniert werden kann.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="move-name">Umzugsname</Label>
                <Input id="move-name" value={newMoveName} onChange={(e) => setNewMoveName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="move-date">Umzugsdatum</Label>
                <Input id="move-date" type="date" value={newMoveDate} onChange={(e) => setNewMoveDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="initial-households">Initiale Haushalte (optional)</Label>
                {premiumStatus?.is_premium ? (
                  // Multi-select for premium users
                  <div className="space-y-2">
                    <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                      {householdsLoading ? (
                        <div className="text-sm text-muted-foreground">Lädt Haushalte...</div>
                      ) : households.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Keine Haushalte verfügbar</div>
                      ) : (
                        households.map(h => (
                          <label key={h.id} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              checked={newMoveInitialHouseholds.includes(h.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewMoveInitialHouseholds([...newMoveInitialHouseholds, h.id])
                                } else {
                                  setNewMoveInitialHouseholds(newMoveInitialHouseholds.filter(id => id !== h.id))
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{h.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {newMoveInitialHouseholds.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Ausgewählt: {newMoveInitialHouseholds.length} Haushalt(e)
                      </div>
                    )}
                  </div>
                ) : (
                  // Single select for non-premium users
                  <Select
                    onValueChange={(value) => setNewMoveInitialHouseholds(value ? [value] : [])}
                    value={newMoveInitialHouseholds[0] || ''}
                  >
                    <SelectTrigger id="initial-households">
                      <SelectValue placeholder="Haushalt auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {householdsLoading ? (
                        <SelectItem value="loading" disabled>Lädt Haushalte...</SelectItem>
                      ) : (
                        households.map(h => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {!premiumStatus?.is_premium && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Crown className="h-3 w-3 mr-1 text-yellow-600" />
                    Wähle mehrere Haushalte mit Premium aus.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateMoveDialog(false)}>Abbrechen</Button>
              <Button onClick={handleCreateMove} disabled={!newMoveName || !newMoveDate || (newMoveInitialHouseholds.length > 1 && !premiumStatus?.is_premium)}>Umzug starten</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {moves.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Keine Umzüge gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Du hast noch keine gemeinsamen Umzüge erstellt. Starte jetzt einen neuen Umzug, um mehrere Haushalte zu koordinieren.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {moves.map((move) => (
            <Card key={move.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMoveId(move.id)}>
              <CardHeader>
                <CardTitle>{move.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Umzugsdatum: {new Date(move.move_date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p>Verknüpfte Haushalte: {move.households?.length || 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Moves

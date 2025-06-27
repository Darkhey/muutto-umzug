
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Users, Home, MapPin, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react'
import { PropertyType, HouseholdRole } from '@/types/database'

interface OnboardingData {
  householdName: string
  moveDate: string
  householdSize: number
  childrenCount: number
  petsCount: number
  propertyType: PropertyType | ''
  postalCode: string
  oldAddress: string
  newAddress: string
  livingSpace: number
  rooms: number
  furnitureVolume: number
  members: Array<{
    name: string
    email: string
    role: HouseholdRole | ''
  }>
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

export const OnboardingFlow = ({ onComplete, onSkip }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    householdName: '',
    moveDate: '',
    householdSize: 1,
    childrenCount: 0,
    petsCount: 0,
    propertyType: '',
    postalCode: '',
    oldAddress: '',
    newAddress: '',
    livingSpace: 0,
    rooms: 0,
    furnitureVolume: 0,
    members: []
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const addMember = () => {
    setData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', email: '', role: '' }]
    }))
  }

  const updateMember = (index: number, field: keyof OnboardingData['members'][0], value: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const removeMember = (index: number) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.householdName.trim() && data.moveDate
      case 2:
        return data.householdSize > 0
      case 3:
        return (
          data.propertyType &&
          data.postalCode.trim() &&
          data.newAddress.trim() &&
          data.livingSpace > 0 &&
          data.rooms > 0
        )
      case 4:
        return true // Members are optional
      case 5:
        return true // Review step
      default:
        return false
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const getRoleDisplayName = (role: HouseholdRole) => {
    const names = {
      vertragsmanager: '🧠 Vertragsmanager',
      packbeauftragte: '📦 Packbeauftragte', 
      finanzperson: '💰 Finanzperson',
      renovierer: '🧽 Renovierer',
      haustierverantwortliche: '🐾 Haustierverantwortliche'
    }
    return names[role]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen bei muutto! 🏠
          </h1>
          <p className="text-gray-600">
            Lass uns deinen Umzug gemeinsam planen
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Schritt {currentStep} von {totalSteps}</span>
            <span>{Math.round(progress)}% abgeschlossen</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <><Home className="h-5 w-5" /> Haushalt benennen</>}
              {currentStep === 2 && <><Users className="h-5 w-5" /> Haushaltsgröße</>}
              {currentStep === 3 && <><MapPin className="h-5 w-5" /> Wohnsituation</>}
              {currentStep === 4 && <><Users className="h-5 w-5" /> Mitglieder einladen</>}
              {currentStep === 5 && <><Calendar className="h-5 w-5" /> Zusammenfassung</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Household Name & Move Date */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="householdName">Wie soll dein Haushalt heißen?</Label>
                  <Input
                    id="householdName"
                    value={data.householdName}
                    onChange={(e) => updateData({ householdName: e.target.value })}
                    placeholder="z.B. Familie Müller Umzug"
                  />
                </div>
                
                <div>
                  <Label htmlFor="moveDate">Wann ist dein geplanter Umzugstermin?</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={data.moveDate}
                    onChange={(e) => updateData({ moveDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Household Size */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Wie viele Personen leben in deinem Haushalt?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ householdSize: Math.max(1, data.householdSize - 1) })}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{data.householdSize}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ householdSize: data.householdSize + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Anzahl Kinder im Haushalt</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ childrenCount: Math.max(0, data.childrenCount - 1) })}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{data.childrenCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ childrenCount: data.childrenCount + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Anzahl Haustiere</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ petsCount: Math.max(0, data.petsCount - 1) })}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{data.petsCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateData({ petsCount: data.petsCount + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Property & Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Mietwohnung oder Eigentum?</Label>
                  <Select value={data.propertyType} onValueChange={(value: PropertyType) => updateData({ propertyType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle deine Wohnsituation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miete">🏠 Mietwohnung</SelectItem>
                      <SelectItem value="eigentum">🏡 Eigentum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postleitzahl deiner neuen Adresse</Label>
                  <Input
                    id="postalCode"
                    value={data.postalCode}
                    onChange={(e) => updateData({ postalCode: e.target.value })}
                    placeholder="12345"
                    maxLength={5}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Hilft uns dabei, regionale Fristen und Ämter zu finden
                  </p>
                </div>

                <div>
                  <Label htmlFor="oldAddress">Aktuelle Adresse (optional)</Label>
                  <Input
                    id="oldAddress"
                    value={data.oldAddress}
                    onChange={(e) => updateData({ oldAddress: e.target.value })}
                    placeholder="Straße, Hausnummer, Ort"
                  />
                </div>

                <div>
                  <Label htmlFor="newAddress">Neue Adresse</Label>
                  <Input
                    id="newAddress"
                    value={data.newAddress}
                    onChange={(e) => updateData({ newAddress: e.target.value })}
                    placeholder="Straße, Hausnummer, Ort"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="livingSpace">Wohnfläche (m²)</Label>
                    <Input
                      id="livingSpace"
                      type="number"
                      min={0}
                      value={data.livingSpace}
                      onChange={(e) => updateData({ livingSpace: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rooms">Zimmer</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min={0}
                      value={data.rooms}
                      onChange={(e) => updateData({ rooms: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="furnitureVolume">Möbelvolumen (m³)</Label>
                    <Input
                      id="furnitureVolume"
                      type="number"
                      min={0}
                      value={data.furnitureVolume}
                      onChange={(e) => updateData({ furnitureVolume: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Members */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Mitglieder deines Haushalts (optional)</Label>
                  <p className="text-sm text-gray-600">
                    Lade Familie oder Mitbewohner ein, um Aufgaben gemeinsam zu verwalten
                  </p>
                </div>

                {data.members.map((member, index) => (
                  <Card key={index} className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="E-Mail"
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Select 
                          value={member.role} 
                          onValueChange={(value: HouseholdRole) => updateMember(index, 'role', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Rolle wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vertragsmanager">🧠 Vertragsmanager</SelectItem>
                            <SelectItem value="packbeauftragte">📦 Packbeauftragte</SelectItem>
                            <SelectItem value="finanzperson">💰 Finanzperson</SelectItem>
                            <SelectItem value="renovierer">🧽 Renovierer</SelectItem>
                            <SelectItem value="haustierverantwortliche">🐾 Haustierverantwortliche</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeMember(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addMember} className="w-full">
                  + Mitglied hinzufügen
                </Button>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alles bereit für deinen Umzug!</h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div><strong>Haushalt:</strong> {data.householdName}</div>
                  <div><strong>Umzugsdatum:</strong> {new Date(data.moveDate).toLocaleDateString('de-DE')}</div>
                  <div><strong>Haushaltsgröße:</strong> {data.householdSize} Personen</div>
                  {data.childrenCount > 0 && <div><strong>Kinder:</strong> {data.childrenCount}</div>}
                  {data.petsCount > 0 && <div><strong>Haustiere:</strong> {data.petsCount}</div>}
                  <div><strong>Wohnsituation:</strong> {data.propertyType === 'miete' ? 'Mietwohnung' : 'Eigentum'}</div>
                  <div><strong>PLZ:</strong> {data.postalCode}</div>
                  {data.oldAddress && <div><strong>Aktuelle Adresse:</strong> {data.oldAddress}</div>}
                  <div><strong>Neue Adresse:</strong> {data.newAddress}</div>
                  <div><strong>Wohnfläche:</strong> {data.livingSpace} m²</div>
                  <div><strong>Zimmer:</strong> {data.rooms}</div>
                  <div><strong>Möbelvolumen:</strong> {data.furnitureVolume} m³</div>

                  {data.members.length > 0 && (
                    <div>
                      <strong>Mitglieder:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {data.members.map((member, index) => (
                          <Badge key={index} variant="secondary">
                            {member.name} {member.role && `(${getRoleDisplayName(member.role as HouseholdRole)})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Was passiert als nächstes?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Du erhältst eine personalisierte Umzugs-Checkliste</li>
                    <li>• Wichtige Fristen werden automatisch berechnet</li>
                    <li>• Alle Mitglieder können Aufgaben übernehmen</li>
                    <li>• Du bekommst rechtliche Hinweise für deinen Umzug</li>
                  </ul>
                </div>

                <div className="text-xs text-gray-600">
                  Deine Daten werden ausschließlich für die Organisation des Umzugs genutzt und niemals für Werbezwecke verwendet. Wir bemühen uns, sie sicher zu speichern.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                )}
                <Button variant="ghost" onClick={onSkip}>
                  Überspringen
                </Button>
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceed()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Weiter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Haushalt erstellen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

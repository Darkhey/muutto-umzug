import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { useDistanceCalculation } from '@/hooks/useDistanceCalculation'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Users, Home, MapPin, CreditCard, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { PropertyType, HouseholdRole } from '@/types/database'
import { HOUSEHOLD_ROLES } from '@/config/roles'
import { PROPERTY_TYPES } from '@/config/app'

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
  const { setOldCoords, setNewCoords, distanceKm, distanceFact } = useDistanceCalculation()

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
          data.livingSpace >= 0 &&
          data.rooms >= 0
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
    const roleConfig = HOUSEHOLD_ROLES.find(r => r.key === role)
    return roleConfig ? `${roleConfig.icon} ${roleConfig.name}` : role
  }

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (step === currentStep) {
      switch (step) {
        case 1: return <Home className="h-5 w-5 text-blue-600" />
        case 2: return <Users className="h-5 w-5 text-blue-600" />
        case 3: return <MapPin className="h-5 w-5 text-blue-600" />
        case 4: return <Users className="h-5 w-5 text-blue-600" />
        case 5: return <Calendar className="h-5 w-5 text-blue-600" />
        default: return <div className="h-5 w-5 rounded-full bg-blue-600" />
      }
    }
    return <div className="h-5 w-5 rounded-full bg-gray-300" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen bei muutto! 🏠
          </h1>
          <p className="text-gray-600">
            Lass uns deinen Umzug gemeinsam planen
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 ${
                  step <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                }`}>
                  {getStepIcon(step)}
                </div>
                <span className={`text-xs ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  Schritt {step}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Schritt {currentStep} von {totalSteps}</span>
            <span>{Math.round(progress)}% abgeschlossen</span>
          </div>
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
            <CardDescription>
              {currentStep === 1 && "Gib deinem Haushalt einen Namen und wähle das Umzugsdatum"}
              {currentStep === 2 && "Wie viele Personen, Kinder und Haustiere ziehen um?"}
              {currentStep === 3 && "Erzähl uns mehr über deine Wohnsituation"}
              {currentStep === 4 && "Lade Familie oder Mitbewohner ein (optional)"}
              {currentStep === 5 && "Überprüfe deine Angaben vor der Erstellung"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Household Name & Move Date */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="householdName">Wie soll dein Haushalt heißen?</Label>
                  <Input
                    id="householdName"
                    value={data.householdName}
                    onChange={(e) => updateData({ householdName: e.target.value })}
                    placeholder="z.B. Familie Müller Umzug"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Wähle einen Namen, der für alle Mitglieder erkennbar ist
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="moveDate">Wann ist dein geplanter Umzugstermin?</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={data.moveDate}
                    onChange={(e) => updateData({ moveDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Das Datum hilft uns dabei, alle Fristen richtig zu berechnen
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Household Size */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Label className="text-lg">Wie viele Personen leben in deinem Haushalt?</Label>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateData({ householdSize: Math.max(1, data.householdSize - 1) })}
                      disabled={data.householdSize <= 1}
                    >
                      -
                    </Button>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">{data.householdSize}</div>
                      <div className="text-sm text-gray-600">
                        {data.householdSize === 1 ? 'Person' : 'Personen'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateData({ householdSize: data.householdSize + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <Label className="text-lg">Anzahl Kinder im Haushalt</Label>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => updateData({ childrenCount: Math.max(0, data.childrenCount - 1) })}
                        disabled={data.childrenCount <= 0}
                      >
                        -
                      </Button>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{data.childrenCount}</div>
                        <div className="text-sm text-gray-600">Kinder</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => updateData({ childrenCount: data.childrenCount + 1 })}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Label className="text-lg">Anzahl Haustiere</Label>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => updateData({ petsCount: Math.max(0, data.petsCount - 1) })}
                        disabled={data.petsCount <= 0}
                      >
                        -
                      </Button>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{data.petsCount}</div>
                        <div className="text-sm text-gray-600">Haustiere</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => updateData({ petsCount: data.petsCount + 1 })}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Property & Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Mietwohnung oder Eigentum?</Label>
                  <Select value={data.propertyType} onValueChange={(value: PropertyType) => updateData({ propertyType: value })}>
                    <SelectTrigger className="text-lg">
                      <SelectValue placeholder="Wähle deine Wohnsituation" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((pt) => (
                        <SelectItem key={pt.key} value={pt.key}>
                          {pt.icon} {pt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postleitzahl deiner neuen Adresse</Label>
                  <Input
                    id="postalCode"
                    value={data.postalCode}
                    onChange={(e) => updateData({ postalCode: e.target.value })}
                    placeholder="12345"
                    maxLength={5}
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Hilft uns dabei, regionale Fristen und Ämter zu finden
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="oldAddress">Aktuelle Adresse (optional)</Label>
                    <AddressAutocomplete
                      value={data.oldAddress}
                      onChange={(val) => updateData({ oldAddress: val })}
                      onSelect={setOldCoords}
                      placeholder="Straße, Hausnummer, Ort"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newAddress">Neue Adresse</Label>
                    <AddressAutocomplete
                      value={data.newAddress}
                      onChange={(val) => updateData({ newAddress: val })}
                      onSelect={setNewCoords}
                      placeholder="Straße, Hausnummer, Ort"
                    />
                    {distanceKm != null && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Entfernung ca. {distanceKm} km – {distanceFact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="livingSpace">Wohnfläche (m²)</Label>
                    <Input
                      id="livingSpace"
                      type="number"
                      min={0}
                      value={data.livingSpace || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        updateData({ livingSpace: Number.isNaN(val) ? 0 : val })
                      }}
                      placeholder="80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Zimmer</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min={0}
                      value={data.rooms || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        updateData({ rooms: Number.isNaN(val) ? 0 : val })
                      }}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="furnitureVolume">Möbelvolumen (m³)</Label>
                    <Input
                      id="furnitureVolume"
                      type="number"
                      min={0}
                      value={data.furnitureVolume || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        updateData({ furnitureVolume: Number.isNaN(val) ? 0 : val })
                      }}
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Members */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Label className="text-lg">Mitglieder deines Haushalts (optional)</Label>
                  <p className="text-gray-600 mt-2">
                    Lade Familie oder Mitbewohner ein, um Aufgaben gemeinsam zu verwalten
                  </p>
                </div>

                {data.members.map((member, index) => (
                  <Card key={index} className="p-4 bg-gray-50 border-2 border-dashed border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          placeholder="Max Mustermann"
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>E-Mail</Label>
                        <Input
                          placeholder="max@beispiel.de"
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Rolle (optional)</Label>
                        <Select 
                          value={member.role} 
                          onValueChange={(value: HouseholdRole) => updateMember(index, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Rolle wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Keine Rolle</SelectItem>
                            {HOUSEHOLD_ROLES.map((role) => (
                              <SelectItem key={role.key} value={role.key}>
                                {role.icon} {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeMember(index)}
                          className="w-full"
                        >
                          Entfernen
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addMember} className="w-full border-2 border-dashed">
                  <Users className="h-4 w-4 mr-2" />
                  Mitglied hinzufügen
                </Button>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    🎉 Alles bereit für deinen Umzug!
                  </h3>
                  <p className="text-gray-600">
                    Überprüfe deine Angaben und erstelle deinen Haushalt
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-blue-900">Haushalt:</strong>
                      <p className="text-blue-800">{data.householdName}</p>
                    </div>
                    <div>
                      <strong className="text-blue-900">Umzugsdatum:</strong>
                      <p className="text-blue-800">{new Date(data.moveDate).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div>
                      <strong className="text-blue-900">Haushaltsgröße:</strong>
                      <p className="text-blue-800">{data.householdSize} Personen</p>
                    </div>
                    {data.childrenCount > 0 && (
                      <div>
                        <strong className="text-blue-900">Kinder:</strong>
                        <p className="text-blue-800">{data.childrenCount}</p>
                      </div>
                    )}
                    {data.petsCount > 0 && (
                      <div>
                        <strong className="text-blue-900">Haustiere:</strong>
                        <p className="text-blue-800">{data.petsCount}</p>
                      </div>
                    )}
                    <div>
                      <strong className="text-blue-900">Wohnform:</strong>
                      <p className="text-blue-800">
                        {PROPERTY_TYPES.find(pt => pt.key === data.propertyType)?.label}
                      </p>
                    </div>
                    <div>
                      <strong className="text-blue-900">PLZ:</strong>
                      <p className="text-blue-800">{data.postalCode}</p>
                    </div>
                    {data.oldAddress && (
                      <div className="md:col-span-2">
                        <strong className="text-blue-900">Aktuelle Adresse:</strong>
                        <p className="text-blue-800">{data.oldAddress}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <strong className="text-blue-900">Neue Adresse:</strong>
                      <p className="text-blue-800">{data.newAddress}</p>
                    </div>
                    {data.livingSpace > 0 && (
                      <div>
                        <strong className="text-blue-900">Wohnfläche:</strong>
                        <p className="text-blue-800">{data.livingSpace} m²</p>
                      </div>
                    )}
                    {data.rooms > 0 && (
                      <div>
                        <strong className="text-blue-900">Zimmer:</strong>
                        <p className="text-blue-800">{data.rooms}</p>
                      </div>
                    )}
                  </div>

                  {data.members.length > 0 && (
                    <div className="mt-4">
                      <strong className="text-blue-900">Mitglieder:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.members.filter(m => m.name.trim()).map((member, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {member.name} {member.role && `(${getRoleDisplayName(member.role as HouseholdRole)})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">Was passiert als nächstes?</h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Du erhältst eine personalisierte Umzugs-Checkliste
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Wichtige Fristen werden automatisch berechnet
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Alle Mitglieder können Aufgaben übernehmen
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Du bekommst rechtliche Hinweise für deinen Umzug
                    </li>
                  </ul>
                </div>

                <div className="text-xs text-gray-600 text-center p-4 bg-gray-50 rounded">
                  Deine Daten werden ausschließlich für die Organisation des Umzugs genutzt und niemals für Werbezwecke verwendet. 
                  Wir bemühen uns, sie sicher zu speichern und DSGVO-konform zu verarbeiten.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                )}
                <Button variant="ghost" onClick={onSkip} className="text-gray-600">
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
                    disabled={!canProceed()}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
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
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
import { Calendar, Users, Home, MapPin, CreditCard, ArrowRight, ArrowLeft, CheckCircle, Star, Sparkles, Mail, User, Building, Ruler, DoorOpen, Package2, AlertTriangle } from 'lucide-react'
import { PropertyType, HouseholdRole } from '@/types/database'
import { HOUSEHOLD_ROLES } from '@/config/roles'
import { PROPERTY_TYPES } from '@/config/app'
import { validateName, validateFutureDate, validatePostalCode } from '@/utils/validation'

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
    role: string
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
    
    // Clear errors for updated fields
    const updatedFieldNames = Object.keys(updates)
    if (updatedFieldNames.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev }
        updatedFieldNames.forEach(field => {
          delete newErrors[field]
        })
        return newErrors
      })
    }
  }

  const addMember = () => {
    setData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', email: '', role: 'null' }]
    }))
  }

  const updateMember = (index: number, field: keyof OnboardingData['members'][0], value: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
    
    // Clear member errors
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`members.${index}.${field}`]
      return newErrors
    })
  }

  const removeMember = (index: number) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }))
    
    // Clear member errors
    setErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`members.${index}.`)) {
          delete newErrors[key]
        }
      })
      return newErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        // Validate household name
        const nameValidation = validateName(data.householdName, 'Haushaltsname')
        if (!nameValidation.isValid) {
          newErrors.householdName = nameValidation.errors[0]
        }
        
        // Validate move date
        const dateValidation = validateFutureDate(data.moveDate, 'Umzugsdatum')
        if (!dateValidation.isValid) {
          newErrors.moveDate = dateValidation.errors[0]
        }
        break
        
      case 2:
        // Validate household size
        if (data.householdSize < 1) {
          newErrors.householdSize = 'Haushaltsgröße muss mindestens 1 sein'
        }
        
        // Validate children count
        if (data.childrenCount < 0) {
          newErrors.childrenCount = 'Anzahl Kinder kann nicht negativ sein'
        }
        
        // Validate pets count
        if (data.petsCount < 0) {
          newErrors.petsCount = 'Anzahl Haustiere kann nicht negativ sein'
        }
        break
        
      case 3:
        // Validate property type
        if (!data.propertyType) {
          newErrors.propertyType = 'Wohnform ist erforderlich'
        }
        
        // Validate postal code
        const postalValidation = validatePostalCode(data.postalCode)
        if (!postalValidation.isValid) {
          newErrors.postalCode = postalValidation.errors[0]
        }
        
        // Validate new address
        if (!data.newAddress.trim()) {
          newErrors.newAddress = 'Neue Adresse ist erforderlich'
        }
        
        // Validate living space
        if (data.livingSpace < 0) {
          newErrors.livingSpace = 'Wohnfläche kann nicht negativ sein'
        }
        
        // Validate rooms
        if (data.rooms < 0) {
          newErrors.rooms = 'Anzahl Zimmer kann nicht negativ sein'
        }
        break
        
      case 4:
        // Validate members if any
        data.members.forEach((member, index) => {
          if (member.name.trim() || member.email.trim()) {
            if (!member.name.trim()) {
              newErrors[`members.${index}.name`] = 'Name ist erforderlich'
            }
            
            if (!member.email.trim()) {
              newErrors[`members.${index}.email`] = 'E-Mail ist erforderlich'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
              newErrors[`members.${index}.email`] = 'E-Mail-Format ist ungültig'
            }
          }
        })
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    return Object.keys(errors).length === 0
  }

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    try {
      // Convert 'null' string values back to actual null values for the API
      const processedData = {
        ...data,
        members: data.members.map(member => ({
          ...member,
          role: member.role === 'null' ? '' : member.role
        }))
      }
      await onComplete(processedData)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsSubmitting(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    if (role === 'null') return ''
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
        case 5: return <Sparkles className="h-5 w-5 text-green-600" />
        default: return <div className="h-5 w-5 rounded-full bg-blue-600" />
      }
    }
    return <div className="h-5 w-5 rounded-full bg-gray-300" />
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Grundlagen'
      case 2: return 'Haushalt'
      case 3: return 'Wohnsituation'
      case 4: return 'Team'
      case 5: return 'Fertig!'
      default: return `Schritt ${step}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Willkommen bei muutto!
          </h1>
          <p className="text-xl text-gray-600">
            Lass uns deinen Umzug gemeinsam planen ✨
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center relative">
                {/* Connection Line */}
                {step < 5 && (
                  <div className={`absolute top-5 left-8 w-full h-0.5 ${
                    step < currentStep ? 'bg-green-400' : 'bg-gray-300'
                  }`} style={{ width: 'calc(100% + 2rem)' }} />
                )}
                
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 relative z-10 ${
                  step <= currentStep 
                    ? 'border-blue-600 bg-white shadow-lg' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {getStepIcon(step)}
                </div>
                <span className={`text-sm font-medium ${
                  step <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-full p-1 shadow-inner">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Schritt {currentStep} von {totalSteps}</span>
            <span>{Math.round(progress)}% abgeschlossen</span>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              {currentStep === 1 && <><Home className="h-6 w-6 text-blue-600" /> Haushalt benennen</>}
              {currentStep === 2 && <><Users className="h-6 w-6 text-green-600" /> Haushaltsgröße</>}
              {currentStep === 3 && <><MapPin className="h-6 w-6 text-orange-600" /> Wohnsituation</>}
              {currentStep === 4 && <><Users className="h-6 w-6 text-purple-600" /> Mitglieder einladen</>}
              {currentStep === 5 && <><Sparkles className="h-6 w-6 text-green-600" /> Zusammenfassung</>}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 && "Gib deinem Haushalt einen Namen und wähle das Umzugsdatum"}
              {currentStep === 2 && "Wie viele Personen, Kinder und Haustiere ziehen um?"}
              {currentStep === 3 && "Erzähl uns mehr über deine Wohnsituation"}
              {currentStep === 4 && "Lade Familie oder Mitbewohner ein (optional)"}
              {currentStep === 5 && "Überprüfe deine Angaben vor der Erstellung"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            
            {/* Step 1: Household Name & Move Date */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="householdName" className="text-lg font-medium flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Wie soll dein Haushalt heißen? <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Building className="h-5 w-5" />
                    </div>
                    <Input
                      id="householdName"
                      value={data.householdName}
                      onChange={(e) => updateData({ householdName: e.target.value })}
                      placeholder="z.B. Familie Müller Umzug"
                      className={`text-lg h-12 pl-10 border-2 ${errors.householdName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                      required
                      aria-invalid={!!errors.householdName}
                      aria-describedby={errors.householdName ? "name-error" : "name-hint"}
                    />
                    {data.householdName && !errors.householdName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.householdName ? (
                    <p id="name-error" className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.householdName}
                    </p>
                  ) : (
                    <p id="name-hint" className="text-sm text-gray-600 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Wähle einen Namen, der für alle Mitglieder erkennbar ist
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="moveDate" className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Wann ist dein geplanter Umzugstermin? <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <Input
                      id="moveDate"
                      type="date"
                      value={data.moveDate}
                      onChange={(e) => updateData({ moveDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className={`text-lg h-12 pl-10 border-2 ${errors.moveDate ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                      required
                      aria-invalid={!!errors.moveDate}
                      aria-describedby={errors.moveDate ? "date-error" : "date-hint"}
                    />
                    {data.moveDate && !errors.moveDate && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.moveDate ? (
                    <p id="date-error" className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.moveDate}
                    </p>
                  ) : (
                    <p id="date-hint" className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Das Datum hilft uns dabei, alle Fristen richtig zu berechnen
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Household Size */}
            {currentStep === 2 && (
              <div className="space-y-10">
                <div className="text-center">
                  <Label className="text-xl font-medium mb-6 block flex items-center justify-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    Wie viele Personen leben in deinem Haushalt? <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center justify-center gap-8 mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateData({ householdSize: Math.max(1, data.householdSize - 1) })}
                      disabled={data.householdSize <= 1}
                      className="h-16 w-16 rounded-full text-2xl"
                    >
                      -
                    </Button>
                    <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                      <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {data.householdSize}
                      </div>
                      <div className="text-lg text-gray-600 mt-2">
                        {data.householdSize === 1 ? 'Person' : 'Personen'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => updateData({ householdSize: data.householdSize + 1 })}
                      className="h-16 w-16 rounded-full text-2xl"
                    >
                      +
                    </Button>
                  </div>
                  {errors.householdSize && (
                    <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.householdSize}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="text-center">
                    <Label className="text-lg font-medium mb-4 block flex items-center justify-center gap-2">
                      <span className="text-2xl">👶</span> Anzahl Kinder
                    </Label>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => updateData({ childrenCount: Math.max(0, data.childrenCount - 1) })}
                        disabled={data.childrenCount <= 0}
                        className="h-12 w-12 rounded-full"
                      >
                        -
                      </Button>
                      <div className="text-center bg-green-50 p-4 rounded-xl min-w-[80px]">
                        <div className="text-3xl font-bold text-green-600">{data.childrenCount}</div>
                        <div className="text-sm text-green-800">Kinder</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => updateData({ childrenCount: data.childrenCount + 1 })}
                        className="h-12 w-12 rounded-full"
                      >
                        +
                      </Button>
                    </div>
                    {errors.childrenCount && (
                      <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.childrenCount}
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <Label className="text-lg font-medium mb-4 block flex items-center justify-center gap-2">
                      <span className="text-2xl">🐾</span> Anzahl Haustiere
                    </Label>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => updateData({ petsCount: Math.max(0, data.petsCount - 1) })}
                        disabled={data.petsCount <= 0}
                        className="h-12 w-12 rounded-full"
                      >
                        -
                      </Button>
                      <div className="text-center bg-orange-50 p-4 rounded-xl min-w-[80px]">
                        <div className="text-3xl font-bold text-orange-600">{data.petsCount}</div>
                        <div className="text-sm text-orange-800">Haustiere</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => updateData({ petsCount: data.petsCount + 1 })}
                        className="h-12 w-12 rounded-full"
                      >
                        +
                      </Button>
                    </div>
                    {errors.petsCount && (
                      <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.petsCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Property & Location */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-lg font-medium flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Mietwohnung oder Eigentum? <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={data.propertyType} 
                    onValueChange={(value: PropertyType) => updateData({ propertyType: value })}
                  >
                    <SelectTrigger className={`text-lg h-12 border-2 ${errors.propertyType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                      <SelectValue placeholder="Wähle deine Wohnsituation" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((pt) => (
                        <SelectItem key={pt.key} value={pt.key} className="text-lg">
                          {pt.icon} {pt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.propertyType}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="postalCode" className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Postleitzahl deiner neuen Adresse <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input
                      id="postalCode"
                      value={data.postalCode}
                      onChange={(e) => updateData({ postalCode: e.target.value })}
                      placeholder="12345"
                      maxLength={5}
                      className={`text-lg h-12 pl-10 border-2 ${errors.postalCode ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                      required
                      aria-invalid={!!errors.postalCode}
                      aria-describedby={errors.postalCode ? "postal-error" : "postal-hint"}
                    />
                    {data.postalCode && !errors.postalCode && data.postalCode.length === 5 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.postalCode ? (
                    <p id="postal-error" className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.postalCode}
                    </p>
                  ) : (
                    <p id="postal-hint" className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Hilft uns dabei, regionale Fristen und Ämter zu finden
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="oldAddress" className="text-lg font-medium flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      Aktuelle Adresse (optional)
                    </Label>
                    <AddressAutocomplete
                      value={data.oldAddress}
                      onChange={(val) => updateData({ oldAddress: val })}
                      onSelect={setOldCoords}
                      placeholder="Straße, Hausnummer, Ort"
                      className="h-12"
                      helpText="Deine aktuelle Wohnadresse"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="newAddress" className="text-lg font-medium flex items-center gap-2">
                      <Home className="h-5 w-5 text-green-600" />
                      Neue Adresse <span className="text-red-500">*</span>
                    </Label>
                    <AddressAutocomplete
                      value={data.newAddress}
                      onChange={(val) => updateData({ newAddress: val })}
                      onSelect={setNewCoords}
                      placeholder="Straße, Hausnummer, Ort"
                      className="h-12"
                      error={errors.newAddress}
                      required
                      helpText="Deine zukünftige Wohnadresse"
                    />
                    {distanceKm != null && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Entfernung ca. {distanceKm} km – {distanceFact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="livingSpace" className="text-lg font-medium flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-blue-600" />
                      Wohnfläche (m²)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Ruler className="h-5 w-5" />
                      </div>
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
                        className={`h-12 pl-10 border-2 ${errors.livingSpace ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                        aria-invalid={!!errors.livingSpace}
                        aria-describedby={errors.livingSpace ? "space-error" : undefined}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        m²
                      </div>
                    </div>
                    {errors.livingSpace && (
                      <p id="space-error" className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.livingSpace}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="rooms" className="text-lg font-medium flex items-center gap-2">
                      <DoorOpen className="h-5 w-5 text-blue-600" />
                      Zimmer
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <DoorOpen className="h-5 w-5" />
                      </div>
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
                        className={`h-12 pl-10 border-2 ${errors.rooms ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                        aria-invalid={!!errors.rooms}
                        aria-describedby={errors.rooms ? "rooms-error" : undefined}
                      />
                    </div>
                    {errors.rooms && (
                      <p id="rooms-error" className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.rooms}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="furnitureVolume" className="text-lg font-medium flex items-center gap-2">
                      <Package2 className="h-5 w-5 text-blue-600" />
                      Möbelvolumen (m³)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Package2 className="h-5 w-5" />
                      </div>
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
                        className="h-12 pl-10 border-2 focus:border-blue-500"
                        aria-describedby="volume-hint"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        m³
                      </div>
                    </div>
                    <p id="volume-hint" className="text-sm text-gray-600">
                      Hilft bei der Planung des Transportvolumens
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Members */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Label className="text-xl font-medium mb-4 block flex items-center justify-center gap-2">
                    <Users className="h-6 w-6 text-purple-600" />
                    Mitglieder deines Haushalts (optional)
                  </Label>
                  <p className="text-gray-600 text-lg">
                    Lade Familie oder Mitbewohner ein, um Aufgaben gemeinsam zu verwalten
                  </p>
                </div>

                {data.members.map((member, index) => (
                  <Card key={index} className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Name
                        </Label>
                        <div className="relative mt-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <User className="h-4 w-4" />
                          </div>
                          <Input
                            placeholder="Max Mustermann"
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            className={`pl-9 h-10 ${errors[`members.${index}.name`] ? 'border-red-500 focus:border-red-500' : ''}`}
                            aria-invalid={!!errors[`members.${index}.name`]}
                          />
                        </div>
                        {errors[`members.${index}.name`] && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors[`members.${index}.name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          E-Mail
                        </Label>
                        <div className="relative mt-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            placeholder="max@beispiel.de"
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            className={`pl-9 h-10 ${errors[`members.${index}.email`] ? 'border-red-500 focus:border-red-500' : ''}`}
                            aria-invalid={!!errors[`members.${index}.email`]}
                          />
                        </div>
                        {errors[`members.${index}.email`] && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors[`members.${index}.email`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-blue-600" />
                          Rolle (optional)
                        </Label>
                        <Select 
                          value={member.role} 
                          onValueChange={(value: string) => updateMember(index, 'role', value)}
                        >
                          <SelectTrigger className="mt-1 h-10">
                            <SelectValue placeholder="Rolle wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">Keine Rolle</SelectItem>
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
                          className="w-full h-10"
                        >
                          Entfernen
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button 
                  variant="outline" 
                  onClick={addMember} 
                  className="w-full border-2 border-dashed border-blue-300 h-16 text-lg hover:bg-blue-50"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Mitglied hinzufügen
                </Button>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-8 w-8 text-yellow-500" />
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Alles bereit für deinen Umzug!
                  </h3>
                  <p className="text-xl text-gray-600">
                    Überprüfe deine Angaben und erstelle deinen Haushalt
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <Home className="h-5 w-5 text-blue-700" />
                        Haushalt:
                      </strong>
                      <p className="text-blue-800 text-lg">{data.householdName}</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-700" />
                        Umzugsdatum:
                      </strong>
                      <p className="text-blue-800 text-lg">{new Date(data.moveDate).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-700" />
                        Haushaltsgröße:
                      </strong>
                      <p className="text-blue-800 text-lg">{data.householdSize} Personen</p>
                    </div>
                    {data.childrenCount > 0 && (
                      <div className="space-y-1">
                        <strong className="text-blue-900 text-lg flex items-center gap-2">
                          <span className="text-xl">👶</span>
                          Kinder:
                        </strong>
                        <p className="text-blue-800 text-lg">{data.childrenCount}</p>
                      </div>
                    )}
                    {data.petsCount > 0 && (
                      <div className="space-y-1">
                        <strong className="text-blue-900 text-lg flex items-center gap-2">
                          <span className="text-xl">🐾</span>
                          Haustiere:
                        </strong>
                        <p className="text-blue-800 text-lg">{data.petsCount}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <Home className="h-5 w-5 text-blue-700" />
                        Wohnform:
                      </strong>
                      <p className="text-blue-800 text-lg">
                        {PROPERTY_TYPES.find(pt => pt.key === data.propertyType)?.label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-700" />
                        PLZ:
                      </strong>
                      <p className="text-blue-800 text-lg">{data.postalCode}</p>
                    </div>
                    {data.oldAddress && (
                      <div className="md:col-span-2 space-y-1">
                        <strong className="text-blue-900 text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-700" />
                          Aktuelle Adresse:
                        </strong>
                        <p className="text-blue-800 text-lg">{data.oldAddress}</p>
                      </div>
                    )}
                    <div className="md:col-span-2 space-y-1">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-700" />
                        Neue Adresse:
                      </strong>
                      <p className="text-blue-800 text-lg">{data.newAddress}</p>
                    </div>
                    {data.livingSpace > 0 && (
                      <div className="space-y-1">
                        <strong className="text-blue-900 text-lg flex items-center gap-2">
                          <Ruler className="h-5 w-5 text-blue-700" />
                          Wohnfläche:
                        </strong>
                        <p className="text-blue-800 text-lg">{data.livingSpace} m²</p>
                      </div>
                    )}
                    {data.rooms > 0 && (
                      <div className="space-y-1">
                        <strong className="text-blue-900 text-lg flex items-center gap-2">
                          <DoorOpen className="h-5 w-5 text-blue-700" />
                          Zimmer:
                        </strong>
                        <p className="text-blue-800 text-lg">{data.rooms}</p>
                      </div>
                    )}
                  </div>

                  {data.members.length > 0 && (
                    <div className="mt-6">
                      <strong className="text-blue-900 text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-700" />
                        Mitglieder:
                      </strong>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {data.members.filter(m => m.name.trim()).map((member, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 text-sm">
                            {member.name} {member.role && member.role !== 'null' && `(${getRoleDisplayName(member.role)})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-4 text-xl flex items-center gap-2">
                    <Star className="h-6 w-6" />
                    Was passiert als nächstes?
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-800">Du erhältst eine personalisierte Umzugs-Checkliste</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-800">Wichtige Fristen werden automatisch berechnet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-800">Alle Mitglieder können Aufgaben übernehmen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-800">Du bekommst rechtliche Hinweise für deinen Umzug</span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl border">
                  <p className="text-sm text-gray-600">
                    🔒 Deine Daten werden ausschließlich für die Organisation des Umzugs genutzt und niemals für Werbezwecke verwendet. 
                    Wir bemühen uns, sie sicher zu speichern und DSGVO-konform zu verarbeiten.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} className="h-12 px-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                )}
                <Button variant="ghost" onClick={onSkip} className="text-gray-600 h-12 px-6">
                  Überspringen
                </Button>
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={nextStep} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-8 text-lg"
                  >
                    Weiter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 px-8 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Wird erstellt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Haushalt erstellen
                      </>
                    )}
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
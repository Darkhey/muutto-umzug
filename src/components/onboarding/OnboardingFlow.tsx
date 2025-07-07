import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Home, MapPin, ArrowRight, ArrowLeft, CheckCircle, Star, Mail, User, Building, Ruler, DoorOpen, Package2, Save, Crown, PawPrint, Coffee, Truck, PlusCircle, XCircle, Sparkles, Baby, School, PersonStanding } from 'lucide-react';
import { PropertyType } from '@/types/database';
import { HOUSEHOLD_ROLES } from '@/config/roles';
import { PROPERTY_TYPES } from '@/config/app';
import { validateName, validateFutureDate } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Enhanced data structure for AI
interface HomeDetails {
  propertyType: PropertyType | '';
  livingSpace: number;
  rooms: number;
  floor: number;
  hasElevator: boolean;
  specialFeatures: string[];
}

interface OnboardingData {
  householdType: 'single' | 'couple' | 'family' | 'wg' | '';
  householdName: string;
  moveDate: string;
  
  adultsCount: number;
  children: Array<{ ageGroup: 'baby' | 'school' | 'teen' }>;
  
  pets: Array<{ type: string; name: string; specialNeeds?: string }>;
  
  oldHome: Partial<HomeDetails>;
  newHome: Partial<HomeDetails>;

  inventoryStyle: 'minimalist' | 'normal' | 'collector' | '';
  specialItems: string[];
  worksFromHome: boolean;
  hobbies: string;
  
  moveStyle: 'diy' | 'company' | 'mixed' | '';

  members: Array<{ name: string; email: string; role: string; }>;
  adUrl?: string | null;
}

interface OnboardingFlowProps {
  initialData?: Partial<OnboardingData> | null;
  initialStep?: number;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => void;
  onSaveDraft?: (data: Partial<OnboardingData>, step: number) => Promise<boolean>;
  onBackToDrafts?: () => void;
}

const STEPS = [
  { id: 1, title: 'Willkommen an Bord!', description: 'Wie ziehst du um?', icon: Star },
  { id: 2, title: 'Die Mannschaft', description: 'Wer ist alles dabei?', icon: Users },
  { id: 3, title: 'Tierische Begleiter', description: 'Deine flauschigen Freunde', icon: PawPrint },
  { id: 4, 'title': 'Dein altes Nest', 'description': 'Wo startest du?', 'icon': Home },
  { id: 5, 'title': 'Dein neues Reich', 'description': 'Wo geht die Reise hin?', 'icon': MapPin },
  { id: 6, 'title': 'Dein Hab & Gut', 'description': 'Schätze und Besitztümer', 'icon': Package2 },
  { id: 7, 'title': 'Dein Lebensstil', 'description': 'Gewohnheiten & Hobbies', 'icon': Coffee },
  { id: 8, 'title': 'Dein Umzugs-Stil', 'description': 'Wie packst du es an?', 'icon': Truck },
  { id: 9, 'title': 'Crew einladen', 'description': 'Hol deine Leute an Bord', 'icon': Mail },
  { id: 10, 'title': 'Fast geschafft!', 'description': 'Überprüfung & Start', 'icon': CheckCircle },
];

const householdTypeOptions = [
    { value: 'single', label: 'Alleine', icon: <User className="h-5 w-5" /> },
    { value: 'couple', label: 'Als Paar', icon: <Users className="h-5 w-5" /> },
    { value: 'family', label: 'Mit Familie', icon: <Baby className="h-5 w-5" /> },
    { value: 'wg', label: 'Als WG', icon: <Home className="h-5 w-5" /> },
];

const inventoryStyles = [
    { value: 'minimalist', label: 'Minimalistisch', description: 'Nur das Nötigste.' },
    { value: 'normal', label: 'Ganz normal', description: 'Ein typischer Haushalt.' },
    { value: 'collector', label: 'Jäger & Sammler', description: 'Ich hänge an meinen Schätzen.' },
];

const moveStyles = [
    { value: 'diy', label: 'Marke Eigenbau', description: 'Ich pack das mit Freunden.' },
    { value: 'company', label: 'Voller Service', description: 'Profis ranlassen.' },
    { value: 'mixed', label: 'Die Mischung machts', description: 'Teils, teils.' },
];

const specialHomeFeatures = [
    { id: 'balcony', label: 'Balkon/Terrasse' },
    { id: 'basement', label: 'Kellerabteil' },
    { id: 'attic', label: 'Dachboden' },
    { id: 'garden', label: 'Garten' },
    { id: 'garage', label: 'Garage' },
];

const specialInventoryItems = [
    { id: 'piano', label: 'Klavier/Flügel' },
    { id: 'aquarium', label: 'Großes Aquarium' },
    { id: 'art', label: 'Wertvolle Kunst' },
    { id: 'safe', label: 'Safe/Tresor' },
    { id: 'many_books', label: 'Sehr viele Bücher' },
    { id: 'many_plants', label: 'Viele Pflanzen' },
];


export const OnboardingFlow = ({ 
  initialData, 
  initialStep = 1, 
  onComplete, 
  onSkip, 
  onSaveDraft, 
  onBackToDrafts 
}: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const [data, setData] = useState<OnboardingData>({
    householdType: '',
    householdName: '',
    moveDate: '',
    adultsCount: 1,
    children: [],
    pets: [],
    oldHome: { propertyType: '', livingSpace: 50, rooms: 2, floor: 1, hasElevator: false, specialFeatures: [] },
    newHome: { propertyType: '', livingSpace: 70, rooms: 3, floor: 2, hasElevator: false, specialFeatures: [] },
    inventoryStyle: 'normal',
    specialItems: [],
    worksFromHome: false,
    hobbies: '',
    moveStyle: 'mixed',
    members: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!data.householdType) newErrors.householdType = 'Bitte wähle eine Haushaltsform.';
        if (!data.householdName.trim()) newErrors.householdName = 'Gib deinem Haushalt einen Namen.';
        if (!data.moveDate) newErrors.moveDate = 'Ein Umzugsdatum ist erforderlich.';
        else if (!validateFutureDate(data.moveDate)) newErrors.moveDate = 'Das Datum muss in der Zukunft liegen.';
        break;
      case 2:
        if (data.adultsCount < 1) newErrors.adultsCount = 'Es muss mindestens ein Erwachsener umziehen.';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      await onSaveDraft(data, currentStep);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };
  
  const updateHomeData = (home: 'oldHome' | 'newHome', updates: Partial<HomeDetails>) => {
    setData(prev => ({
        ...prev,
        [home]: { ...prev[home], ...updates }
    }));
  };

  const toggleSelection = (field: 'specialItems' | 'specialFeatures', value: string, home?: 'oldHome' | 'newHome') => {
      if (home) {
          const currentFeatures = data[home]?.specialFeatures || [];
          const newFeatures = currentFeatures.includes(value)
              ? currentFeatures.filter(item => item !== value)
              : [...currentFeatures, value];
          updateHomeData(home, { specialFeatures: newFeatures });
      } else {
          const currentItems = (data[field as 'specialItems'] as string[]) || [];
          const newItems = currentItems.includes(value)
              ? currentItems.filter(item => item !== value)
              : [...currentItems, value];
          updateData({ [field]: newItems } as any);
      }
  };

  const renderStep = () => {
    const StepCard = ({ title, description, children }: { title: string, description: string, children: ReactNode }) => (
        <Card className="shadow-lg border-blue-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-blue-900">
                    {STEPS.find(s => s.id === currentStep)?.icon({ className: "h-8 w-8 text-blue-500" })}
                    {title}
                </CardTitle>
                <CardDescription className="text-lg">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
        </Card>
    );
    
    switch (currentStep) {
      case 1:
        return (
            <StepCard title="Dein Umzugsabenteuer beginnt!" description="Erzähl uns ein bisschen was, damit wir dir perfekt helfen können.">
                <div>
                    <Label className="font-bold text-lg">Wie ziehst du um?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {householdTypeOptions.map(opt => (
                            <Button key={opt.value} variant={data.householdType === opt.value ? 'default' : 'outline'} className="h-24 flex flex-col gap-2" onClick={() => updateData({ householdType: opt.value as any })}>
                                {opt.icon}
                                <span>{opt.label}</span>
                            </Button>
                        ))}
                    </div>
                    {errors.householdType && <p className="text-red-500 text-sm mt-1">{errors.householdType}</p>}
                </div>
                <div>
                    <Label htmlFor="householdName" className="font-bold text-lg">Wie nennst du deinen neuen Haushalt?</Label>
                    <Input id="householdName" value={data.householdName} onChange={(e) => updateData({ householdName: e.target.value })} placeholder="z.B. Müllers Hafen, WG Ahoi, Villa Kunterbunt" className="mt-2" />
                    {errors.householdName && <p className="text-red-500 text-sm mt-1">{errors.householdName}</p>}
                </div>
                <div>
                    <Label htmlFor="moveDate" className="font-bold text-lg">Wann wird umgezogen?</Label>
                    <Input id="moveDate" type="date" value={data.moveDate} onChange={(e) => updateData({ moveDate: e.target.value })} className="mt-2" />
                    {errors.moveDate && <p className="text-red-500 text-sm mt-1">{errors.moveDate}</p>}
                </div>
            </StepCard>
        );

      case 2:
        return (
            <StepCard title="Die Mannschaft" description="Wer ist alles beim Umzug dabei?">
                <div>
                    <Label htmlFor="adultsCount" className="font-bold text-lg">Anzahl der Erwachsenen</Label>
                    <Input id="adultsCount" type="number" min="1" value={data.adultsCount} onChange={(e) => updateData({ adultsCount: parseInt(e.target.value) || 1 })} className="mt-2 w-32" />
                </div>
                <div>
                    <Label className="font-bold text-lg">Ziehen Kinder mit um?</Label>
                    <div className="flex items-center gap-4 mt-2">
                        <Button variant="outline" size="sm" onClick={() => updateData({ children: [...data.children, { ageGroup: 'baby' }] })}><Baby className="mr-2 h-4 w-4" /> Baby/Kleinkind</Button>
                        <Button variant="outline" size="sm" onClick={() => updateData({ children: [...data.children, { ageGroup: 'school' }] })}><School className="mr-2 h-4 w-4" /> Schulkind</Button>
                        <Button variant="outline" size="sm" onClick={() => updateData({ children: [...data.children, { ageGroup: 'teen' }] })}><PersonStanding className="mr-2 h-4 w-4" /> Teenager</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.children.map((child, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-2 p-2">
                                {child.ageGroup === 'baby' && <Baby className="h-4 w-4" />}
                                {child.ageGroup === 'school' && <School className="h-4 w-4" />}
                                {child.ageGroup === 'teen' && <PersonStanding className="h-4 w-4" />}
                                {child.ageGroup.charAt(0).toUpperCase() + child.ageGroup.slice(1)}
                                <XCircle className="h-4 w-4 cursor-pointer" onClick={() => updateData({ children: data.children.filter((_, i) => i !== index) })} />
                            </Badge>
                        ))}
                    </div>
                </div>
            </StepCard>
        );
        
      case 3:
        return (
            <StepCard title="Tierische Begleiter" description="Gibt es Haustiere, die mit umziehen?">
                <Button onClick={() => updateData({ pets: [...data.pets, { type: 'Hund', name: '' }] })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Haustier hinzufügen
                </Button>
                <div className="space-y-4">
                    {data.pets.map((pet, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                            <PawPrint className="h-8 w-8 text-gray-500" />
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input placeholder="Tierart, z.B. Hund" value={pet.type} onChange={e => {
                                    const newPets = [...data.pets];
                                    newPets[index].type = e.target.value;
                                    updateData({ pets: newPets });
                                }} />
                                <Input placeholder="Name (optional)" value={pet.name} onChange={e => {
                                    const newPets = [...data.pets];
                                    newPets[index].name = e.target.value;
                                    updateData({ pets: newPets });
                                }} />
                                <Input placeholder="Besonderheiten (optional)" value={pet.specialNeeds} onChange={e => {
                                    const newPets = [...data.pets];
                                    newPets[index].specialNeeds = e.target.value;
                                    updateData({ pets: newPets });
                                }} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => updateData({ pets: data.pets.filter((_, i) => i !== index) })}>
                                <XCircle className="h-5 w-5 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            </StepCard>
        );

      case 4: // Old Home
      case 5: // New Home
        const homeKey = currentStep === 4 ? 'oldHome' : 'newHome';
        const homeData = data[homeKey] as HomeDetails;
        const title = currentStep === 4 ? "Dein altes Nest" : "Dein neues Reich";
        const description = currentStep === 4 ? "Beschreibe dein jetziges Zuhause." : "Wie wird dein neues Zuhause aussehen?";
        
        return (
            <StepCard title={title} description={description}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Wohnform</Label>
                        <Select value={homeData.propertyType} onValueChange={(v) => updateHomeData(homeKey, { propertyType: v as PropertyType })}>
                            <SelectTrigger><SelectValue placeholder="Wähle eine Wohnform" /></SelectTrigger>
                            <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Wohnfläche (m², optional)</Label>
                        <Input type="number" value={homeData.livingSpace} onChange={e => updateHomeData(homeKey, { livingSpace: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <Label>Anzahl Zimmer (optional)</Label>
                        <Input type="number" value={homeData.rooms} onChange={e => updateHomeData(homeKey, { rooms: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <Label>Etage (optional)</Label>
                        <Input type="number" value={homeData.floor} onChange={e => updateHomeData(homeKey, { floor: parseInt(e.target.value) || 0 })} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id={`elevator-${homeKey}`} checked={homeData.hasElevator} onCheckedChange={c => updateHomeData(homeKey, { hasElevator: c })} />
                    <Label htmlFor={`elevator-${homeKey}`}>Gibt es einen Aufzug?</Label>
                </div>
                <div>
                    <Label>Besonderheiten (optional)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {specialHomeFeatures.map(feat => (
                            <Button key={feat.id} variant={homeData.specialFeatures?.includes(feat.id) ? 'default' : 'outline'} onClick={() => toggleSelection('specialFeatures', feat.id, homeKey)}>
                                {feat.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </StepCard>
        );

      case 6:
        return (
            <StepCard title="Dein Hab und Gut" description="Ein paar Details helfen uns, den Umfang deines Umzugs besser einzuschätzen.">
                <div>
                    <Label className="font-bold text-lg">Welcher Sammel-Typ bist du?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {inventoryStyles.map(style => (
                            <Button key={style.value} variant={data.inventoryStyle === style.value ? 'default' : 'outline'} className="h-24 flex flex-col text-center" onClick={() => updateData({ inventoryStyle: style.value as any })}>
                                <span className="font-bold">{style.label}</span>
                                <span className="text-xs font-normal">{style.description}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <Label className="font-bold text-lg">Gibt es besondere Gegenstände?</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {specialInventoryItems.map(item => (
                            <Button key={item.id} variant={data.specialItems.includes(item.id) ? 'default' : 'outline'} onClick={() => toggleSelection('specialItems', item.id)}>
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </StepCard>
        );

      case 7:
        return (
            <StepCard title="Dein Lebensstil" description="Wie lebst und arbeitest du? Das hilft uns bei der Detailplanung.">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="worksFromHome" className="font-bold text-lg">Arbeitest du (oft) im Home Office?</Label>
                    <Switch id="worksFromHome" checked={data.worksFromHome} onCheckedChange={c => updateData({ worksFromHome: c })} />
                </div>
                <div>
                    <Label htmlFor="hobbies" className="font-bold text-lg">Gibt es Hobbies mit sperriger Ausrüstung?</Label>
                    <Textarea id="hobbies" value={data.hobbies} onChange={e => updateData({ hobbies: e.target.value })} placeholder="z.B. Musikinstrumente, Staffelei, Surfbrett, Angelausrüstung..." className="mt-2" />
                </div>
            </StepCard>
        );

      case 8:
        return (
            <StepCard title="Dein Umzugs-Stil" description="Wie möchtest du deinen Umzug organisieren?">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {moveStyles.map(style => (
                        <Button key={style.value} variant={data.moveStyle === style.value ? 'default' : 'outline'} className="h-24 flex flex-col text-center" onClick={() => updateData({ moveStyle: style.value as any })}>
                            <span className="font-bold">{style.label}</span>
                            <span className="text-xs font-normal">{style.description}</span>
                        </Button>
                    ))}
                </div>
            </StepCard>
        );

      case 9:
        // Simplified member invitation for now
        return (
            <StepCard title="Lade deine Crew ein" description="Füge die E-Mail-Adressen deiner Mitziehenden hinzu. (Optional)">
                <p>Die Einladung von Mitgliedern wird im nächsten Schritt verfügbar sein.</p>
            </StepCard>
        );

      case 10:
        return (
            <StepCard title="Fast am Ziel!" description="Ein letzter Blick auf deine Angaben. Passt alles?">
                <div className="space-y-4 text-sm">
                    <p><strong>Haushalt:</strong> {data.householdName} ({householdTypeOptions.find(o => o.value === data.householdType)?.label})</p>
                    <p><strong>Umzug am:</strong> {new Date(data.moveDate).toLocaleDateString('de-DE')}</p>
                    <p><strong>Mannschaft:</strong> {data.adultsCount} Erwachsene, {data.children.length} Kinder</p>
                    {data.pets.length > 0 && <p><strong>Haustiere:</strong> {data.pets.map(p => p.name || p.type).join(', ')}</p>}
                    <p><strong>Umzugsstil:</strong> {moveStyles.find(s => s.value === data.moveStyle)?.label}</p>
                    <p><strong>Besonderheiten:</strong> {data.specialItems.map(i => specialInventoryItems.find(si => si.id === i)?.label).join(', ') || 'Keine'}</p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                    <Sparkles className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="font-semibold">Super! Mit diesen Infos erstellen wir dir einen maßgeschneiderten Umzugsplan.</p>
                </div>
            </StepCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBackToDrafts && (
              <Button variant="ghost" onClick={onBackToDrafts}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zu Entwürfen
              </Button>
            )}
            <Button variant="ghost" onClick={onSkip}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
          </div>
          
          {onSaveDraft && (
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Entwurf speichern
            </Button>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {STEPS[currentStep - 1].title}
            </h1>
            <span className="text-sm text-gray-600">
              Schritt {currentStep} von {STEPS.length}
            </span>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2 bg-blue-200" />
        </div>

        <div className="mb-8 min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>

          <div className="flex gap-2">
            {onSaveDraft && currentStep !== STEPS.length && (
              <Button variant="outline" onClick={handleSaveDraft} className="shadow-sm">
                <Save className="h-4 w-4 mr-2" />
                Speichern & Schließen
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition-transform"
              size="lg"
            >
              {currentStep === STEPS.length ? (
                <>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Plan wird erstellt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Umzug erstellen & Magie starten
                    </>
                  )}
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

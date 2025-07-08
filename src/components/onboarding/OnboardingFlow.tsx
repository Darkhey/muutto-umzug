
import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { Calendar, Users, Home, MapPin, ArrowRight, ArrowLeft, CheckCircle, Star, Mail, User, Building, Ruler, DoorOpen, Package2, Save, Crown, PawPrint, Coffee, Truck, PlusCircle, XCircle, Sparkles, Baby, School, PersonStanding } from 'lucide-react';
import { PropertyType } from '@/types/database';
import { HOUSEHOLD_ROLES } from '@/config/roles';
import { PROPERTY_TYPES } from '@/config/app';
import { validateName, validateFutureDate } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreateHouseholdFormData } from '@/hooks/useHouseholds';

// Vereinfachte OnboardingData-Struktur, die direkt mit CreateHouseholdFormData kompatibel ist
export interface OnboardingData {
  // Basis-Informationen
  name: string;
  move_date: string;
  household_size: number;
  children_count: number;
  pets_count: number;
  property_type: 'miete' | 'eigentum';
  
  // Optionale Adressinformationen
  postal_code?: string;
  old_address?: string;
  new_address?: string;
  
  // Wohnungsdetails
  living_space?: number;
  rooms?: number;
  furniture_volume?: number;
  
  // Zusätzliche Informationen
  owns_car?: boolean;
  is_self_employed?: boolean;
  ad_url?: string;
  
  // Mitglieder
  members?: Array<{ name: string; email: string; role?: string; }>;
  
  // UI-spezifische Felder (werden nicht in DB gespeichert)
  householdType?: 'single' | 'couple' | 'family' | 'wg';
  inventoryStyle?: 'minimalist' | 'normal' | 'collector';
  specialItems?: string[];
  worksFromHome?: boolean;
  hobbies?: string;
  moveStyle?: 'diy' | 'company' | 'mixed';
}

interface OnboardingFlowProps {
  initialData?: Partial<OnboardingData> | null;
  initialStep?: number;
  onComplete: (data: CreateHouseholdFormData) => Promise<void>;
  onSkip: () => void;
  onSaveDraft?: (data: Partial<OnboardingData>, step: number) => Promise<boolean>;
  onBackToDrafts?: () => void;
}

const STEPS = [
  { id: 1, title: 'Willkommen an Bord!', description: 'Wie ziehst du um?', icon: Star },
  { id: 2, title: 'Die Mannschaft', description: 'Wer ist alles dabei?', icon: Users },
  { id: 3, title: 'Tierische Begleiter (optional)', description: 'Deine flauschigen Freunde', icon: PawPrint },
  { id: 4, title: 'Dein Zuhause', description: 'Wo startest du und wohin geht es?', icon: Home },
  { id: 5, title: 'Dein Hab & Gut', description: 'Schätze und Besitztümer', icon: Package2 },
  { id: 6, title: 'Dein Lebensstil (optional)', description: 'Gewohnheiten & Hobbies', icon: Coffee },
  { id: 7, title: 'Dein Umzugs-Stil', description: 'Wie packst du es an?', icon: Truck },
  { id: 8, title: 'Crew einladen (optional)', description: 'Hol deine Leute an Bord', icon: Mail },
  { id: 9, title: 'Fast geschafft!', description: 'Überprüfung & Start', icon: CheckCircle },
];

const householdTypeOptions = [
    { value: 'single', label: 'Alleine', icon: <User className="h-5 w-5" />, size: 1 },
    { value: 'couple', label: 'Als Paar', icon: <Users className="h-5 w-5" />, size: 2 },
    { value: 'family', label: 'Mit Familie', icon: <Baby className="h-5 w-5" />, size: 3 },
    { value: 'wg', label: 'Als WG', icon: <Home className="h-5 w-5" />, size: 4 },
];

const inventoryStyles = [
    { value: 'minimalist', label: 'Minimalistisch', description: 'Nur das Nötigste.', volume: 20 },
    { value: 'normal', label: 'Ganz normal', description: 'Ein typischer Haushalt.', volume: 50 },
    { value: 'collector', label: 'Jäger & Sammler', description: 'Ich hänge an meinen Schätzen.', volume: 80 },
];

const moveStyles = [
    { value: 'diy', label: 'Marke Eigenbau', description: 'Ich pack das mit Freunden.' },
    { value: 'company', label: 'Voller Service', description: 'Profis ranlassen.' },
    { value: 'mixed', label: 'Die Mischung machts', description: 'Teils, teils.' },
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
  const { status, loading } = usePremiumStatus();
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const [data, setData] = useState<OnboardingData>({
    name: '',
    move_date: '',
    household_size: 1,
    children_count: 0,
    pets_count: 0,
    property_type: 'miete',
    postal_code: '',
    old_address: '',
    new_address: '',
    living_space: 50,
    rooms: 2,
    furniture_volume: 30,
    owns_car: false,
    is_self_employed: false,
    members: [],
    householdType: 'single',
    inventoryStyle: 'normal',
    specialItems: [],
    worksFromHome: false,
    hobbies: '',
    moveStyle: 'mixed',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Save alle 30 Sekunden
  useEffect(() => {
    if (!onSaveDraft) return;
    const interval = setInterval(() => {
      onSaveDraft(data, currentStep);
    }, 30000);
    return () => clearInterval(interval);
  }, [data, currentStep, onSaveDraft]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!data.name?.trim()) newErrors.name = 'Gib deinem Haushalt einen Namen.';
        if (!data.move_date) newErrors.move_date = 'Ein Umzugsdatum ist erforderlich.';
        else if (!validateFutureDate(data.move_date)) newErrors.move_date = 'Das Datum muss in der Zukunft liegen.';
        if (!data.property_type) newErrors.property_type = 'Bitte wähle eine Wohnform.';
        break;
      case 2:
        if (data.household_size < 1) newErrors.household_size = 'Es muss mindestens ein Erwachsener umziehen.';
        break;
      case 3:
        // Pets sind optional
        break;
      case 4:
        // Adressen sind optional
        break;
      case 5:
        // Inventar ist optional
        break;
      case 6:
        // Lebensstil ist optional
        break;
      case 7:
        // Umzugsstil ist optional
        break;
      case 8:
        // Mitglieder sind optional
        break;
      default:
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
      // Konvertiere OnboardingData zu CreateHouseholdFormData
      const householdData: CreateHouseholdFormData = {
        name: data.name,
        move_date: data.move_date,
        household_size: data.household_size,
        children_count: data.children_count,
        pets_count: data.pets_count,
        property_type: data.property_type,
        postal_code: data.postal_code || null,
        old_address: data.old_address || null,
        new_address: data.new_address || null,
        living_space: data.living_space || null,
        rooms: data.rooms || null,
        furniture_volume: data.furniture_volume || null,
        owns_car: data.owns_car || null,
        is_self_employed: data.is_self_employed || null,
        ad_url: data.ad_url || null,
        members: data.members || []
      };
      
      console.log('Completing onboarding with data:', householdData);
      await onComplete(householdData);
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

  const toggleSelection = (field: 'specialItems', value: string) => {
    const currentItems = data.specialItems || [];
    const newItems = currentItems.includes(value)
      ? currentItems.filter(item => item !== value)
      : [...currentItems, value];
    updateData({ specialItems: newItems });
  };

  const renderStep = () => {
    const StepCard = ({ title, description, children }: { title: string, description: string, children: ReactNode }) => {
        const Icon = STEPS.find(s => s.id === currentStep)?.icon;
        return (
            <Card className="shadow-lg border-blue-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-blue-900">
                        {Icon && <Icon className="h-8 w-8 text-blue-500" />}
                        {title}
                    </CardTitle>
                    <CardDescription className="text-lg">{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">{children}</CardContent>
            </Card>
        );
    };
    
    switch (currentStep) {
      case 1:
        return (
            <StepCard title="Dein Umzugsabenteuer beginnt!" description="Erzähl uns ein bisschen was, damit wir dir perfekt helfen können.">
                <div>
                    <Label className="font-bold text-lg">Wie ziehst du um?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {householdTypeOptions.map(opt => (
                            <Button
                                key={opt.value}
                                variant={data.householdType === opt.value ? 'default' : 'outline'}
                                className="h-24 flex flex-col gap-2"
                                onClick={() => {
                                    updateData({ 
                                        householdType: opt.value as any,
                                        household_size: opt.size 
                                    });
                                }}
                            >
                                {opt.icon}
                                <span>{opt.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <Label htmlFor="name" className="font-bold text-lg">Wie nennst du deinen neuen Haushalt?</Label>
                    <Input 
                        id="name" 
                        value={data.name} 
                        onChange={(e) => updateData({ name: e.target.value })} 
                        placeholder="z.B. Müllers Hafen, WG Ahoi, Villa Kunterbunt" 
                        className="mt-2" 
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="move_date" className="font-bold text-lg">Wann wird umgezogen?</Label>
                    <Input 
                        id="move_date" 
                        type="date" 
                        value={data.move_date} 
                        onChange={(e) => updateData({ move_date: e.target.value })} 
                        className="mt-2" 
                    />
                    {errors.move_date && <p className="text-red-500 text-sm mt-1">{errors.move_date}</p>}
                </div>
                <div>
                    <Label htmlFor="property_type" className="font-bold text-lg">Wohnform</Label>
                    <Select value={data.property_type} onValueChange={(v) => updateData({ property_type: v as 'miete' | 'eigentum' })}>
                        <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Wähle eine Wohnform" />
                        </SelectTrigger>
                        <SelectContent>
                            {PROPERTY_TYPES.map(t => (
                                <SelectItem key={t.key} value={t.key}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
                </div>
            </StepCard>
        );

      case 2:
        return (
            <StepCard title="Die Mannschaft" description="Wer ist alles beim Umzug dabei?">
                <div>
                    <Label htmlFor="household_size" className="font-bold text-lg">Anzahl der Erwachsenen</Label>
                    <Input 
                        id="household_size" 
                        type="number" 
                        min="1" 
                        value={data.household_size} 
                        onChange={(e) => updateData({ household_size: parseInt(e.target.value) || 1 })} 
                        className="mt-2 w-32" 
                    />
                    {errors.household_size && <p className="text-red-500 text-sm mt-1">{errors.household_size}</p>}
                </div>
                <div>
                    <Label htmlFor="children_count" className="font-bold text-lg">Anzahl der Kinder</Label>
                    <Input 
                        id="children_count" 
                        type="number" 
                        min="0" 
                        value={data.children_count} 
                        onChange={(e) => updateData({ children_count: parseInt(e.target.value) || 0 })} 
                        className="mt-2 w-32" 
                    />
                </div>
            </StepCard>
        );
        
      case 3:
        return (
            <StepCard title="Tierische Begleiter" description="Gibt es Haustiere, die mit umziehen?">
                <div>
                    <Label htmlFor="pets_count" className="font-bold text-lg">Anzahl der Haustiere</Label>
                    <Input 
                        id="pets_count" 
                        type="number" 
                        min="0" 
                        value={data.pets_count} 
                        onChange={(e) => updateData({ pets_count: parseInt(e.target.value) || 0 })} 
                        className="mt-2 w-32" 
                    />
                </div>
            </StepCard>
        );

      case 4:
        return (
            <StepCard title="Dein Zuhause" description="Beschreibe alte und neue Wohnung.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Alte Wohnung</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Adresse (optional)</Label>
                                <Input 
                                    value={data.old_address || ''} 
                                    onChange={e => updateData({ old_address: e.target.value })}
                                    placeholder="Straße, PLZ Ort"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Neue Wohnung</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Adresse (optional)</Label>
                                <Input 
                                    value={data.new_address || ''} 
                                    onChange={e => updateData({ new_address: e.target.value })}
                                    placeholder="Straße, PLZ Ort"
                                />
                            </div>
                            <div>
                                <Label>Postleitzahl</Label>
                                <Input 
                                    value={data.postal_code || ''} 
                                    onChange={e => updateData({ postal_code: e.target.value })}
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Wohnfläche (m²)</Label>
                        <Input 
                            type="number" 
                            value={data.living_space || ''} 
                            onChange={e => updateData({ living_space: parseInt(e.target.value) || undefined })}
                            placeholder="75"
                        />
                    </div>
                    <div>
                        <Label>Anzahl Zimmer</Label>
                        <Input 
                            type="number" 
                            value={data.rooms || ''} 
                            onChange={e => updateData({ rooms: parseInt(e.target.value) || undefined })}
                            placeholder="3"
                        />
                    </div>
                    <div>
                        <Label>Möbelvolumen (m³)</Label>
                        <Input 
                            type="number" 
                            value={data.furniture_volume || ''} 
                            onChange={e => updateData({ furniture_volume: parseInt(e.target.value) || undefined })}
                            placeholder="25"
                        />
                    </div>
                </div>
            </StepCard>
        );

      case 5:
        return (
            <StepCard title="Dein Hab und Gut" description="Ein paar Details helfen uns, den Umfang deines Umzugs besser einzuschätzen.">
                <div>
                    <Label className="font-bold text-lg">Welcher Sammel-Typ bist du?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {inventoryStyles.map(style => (
                              <Button
                                key={style.value}
                                variant={data.inventoryStyle === style.value ? 'default' : 'outline'}
                                className="h-24 flex flex-col text-center"
                                onClick={() => {
                                    updateData({ 
                                        inventoryStyle: style.value as any,
                                        furniture_volume: style.volume 
                                    });
                                }}
                              >
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
                            <Button 
                                key={item.id} 
                                variant={data.specialItems?.includes(item.id) ? 'default' : 'outline'} 
                                onClick={() => toggleSelection('specialItems', item.id)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </StepCard>
        );

      case 6:
        return (
            <StepCard title="Dein Lebensstil" description="Wie lebst und arbeitest du? Das hilft uns bei der Detailplanung.">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="worksFromHome" className="font-bold text-lg">Arbeitest du (oft) im Home Office?</Label>
                    <Switch 
                        id="worksFromHome" 
                        checked={data.worksFromHome || false} 
                        onCheckedChange={c => updateData({ worksFromHome: c })} 
                    />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="owns_car" className="font-bold text-lg">Besitzt du ein Auto?</Label>
                    <Switch 
                        id="owns_car" 
                        checked={data.owns_car || false} 
                        onCheckedChange={c => updateData({ owns_car: c })} 
                    />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="is_self_employed" className="font-bold text-lg">Bist du selbstständig?</Label>
                    <Switch 
                        id="is_self_employed" 
                        checked={data.is_self_employed || false} 
                        onCheckedChange={c => updateData({ is_self_employed: c })} 
                    />
                </div>
                <div>
                    <Label htmlFor="hobbies" className="font-bold text-lg">Gibt es Hobbies mit sperriger Ausrüstung?</Label>
                    <Textarea 
                        id="hobbies" 
                        value={data.hobbies || ''} 
                        onChange={e => updateData({ hobbies: e.target.value })} 
                        placeholder="z.B. Musikinstrumente, Staffelei, Surfbrett, Angelausrüstung..." 
                        className="mt-2" 
                    />
                </div>
            </StepCard>
        );

      case 7:
        return (
            <StepCard title="Dein Umzugs-Stil" description="Wie möchtest du deinen Umzug organisieren?">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {moveStyles.map(style => (
                        <Button
                          key={style.value}
                          variant={data.moveStyle === style.value ? 'default' : 'outline'}
                          className="h-24 flex flex-col text-center"
                          onClick={() => updateData({ moveStyle: style.value as any })}
                        >
                            <span className="font-bold">{style.label}</span>
                            <span className="text-xs font-normal">{style.description}</span>
                        </Button>
                    ))}
                </div>
            </StepCard>
        );

      case 8:
        return (
            <StepCard title="Crew einladen" description="Möchtest du andere Personen zu deinem Haushalt einladen? (Optional)">
                <div className="text-center p-8">
                    <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                        Du kannst nach der Erstellung deines Haushalts jederzeit Mitglieder einladen.
                    </p>
                    <p className="text-sm text-gray-500">
                        Für jetzt überspringen wir diesen Schritt.
                    </p>
                </div>
            </StepCard>
        );

      case 9:
        return (
            <StepCard title="Fast am Ziel!" description="Ein letzter Blick auf deine Angaben. Passt alles?">
                <div className="space-y-4 text-sm">
                    <p><strong>Haushalt:</strong> {data.name}</p>
                    <p><strong>Umzug am:</strong> {new Date(data.move_date).toLocaleDateString('de-DE')}</p>
                    <p><strong>Mannschaft:</strong> {data.household_size} Erwachsene, {data.children_count} Kinder</p>
                    {data.pets_count > 0 && <p><strong>Haustiere:</strong> {data.pets_count}</p>}
                    <p><strong>Wohnform:</strong> {PROPERTY_TYPES.find(t => t.key === data.property_type)?.label}</p>
                    {data.new_address && <p><strong>Neue Adresse:</strong> {data.new_address}</p>}
                    {data.living_space && <p><strong>Wohnfläche:</strong> {data.living_space} m²</p>}
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
          <Breadcrumb className="my-2 hidden md:block">
            <BreadcrumbList>
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <BreadcrumbItem>
                    {idx === currentStep - 1 ? (
                      <BreadcrumbPage>{step.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button onClick={() => setCurrentStep(idx + 1)} className="text-xs md:text-sm">
                          {step.title}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {idx < STEPS.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2 bg-blue-200" />
          <div className="flex justify-between mt-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx + 1)}
                className={`h-2 flex-1 mx-0.5 rounded-full ${idx + 1 <= currentStep ? 'bg-blue-600' : 'bg-blue-100'}`}
                aria-label={`Gehe zu Schritt ${idx + 1}`}
              />
            ))}
          </div>
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

            {[6, 8].includes(currentStep) && (
              <Button variant="ghost" onClick={() => setCurrentStep(currentStep + 1)}>
                Schritt überspringen
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


import { useState, useEffect } from 'react';
import { OnboardingFlow } from './OnboardingFlow';
import { DraftList } from './DraftList';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from './OnboardingFlow';
import { CreateHouseholdFormData } from '@/hooks/useHouseholds';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingFlowWithDraftsProps {
  onComplete: (data: CreateHouseholdFormData) => Promise<void>;
  onSkip: () => void;
}

export const OnboardingFlowWithDrafts = ({ onComplete, onSkip }: OnboardingFlowWithDraftsProps) => {
  const { toast } = useToast();
  const { drafts, loading, getDraft, saveDraft, completeDraft } = useHouseholdDrafts();
  const [showDraftList, setShowDraftList] = useState(true);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<OnboardingData> | null>(null);
  const [initialStep, setInitialStep] = useState(1);
  // Hilfs-Ref, um zu verhindern, dass initialData/initialStep nach dem ersten Rendern überschrieben werden
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Wenn keine Entwürfe vorhanden sind, gehe direkt zum Onboarding
    if (!loading && drafts && drafts.length === 0) {
      setShowDraftList(false);
    }
  }, [loading, drafts]);

  // Initialisiere initialData/initialStep nur beim ersten Draft-Laden oder beim Start eines neuen Drafts
  useEffect(() => {
    if (!hasInitialized && (initialData || initialStep !== 1)) {
      setHasInitialized(true);
    }
  }, [initialData, initialStep, hasInitialized]);

  const handleNewDraft = () => {
    setShowDraftList(false);
    setCurrentDraftId(null);
    setInitialData(null);
    setInitialStep(1);
  };

  const handleContinueDraft = async (draftId: string) => {
    try {
      const draft = await getDraft(draftId);
      if (!draft) {
        toast({
          title: 'Fehler',
          description: 'Entwurf konnte nicht geladen werden',
          variant: 'destructive'
        });
        return;
      }

      setCurrentDraftId(draftId);
      
      // Konvertiere Draft-Daten zurück zu OnboardingData
      const draftData = draft.data as any;
      const convertedData: Partial<OnboardingData> = {
        name: draftData.name || '',
        move_date: draftData.move_date || '',
        household_size: draftData.household_size || 1,
        children_count: draftData.children_count || 0,
        pets_count: draftData.pets_count || 0,
        property_type: draftData.property_type || 'miete',
        postal_code: draftData.postal_code || '',
        old_address: draftData.old_address || '',
        new_address: draftData.new_address || '',
        living_space: draftData.living_space || undefined,
        rooms: draftData.rooms || undefined,
        furniture_volume: draftData.furniture_volume || undefined,
        owns_car: draftData.owns_car || false,
        is_self_employed: draftData.is_self_employed || false,
        ad_url: draftData.ad_url || undefined,
        members: draftData.members || [],
        // UI-spezifische Felder
        householdType: draftData.householdType || 'single',
        inventoryStyle: draftData.inventoryStyle || 'normal',
        specialItems: draftData.specialItems || [],
        worksFromHome: draftData.worksFromHome || false,
        hobbies: draftData.hobbies || '',
        moveStyle: draftData.moveStyle || 'mixed'
      };
      
      setInitialData(convertedData);
      setInitialStep(draft.lastStep || 1);
      setShowDraftList(false);
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Laden des Entwurfs ist ein Fehler aufgetreten',
        variant: 'destructive'
      });
    }
  };

  const handleBackToDrafts = () => {
    setShowDraftList(true);
  };

  const handleOnboardingComplete = async (data: CreateHouseholdFormData) => {
    try {
      console.log('OnboardingFlowWithDrafts: Completing with data:', data);
      
      if (currentDraftId) {
        await completeDraft(currentDraftId);
      }
      
      await onComplete(data);
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Abschließen des Onboardings ist ein Fehler aufgetreten',
        variant: 'destructive'
      });
    }
  };

  const handleSaveDraft = async (data: Partial<OnboardingData>, step: number) => {
    try {
      // Konvertiere OnboardingData zu Draft-kompatiblem Format
      const draftData = {
        name: data.name,
        move_date: data.move_date,
        household_size: data.household_size,
        children_count: data.children_count,
        pets_count: data.pets_count,
        property_type: data.property_type,
        postal_code: data.postal_code,
        old_address: data.old_address,
        new_address: data.new_address,
        living_space: data.living_space,
        rooms: data.rooms,
        furniture_volume: data.furniture_volume,
        owns_car: data.owns_car,
        is_self_employed: data.is_self_employed,
        ad_url: data.ad_url,
        members: data.members,
        // UI-spezifische Felder für Wiederherstellung
        householdType: data.householdType,
        inventoryStyle: data.inventoryStyle,
        specialItems: data.specialItems,
        worksFromHome: data.worksFromHome,
        hobbies: data.hobbies,
        moveStyle: data.moveStyle
      };
      // Beim Zwischenspeichern KEIN refreshDrafts
      const draftId = await saveDraft(draftData, currentDraftId || undefined, step, false);
      setCurrentDraftId(draftId);
      toast({
        title: 'Entwurf gespeichert',
        description: 'Dein Fortschritt wurde gespeichert und kann später fortgesetzt werden'
      });
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Speichern des Entwurfs ist ein Fehler aufgetreten',
        variant: 'destructive'
      });
      return false;
    }
  };

  if (showDraftList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          
          <DraftList 
            onNewDraft={handleNewDraft} 
            onContinueDraft={handleContinueDraft} 
          />
        </div>
      </div>
    );
  }

  return (
    <OnboardingFlow
      initialData={hasInitialized ? undefined : initialData}
      initialStep={hasInitialized ? undefined : initialStep}
      onComplete={handleOnboardingComplete}
      onSkip={onSkip}
      onSaveDraft={handleSaveDraft}
      onBackToDrafts={handleBackToDrafts}
    />
  );
};

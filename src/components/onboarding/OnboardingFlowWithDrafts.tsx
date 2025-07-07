import { useState, useEffect } from 'react';
import { OnboardingFlow } from './OnboardingFlow';
import { DraftList } from './DraftList';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '@/types/household';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingFlowWithDraftsProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => void;
}

export const OnboardingFlowWithDrafts = ({ onComplete, onSkip }: OnboardingFlowWithDraftsProps) => {
  const { toast } = useToast();
  const { getDraft, saveDraft, completeDraft } = useHouseholdDrafts();
  const [showDraftList, setShowDraftList] = useState(true);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<OnboardingData> | null>(null);
  const [initialStep, setInitialStep] = useState(1);

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
      // Convert draft data to OnboardingData format
      const draftData = draft.data as any;
      const convertedData: Partial<OnboardingData> = {
        householdName: draftData.householdName || draftData.name || '',
        moveDate: draftData.moveDate || draftData.move_date || '',
        householdSize: draftData.householdSize || draftData.household_size || 1,
        childrenCount: draftData.childrenCount || draftData.children_count || 0,
        petsCount: draftData.petsCount || draftData.pets_count || 0,
        propertyType: draftData.propertyType || draftData.property_type || 'miete',
        postalCode: draftData.postalCode || draftData.postal_code || '',
        oldAddress: draftData.oldAddress || draftData.old_address || '',
        newAddress: draftData.newAddress || draftData.new_address || '',
        livingSpace: draftData.livingSpace || draftData.living_space || 0,
        rooms: draftData.rooms || 0,
        furnitureVolume: draftData.furnitureVolume || draftData.furniture_volume || 0,
        ownsCar: draftData.ownsCar || draftData.owns_car || false,
        isSelfEmployed: draftData.isSelfEmployed || draftData.is_self_employed || false,
        adUrl: draftData.adUrl || draftData.ad_url || '',
        members: (draftData.members || []).map((member: any) => ({
          name: member.name || '',
          email: member.email || '',
          role: member.role || ''
        }))
      };
      setInitialData(convertedData);
      setInitialStep(draft.lastStep || 1);
      setShowDraftList(false);
    } catch (error) {
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

  const handleOnboardingComplete = async (data: OnboardingData) => {
    // Fülle fehlende Felder mit Defaultwerten auf
    const completeData: OnboardingData = {
      householdName: data.householdName || '',
      moveDate: data.moveDate || '',
      householdSize: data.householdSize || 1,
      childrenCount: data.childrenCount || 0,
      petsCount: data.petsCount || 0,
      propertyType: data.propertyType || 'miete',
      postalCode: data.postalCode || '',
      oldAddress: data.oldAddress || '',
      newAddress: data.newAddress || '',
      livingSpace: data.livingSpace || 0,
      rooms: data.rooms || 0,
      furnitureVolume: data.furnitureVolume || 0,
      ownsCar: data.ownsCar || false,
      isSelfEmployed: data.isSelfEmployed || false,
      adUrl: data.adUrl || '',
      members: data.members || []
    };
    try {
      if (currentDraftId) {
        await completeDraft(currentDraftId);
      }
      await onComplete(completeData);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Beim Abschließen des Onboardings ist ein Fehler aufgetreten',
        variant: 'destructive'
      });
    }
  };

  const handleSaveDraft = async (data: Partial<OnboardingData>, step: number) => {
    try {
      const draftId = await saveDraft(data, currentDraftId || undefined, step);
      setCurrentDraftId(draftId);
      
      toast({
        title: 'Entwurf gespeichert',
        description: 'Dein Fortschritt wurde gespeichert und kann später fortgesetzt werden'
      });
      
      return true;
    } catch (error) {
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
      initialData={{
        householdName: initialData?.householdName || '',
        moveDate: initialData?.moveDate || '',
        householdSize: initialData?.householdSize || 1,
        childrenCount: initialData?.childrenCount || 0,
        petsCount: initialData?.petsCount || 0,
        propertyType: initialData?.propertyType || 'miete',
        postalCode: initialData?.postalCode || '',
        oldAddress: initialData?.oldAddress || '',
        newAddress: initialData?.newAddress || '',
        livingSpace: initialData?.livingSpace || 0,
        rooms: initialData?.rooms || 0,
        furnitureVolume: initialData?.furnitureVolume || 0,
        ownsCar: initialData?.ownsCar || false,
        isSelfEmployed: initialData?.isSelfEmployed || false,
        adUrl: initialData?.adUrl || '',
        members: initialData?.members || []
      }}
      initialStep={initialStep}
      onComplete={handleOnboardingComplete}
      onSkip={onSkip}
      onSaveDraft={handleSaveDraft}
      onBackToDrafts={handleBackToDrafts}
    />
  );
};

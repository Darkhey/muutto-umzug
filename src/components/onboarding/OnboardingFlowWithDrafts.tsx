
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
        householdName: draftData.householdName || draftData.name,
        moveDate: draftData.moveDate || draftData.move_date,
        householdSize: draftData.householdSize || draftData.household_size,
        childrenCount: draftData.childrenCount || draftData.children_count,
        petsCount: draftData.petsCount || draftData.pets_count,
        propertyType: draftData.propertyType || draftData.property_type,
        postalCode: draftData.postalCode || draftData.postal_code,
        oldAddress: draftData.oldAddress || draftData.old_address,
        newAddress: draftData.newAddress || draftData.new_address,
        livingSpace: draftData.livingSpace || draftData.living_space,
        rooms: draftData.rooms,
        furnitureVolume: draftData.furnitureVolume || draftData.furniture_volume,
        ownsCar: draftData.ownsCar || draftData.owns_car,
        isSelfEmployed: draftData.isSelfEmployed || draftData.is_self_employed,
        adUrl: draftData.adUrl || draftData.ad_url,
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
    try {
      // Wenn ein Entwurf bearbeitet wurde, markiere ihn als abgeschlossen
      if (currentDraftId) {
        await completeDraft(currentDraftId);
      }
      
      // Rufe die übergeordnete onComplete-Funktion auf
      await onComplete(data);
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
      initialData={initialData}
      initialStep={initialStep}
      onComplete={handleOnboardingComplete}
      onSkip={onSkip}
      onSaveDraft={handleSaveDraft}
      onBackToDrafts={handleBackToDrafts}
    />
  );
};

import { useState, useEffect } from 'react';
import { OnboardingFlow } from './OnboardingFlow';
import { DraftList } from './DraftList';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData as OnboardingDataFromOnboardingFlow } from './OnboardingFlow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingFlowWithDraftsProps {
  onComplete: (data: OnboardingDataFromOnboardingFlow) => Promise<void>;
  onSkip: () => void;
}

export const OnboardingFlowWithDrafts = ({ onComplete, onSkip }: OnboardingFlowWithDraftsProps) => {
  const { toast } = useToast();
  const { drafts, loading, getDraft, saveDraft, completeDraft } = useHouseholdDrafts();
  const [showDraftList, setShowDraftList] = useState(true);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<OnboardingDataFromOnboardingFlow> | null>(null);
  const [initialStep, setInitialStep] = useState(1);

  useEffect(() => {
    if (!loading && drafts && drafts.length === 0) {
      setShowDraftList(false);
    }
  }, [loading, drafts]);

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
      const convertedData: Partial<OnboardingDataFromOnboardingFlow> = {
        householdName: draftData.householdName || draftData.name || '',
        moveDate: draftData.moveDate || draftData.move_date || '',
        householdType: 'family',
        adultsCount: draftData.household_size || 1,
        children: [],
        pets: [],
        oldHome: {},
        newHome: {},
        inventoryStyle: 'normal',
        specialItems: [],
        worksFromHome: false,
        hobbies: '',
        moveStyle: 'diy',
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

  const handleOnboardingComplete = async (data: OnboardingDataFromOnboardingFlow) => {
    // Fülle fehlende Felder mit Defaultwerten auf
    const completeData: OnboardingDataFromOnboardingFlow = {
      ...data,
      householdType: data.householdType || 'family',
      householdName: data.householdName || '',
      moveDate: data.moveDate || '',
      adultsCount: data.adultsCount || 1,
      children: data.children || [],
      pets: data.pets || [],
      oldHome: data.oldHome || {},
      newHome: data.newHome || {},
      inventoryStyle: data.inventoryStyle || 'normal',
      specialItems: data.specialItems || [],
      worksFromHome: data.worksFromHome || false,
      hobbies: data.hobbies || '',
      moveStyle: data.moveStyle || 'diy',
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

  const handleSaveDraft = async (data: Partial<OnboardingDataFromOnboardingFlow>, step: number) => {
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

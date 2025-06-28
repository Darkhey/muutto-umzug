import { useState, useEffect } from 'react';
import { OnboardingFlow } from './OnboardingFlow';
import { DraftList } from './DraftList';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { CreateHouseholdData } from '@/hooks/useHouseholds';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingFlowWithDraftsProps {
  onComplete: (data: CreateHouseholdData) => void;
  onSkip: () => void;
}

export const OnboardingFlowWithDrafts = ({ onComplete, onSkip }: OnboardingFlowWithDraftsProps) => {
  const { toast } = useToast();
  const { getDraft, saveDraft, completeDraft } = useHouseholdDrafts();
  const [showDraftList, setShowDraftList] = useState(true);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CreateHouseholdData> | null>(null);
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
      setInitialData(draft.data as Partial<CreateHouseholdData>);
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

  const handleOnboardingComplete = async (data: CreateHouseholdData) => {
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

  const handleSaveDraft = async (data: Partial<CreateHouseholdData>, step: number) => {
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
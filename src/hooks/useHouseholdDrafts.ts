import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HouseholdDraft, DraftSummary } from '@/types/draft';
import { CreateHouseholdFormData } from '@/hooks/useHouseholds';
import { validateHouseholdData } from '@/utils/validation';

export function useHouseholdDrafts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Berechnet den Prozentsatz der Vollständigkeit eines Entwurfs
  const calculateCompletionPercentage = (data: Partial<CreateHouseholdFormData>): number => {
    const requiredFields = ['name', 'move_date', 'property_type', 'household_size'];
    const optionalFields = [
      'children_count', 'pets_count', 'postal_code', 'old_address', 
      'new_address', 'living_space', 'rooms', 'furniture_volume'
    ];
    
    // Zähle ausgefüllte Pflichtfelder
    const filledRequiredFields = requiredFields.filter(field => {
      const value = data[field as keyof typeof data];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    // Zähle ausgefüllte optionale Felder
    const filledOptionalFields = optionalFields.filter(field => {
      const value = data[field as keyof typeof data];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    // Berechne Prozentsatz (Pflichtfelder haben höhere Gewichtung)
    const requiredWeight = 0.7;
    const optionalWeight = 0.3;
    
    const requiredPercentage = (filledRequiredFields / requiredFields.length) * requiredWeight * 100;
    const optionalPercentage = (filledOptionalFields / optionalFields.length) * optionalWeight * 100;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };

  // Lädt alle Entwürfe des aktuellen Benutzers
  const fetchDrafts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('household_drafts')
        .select('id, data, updated_at, status')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const summaries: DraftSummary[] = (data || []).map(draft => ({
        id: draft.id,
        name: draft.data?.name || 'Unbenannter Entwurf',
        updatedAt: draft.updated_at,
        completionPercentage: draft.data ? calculateCompletionPercentage(draft.data) : 0,
        status: draft.status,
        data: draft.data || {}
      }));
      
      setDrafts(summaries);
    } catch (err) {
      console.error('Fehler beim Laden der Entwürfe:', err);
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Entwürfe'));
      toast({
        title: 'Fehler beim Laden der Entwürfe',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Erstellt oder aktualisiert einen Entwurf
  const saveDraft = async (
    data: Partial<CreateHouseholdFormData>, 
    draftId?: string, 
    lastStep: number = 1
  ): Promise<string> => {
    if (!user) throw new Error('Benutzer ist nicht angemeldet');
    
    try {
      const now = new Date().toISOString();
      const completionPercentage = calculateCompletionPercentage(data);
      const validationResult = validateHouseholdData(data as CreateHouseholdFormData, true);
      
      // Wenn kein draftId vorhanden ist, erstelle einen neuen Entwurf
      if (!draftId) {
        draftId = uuidv4();
        
        const { error } = await supabase
          .from('household_drafts')
          .insert({
            id: draftId,
            user_id: user.id,
            data,
            created_at: now,
            updated_at: now,
            status: 'draft',
            completion_percentage: completionPercentage,
            last_step: lastStep,
            version: 1,
            validation_errors: validationResult.errors
          });
        
        if (error) throw error;
        
        toast({
          title: 'Entwurf gespeichert',
          description: 'Dein Haushaltsentwurf wurde gespeichert und kann später fortgesetzt werden.'
        });
      } else {
        // Bestehenden Entwurf aktualisieren
        const { data: existingDraft } = await supabase
          .from('household_drafts')
          .select('version')
          .eq('id', draftId)
          .single();
        
        const newVersion = existingDraft ? existingDraft.version + 1 : 1;
        
        const { error } = await supabase
          .from('household_drafts')
          .update({
            data,
            updated_at: now,
            completion_percentage: completionPercentage,
            last_step: lastStep,
            version: newVersion,
            validation_errors: validationResult.errors
          })
          .eq('id', draftId);
        
        if (error) throw error;
        
        // Erstelle einen Backup-Eintrag in der Versionstabelle
        await supabase
          .from('household_draft_versions')
          .insert({
            draft_id: draftId,
            version: newVersion,
            data,
            created_at: now,
            user_id: user.id
          });
        
        toast({
          title: 'Entwurf aktualisiert',
          description: 'Dein Haushaltsentwurf wurde aktualisiert.'
        });
      }
      
      await fetchDrafts();
      return draftId;
    } catch (err) {
      console.error('Fehler beim Speichern des Entwurfs:', err);
      toast({
        title: 'Fehler beim Speichern',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Lädt einen spezifischen Entwurf
  const getDraft = async (draftId: string): Promise<HouseholdDraft | null> => {
    try {
      const { data, error } = await supabase
        .from('household_drafts')
        .select('*')
        .eq('id', draftId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return data as HouseholdDraft;
    } catch (err) {
      console.error('Fehler beim Laden des Entwurfs:', err);
      toast({
        title: 'Fehler beim Laden des Entwurfs',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Markiert einen Entwurf als abgeschlossen
  const completeDraft = async (draftId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('household_drafts')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);
      
      if (error) throw error;
      
      toast({
        title: 'Entwurf abgeschlossen',
        description: 'Der Haushaltsentwurf wurde erfolgreich abgeschlossen.'
      });
      
      await fetchDrafts();
    } catch (err) {
      console.error('Fehler beim Abschließen des Entwurfs:', err);
      toast({
        title: 'Fehler beim Abschließen',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Löscht einen Entwurf
  const deleteDraft = async (draftId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('household_drafts')
        .delete()
        .eq('id', draftId);
      
      if (error) throw error;
      
      toast({
        title: 'Entwurf gelöscht',
        description: 'Der Haushaltsentwurf wurde erfolgreich gelöscht.'
      });
      
      await fetchDrafts();
    } catch (err) {
      console.error('Fehler beim Löschen des Entwurfs:', err);
      toast({
        title: 'Fehler beim Löschen',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Markiert einen Entwurf als aufgegeben
  const abandonDraft = async (draftId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('household_drafts')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);
      
      if (error) throw error;
      
      toast({
        title: 'Entwurf verworfen',
        description: 'Der Haushaltsentwurf wurde als verworfen markiert.'
      });
      
      await fetchDrafts();
    } catch (err) {
      console.error('Fehler beim Verwerfen des Entwurfs:', err);
      toast({
        title: 'Fehler beim Verwerfen',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Lädt die Versionshistorie eines Entwurfs
  const getDraftVersions = async (draftId: string) => {
    try {
      const { data, error } = await supabase
        .from('household_draft_versions')
        .select('*')
        .eq('draft_id', draftId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Versionshistorie:', err);
      toast({
        title: 'Fehler beim Laden der Versionen',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      return [];
    }
  };

  // Stellt eine bestimmte Version eines Entwurfs wieder her
  const restoreDraftVersion = async (draftId: string, version: number): Promise<void> => {
    try {
      // Lade die gewünschte Version
      const { data: versionData, error: versionError } = await supabase
        .from('household_draft_versions')
        .select('data')
        .eq('draft_id', draftId)
        .eq('version', version)
        .single();
      
      if (versionError) throw versionError;
      if (!versionData) throw new Error('Version nicht gefunden');
      
      // Aktualisiere den Entwurf mit den Daten der Version
      const { error } = await supabase
        .from('household_drafts')
        .update({
          data: versionData.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);
      
      if (error) throw error;
      
      toast({
        title: 'Version wiederhergestellt',
        description: `Version ${version} wurde erfolgreich wiederhergestellt.`
      });
      
      await fetchDrafts();
    } catch (err) {
      console.error('Fehler beim Wiederherstellen der Version:', err);
      toast({
        title: 'Fehler bei der Wiederherstellung',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Validiert einen Entwurf und gibt Fehler zurück
  const validateDraft = async (draftId: string): Promise<Record<string, string>> => {
    try {
      const draft = await getDraft(draftId);
      if (!draft) throw new Error('Entwurf nicht gefunden');
      
      const validationResult = validateHouseholdData(draft.data as CreateHouseholdFormData, false);
      
      // Aktualisiere die Validierungsfehler im Entwurf
      await supabase
        .from('household_drafts')
        .update({
          validation_errors: validationResult.errors,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);
      
      return validationResult.errors;
    } catch (err) {
      console.error('Fehler bei der Validierung des Entwurfs:', err);
      toast({
        title: 'Validierungsfehler',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
      return {};
    }
  };

  // Lade Entwürfe beim ersten Rendern
  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  return {
    drafts,
    loading,
    error,
    saveDraft,
    getDraft,
    completeDraft,
    deleteDraft,
    abandonDraft,
    getDraftVersions,
    restoreDraftVersion,
    validateDraft,
    refetch: fetchDrafts
  };
}
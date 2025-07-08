import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { 
  FileEdit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ArrowRight,
  History
} from 'lucide-react';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { DraftSummary } from '@/types/draft';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface DraftListProps {
  onNewDraft: () => void;
  onContinueDraft: (draftId: string) => void;
}

export const DraftList = ({ onNewDraft, onContinueDraft }: DraftListProps) => {
  const { drafts, loading, deleteDraft, refetch } = useHouseholdDrafts();
  const [activeDrafts, setActiveDrafts] = useState<DraftSummary[]>([]);
  const [completedDrafts, setCompletedDrafts] = useState<DraftSummary[]>([]);

  useEffect(() => {
    if (drafts) {
      setActiveDrafts(drafts.filter(draft => draft.status === 'draft'));
      setCompletedDrafts(drafts.filter(draft => draft.status !== 'draft'));
    }
  }, [drafts]);

  const handleDeleteDraft = async (draftId: string) => {
    await deleteDraft(draftId);
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: de
      });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const formatMoveDate = (date: string | undefined) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString('de-DE');
    } catch (error) {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Abgeschlossen
          </Badge>
        );
      case 'abandoned':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Verworfen
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Bearbeitung
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center mt-4">Entwürfe werden geladen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Haushaltsentwürfe</h2>
        <Button onClick={onNewDraft} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Entwurf
        </Button>
      </div>

      {activeDrafts.length === 0 && completedDrafts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <FileEdit className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Entwürfe vorhanden</h3>
              <p className="text-gray-600 mb-4">
                Du hast noch keine Haushaltsentwürfe erstellt. Starte jetzt mit deinem ersten Entwurf!
              </p>
              <Button onClick={onNewDraft} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Ersten Entwurf erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeDrafts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Aktive Entwürfe</h3>
              <div className="grid gap-4">
                {activeDrafts.map((draft) => (
                  <Card key={draft.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{draft.name || 'Unbenannter Entwurf'}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            Zuletzt bearbeitet: {formatDate(draft.updatedAt)}
                          </div>
                        </div>
                        {getStatusBadge(draft.status)}
                      </div>

                      {draft.data && (
                        <div className="text-sm text-gray-700 mb-2">
                          {draft.data.move_date && (
                            <p>Umzugsdatum: {formatMoveDate(draft.data.move_date)}</p>
                          )}
                          {draft.data.household_size && (
                            <p>Personen: {draft.data.household_size}</p>
                          )}
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fortschritt</span>
                          <span>{draft.completionPercentage}%</span>
                        </div>
                        <Progress value={draft.completionPercentage} className="h-2" />
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Löschen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Entwurf löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bist du sicher, dass du diesen Entwurf löschen möchtest? 
                                  Diese Aktion kann nicht rückgängig gemacht werden.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4 mr-1" />
                            Versionen
                          </Button>
                        </div>

                        <Button 
                          onClick={() => onContinueDraft(draft.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Fortsetzen
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedDrafts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Abgeschlossene Entwürfe</h3>
              <div className="grid gap-4">
                {completedDrafts.map((draft) => (
                  <Card key={draft.id} className="hover:shadow-md transition-shadow opacity-75">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{draft.name || 'Unbenannter Entwurf'}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(draft.updatedAt)}
                          </div>
                        </div>
                        {getStatusBadge(draft.status)}
                      </div>

                      {draft.data && (
                        <div className="text-sm text-gray-700 mb-2">
                          {draft.data.move_date && (
                            <p>Umzugsdatum: {formatMoveDate(draft.data.move_date)}</p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Löschen
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Entwurf löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du diesen Entwurf löschen möchtest? 
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteDraft(draft.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
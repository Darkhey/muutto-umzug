
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft } from 'lucide-react';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { CreateHouseholdData } from '@/types/household';

interface DraftVersionHistoryProps {
  draftId: string;
  onBack: () => void;
  onSelectVersion?: (version: any) => void;
}

export const DraftVersionHistory: React.FC<DraftVersionHistoryProps> = ({
  draftId,
  onBack,
  onSelectVersion
}) => {
  const { toast } = useToast();
  const [versions, setVersions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVersions = async () => {
      try {
        // This would typically fetch from a versions API
        setVersions([]);
      } catch (error) {
        toast({
          title: 'Fehler',
          description: 'Versionshistorie konnte nicht geladen werden',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [draftId, toast]);

  if (loading) {
    return <div>Lädt Versionshistorie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-2xl font-bold">Versionshistorie</h1>
      </div>

      <div className="space-y-4">
        {versions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Keine Versionen verfügbar</p>
            </CardContent>
          </Card>
        ) : (
          versions.map((version, index) => (
            <Card key={version.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Version {version.version}
                  </CardTitle>
                  <Badge variant="outline">
                    {new Date(version.created_at).toLocaleDateString('de-DE')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Schritt {version.last_step || 1}
                  </p>
                  {onSelectVersion && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectVersion(version)}
                    >
                      Wiederherstellen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHouseholdDrafts } from '@/hooks/useHouseholdDrafts';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { History, ArrowLeft, RotateCcw, Eye } from 'lucide-react';

interface DraftVersion {
  id: string;
  draft_id: string;
  version: number;
  data: unknown;
  created_at: string;
  user_id: string;
}

interface DraftVersionHistoryProps {
  draftId: string;
  onBack: () => void;
  onRestore: (draftId: string, version: number) => void;
}

export const DraftVersionHistory = ({ draftId, onBack, onRestore }: DraftVersionHistoryProps) => {
  const { getDraftVersions } = useHouseholdDrafts();
  const { toast } = useToast();
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DraftVersion | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const versionData = await getDraftVersions(draftId);
        setVersions(versionData as DraftVersion[]);
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
  }, [draftId]);

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

  const handleRestore = (version: DraftVersion) => {
    onRestore(draftId, version.version);
  };

  const handleViewDetails = (version: DraftVersion) => {
    setSelectedVersion(version);
  };

  const handleCloseDetails = () => {
    setSelectedVersion(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center mt-4">Versionshistorie wird geladen...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedVersion) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Version {selectedVersion.version} Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Liste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge className="bg-blue-100 text-blue-800">
                Version {selectedVersion.version}
              </Badge>
              <span className="text-sm text-gray-600">
                {formatDate(selectedVersion.created_at)}
              </span>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Haushaltsdaten:</h4>
              <pre className="text-xs overflow-auto p-2 bg-white border rounded">
                {JSON.stringify(selectedVersion.data, null, 2)}
              </pre>
            </div>

            <Button 
              onClick={() => handleRestore(selectedVersion)}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Diese Version wiederherstellen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Versionshistorie
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Versionshistorie</h3>
            <p className="text-gray-600">
              Für diesen Entwurf sind noch keine Versionen vorhanden.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <div 
                key={version.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Version {version.version}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formatDate(version.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleRestore(version)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Wiederherstellen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
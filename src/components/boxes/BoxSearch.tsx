import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package, 
  MapPin, 
  Camera,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { BoxSearchResult } from '@/types/box';

interface BoxSearchProps {
  householdId: string;
  onSearch: (searchTerm: string) => Promise<BoxSearchResult[]>;
}

export function BoxSearch({ householdId, onSearch }: BoxSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BoxSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const results = await onSearch(searchTerm);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      leer: 'bg-gray-100 text-gray-800',
      gepackt: 'bg-blue-100 text-blue-800',
      versiegelt: 'bg-yellow-100 text-yellow-800',
      transportiert: 'bg-purple-100 text-purple-800',
      ausgepackt: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Suchfeld */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Gegenstände in Kartons suchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="z.B. 'Kaffeemaschine', 'Bücher', 'Kleidung'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suche...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Suchen
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Suchen Sie nach Gegenständen in Ihren Kartons. Die KI hilft Ihnen dabei, alles wiederzufinden.
          </p>
        </CardContent>
      </Card>

      {/* Suchergebnisse */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Suchergebnisse für "{searchTerm}"
              {searchResults.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({searchResults.length} Ergebnis{searchResults.length !== 1 ? 'se' : ''})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p>Keine Gegenstände gefunden</p>
                <p className="text-sm">Versuchen Sie andere Suchbegriffe oder fügen Sie Fotos zu Ihren Kartons hinzu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {result.item_name || 'Unbekannter Gegenstand'}
                          </h3>
                          <Badge className={getStatusColor(result.box_status)}>
                            {result.box_status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              Karton {result.box_number}
                              {result.box_name && ` - ${result.box_name}`}
                            </span>
                            {result.current_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {result.current_location}
                              </span>
                            )}
                          </div>
                        </div>

                        {result.item_description && (
                          <p className="text-sm text-gray-700 mb-2">
                            {result.item_description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.photos && result.photos.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Camera className="h-3 w-3" />
                              {result.photos.length} Foto{result.photos.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {result.comments && result.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {result.comments.length} Kommentar{result.comments.length !== 1 ? 'e' : ''}
                            </span>
                          )}
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                          {result.room && (
                            <Badge variant="secondary" className="text-xs">
                              {result.room}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tipps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipps für bessere Suchergebnisse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Fotos hinzufügen</h4>
              <p className="text-gray-600">
                Laden Sie Fotos Ihrer Kartons hoch. Die KI erkennt automatisch den Inhalt und macht ihn durchsuchbar.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Detaillierte Beschreibungen</h4>
              <p className="text-gray-600">
                Fügen Sie detaillierte Beschreibungen zu Ihren Kartons hinzu. Je mehr Informationen, desto besser die Suche.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Kategorien verwenden</h4>
              <p className="text-gray-600">
                Ordnen Sie Ihre Kartons in Kategorien ein. Das hilft bei der Organisation und Suche.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Standorte verfolgen</h4>
              <p className="text-gray-600">
                Aktualisieren Sie regelmäßig den Standort Ihrer Kartons. So wissen Sie immer, wo sich Ihre Gegenstände befinden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
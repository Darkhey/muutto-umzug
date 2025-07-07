import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Package, 
  Camera, 
  MapPin, 
  MessageSquare,
  Filter,
  BarChart3,
  X,
  ExternalLink
} from 'lucide-react';
import { useBoxes } from '@/hooks/useBoxes';
import { BoxWithDetails, BoxStatus, BoxCategory, CreateBoxData, BoxSearchResult } from '@/types/box';
import { CreateBoxDialog } from './CreateBoxDialog';
import { useToast } from '@/hooks/use-toast';
import { BoxList } from './BoxList';
import { BoxSearch } from './BoxSearch';
import { BoxStatistics } from './BoxStatistics';
import { BoxFilters } from './BoxFilters';

interface BoxManagementModuleProps {
  householdId: string;
}

const statusColors: Record<BoxStatus, string> = {
  leer: 'bg-gray-100 text-gray-800',
  gepackt: 'bg-blue-100 text-blue-800',
  versiegelt: 'bg-yellow-100 text-yellow-800',
  transportiert: 'bg-purple-100 text-purple-800',
  ausgepackt: 'bg-green-100 text-green-800'
};

const categoryIcons: Record<BoxCategory, string> = {
  küche: '🍳',
  wohnzimmer: '🛋️',
  schlafzimmer: '🛏️',
  bad: '🚿',
  keller: '🏠',
  dachboden: '🏠',
  büro: '💼',
  kinderzimmer: '🧸',
  garten: '🌱',
  sonstiges: '📦'
};

export function BoxManagementModule({ householdId }: BoxManagementModuleProps) {
  const {
    boxes,
    loading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    createBox,
    updateBox,
    deleteBox,
    searchItems,
    getStatistics
  } = useBoxes(householdId);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BoxSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleCreateBox = async (boxData: CreateBoxData) => {
    try {
      const result = await createBox(boxData);
      if (result) {
        setShowCreateDialog(false);
        toast({
          title: "Karton erstellt",
          description: `Karton "${result.box_number}" wurde erfolgreich erstellt.`,
          variant: "default",
        });
      } else {
        throw new Error('Karton konnte nicht erstellt werden');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Kartons:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Suchbegriff erforderlich",
        description: "Bitte geben Sie einen Suchbegriff ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchItems(searchTerm);
      setSearchResults(results);
      setShowSearchResults(true);
      
      if (results.length === 0) {
        toast({
          title: "Keine Ergebnisse",
          description: `Keine Kartons oder Gegenstände für "${searchTerm}" gefunden.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Suche abgeschlossen",
          description: `${results.length} Ergebnis${results.length === 1 ? '' : 'se'} für "${searchTerm}" gefunden.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
      toast({
        title: "Fehler bei der Suche",
        description: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusCount = (status: BoxStatus) => {
    return boxes.filter(box => (box as any).status === status).length;
  };

  const getCategoryCount = (category: BoxCategory) => {
    return boxes.filter(box => (box as any).category === category).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Fehler beim Laden der Kartons: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kartonverwaltung
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Karton
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{boxes.length}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount('ausgepackt')}
              </div>
              <div className="text-sm text-gray-600">Ausgepackt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getStatusCount('versiegelt')}
              </div>
              <div className="text-sm text-gray-600">Versiegelt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getStatusCount('transportiert')}
              </div>
              <div className="text-sm text-gray-600">Transportiert</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {boxes.filter(box => box.photos && box.photos.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Mit Fotos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {boxes.filter(box => box.contents?.some(content => content.is_fragile)).length}
              </div>
              <div className="text-sm text-gray-600">Zerbrechlich</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Suche nach Gegenständen in Kartons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hauptinhalt */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="search">Suche</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          <TabsTrigger value="filters">Filter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BoxList 
            boxes={boxes}
            onUpdateBox={updateBox}
            onDeleteBox={deleteBox}
            statusColors={statusColors}
            categoryIcons={categoryIcons}
          />
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <BoxSearch 
            householdId={householdId}
            onSearch={searchItems}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <BoxStatistics 
            householdId={householdId}
            getStatistics={getStatistics}
          />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <BoxFilters 
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
        </TabsContent>
      </Tabs>

      {/* Create Box Dialog */}
      <CreateBoxDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateBox}
      />

      {/* Search Results Dialog */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Suchergebnisse für "{searchTerm}"</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchResults(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Ergebnisse gefunden</p>
                <p className="text-sm">Versuchen Sie einen anderen Suchbegriff</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <Card key={`${result.box_id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {result.box_number}
                            </Badge>
                            {result.box_status && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${statusColors[result.box_status]}`}
                              >
                                {result.box_status}
                              </Badge>
                            )}
                            {result.category && (
                              <Badge variant="outline" className="text-xs">
                                {categoryIcons[result.category]} {result.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {result.box_name && (
                              <h4 className="font-medium text-sm">{result.box_name}</h4>
                            )}
                            {result.item_name && (
                              <p className="text-sm font-medium text-blue-600">
                                📦 {result.item_name}
                              </p>
                            )}
                            {result.item_description && (
                              <p className="text-xs text-gray-600">{result.item_description}</p>
                            )}
                            {result.room && (
                              <p className="text-xs text-gray-500">
                                🏠 Raum: {result.room}
                              </p>
                            )}
                            {result.current_location && (
                              <p className="text-xs text-gray-500">
                                📍 Standort: {result.current_location}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {result.photos && result.photos.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              📷 {result.photos.length}
                            </Badge>
                          )}
                          {result.comments && result.comments.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              💬 {result.comments.length}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Navigate to box detail view
                              toast({
                                title: "Karton öffnen",
                                description: `Karton ${result.box_number} wird geöffnet...`,
                                variant: "default",
                              });
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{searchResults.length} Ergebnis{searchResults.length === 1 ? '' : 'se'} gefunden</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchResults(false)}
              >
                Schließen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
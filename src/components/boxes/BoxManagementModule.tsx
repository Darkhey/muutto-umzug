import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Package, 
  Camera, 
  MapPin, 
  MessageSquare,
  Filter,
  BarChart3
} from 'lucide-react';
import { useBoxes } from '@/hooks/useBoxes';
import { BoxWithDetails, BoxStatus, BoxCategory } from '@/types/box';
import { CreateBoxDialog } from './CreateBoxDialog';
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

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateBox = async (boxData: any) => {
    const result = await createBox(boxData);
    if (result) {
      setShowCreateDialog(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchItems(searchTerm);
      // Hier könnten wir die Ergebnisse in einem Modal oder separaten Tab anzeigen
      console.log('Suchergebnisse:', results);
    }
  };

  const getStatusCount = (status: BoxStatus) => {
    return boxes.filter(box => box.status === status).length;
  };

  const getCategoryCount = (category: BoxCategory) => {
    return boxes.filter(box => box.category === category).length;
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
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
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
        householdId={householdId}
      />
    </div>
  );
} 
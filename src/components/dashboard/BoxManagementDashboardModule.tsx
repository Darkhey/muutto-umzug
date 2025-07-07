import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Camera, 
  MessageSquare,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search
} from 'lucide-react';
import { BoxManagementModule } from '../boxes/BoxManagementModule';

interface BoxManagementDashboardModuleProps {
  householdId: string;
  onExpand?: () => void;
}

export function BoxManagementDashboardModule({ 
  householdId, 
  onExpand 
}: BoxManagementDashboardModuleProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kartonverwaltung
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExpand}>
              <Search className="h-4 w-4 mr-2" />
              Suche
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Karton
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Schnellstatistiken */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Gesamt Kartons</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Ausgepackt</div>
            </div>
          </div>

          {/* Aktuelle Aktivitäten */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Aktuelle Aktivitäten</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Noch keine Kartons erstellt</span>
              </div>
            </div>
          </div>

          {/* Schnellaktionen */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Schnellaktionen</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
                <Camera className="h-4 w-4 mb-1" />
                <span className="text-xs">Foto hinzufügen</span>
              </Button>
              <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
                <MessageSquare className="h-4 w-4 mb-1" />
                <span className="text-xs">Kommentar</span>
              </Button>
            </div>
          </div>

          {/* Empfehlungen */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Empfehlungen</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
                <Camera className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">Fügen Sie Fotos zu Ihren Kartons hinzu für KI-gestützte Suche</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Beginnen Sie mit dem Packen der wichtigsten Räume</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
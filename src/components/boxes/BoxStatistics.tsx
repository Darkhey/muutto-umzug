import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package, 
  Camera, 
  MessageSquare,
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { BoxStatistics as BoxStatisticsType } from '@/types/box';

interface BoxStatisticsProps {
  householdId: string;
  getStatistics: () => Promise<BoxStatisticsType | null>;
}

export function BoxStatistics({ householdId, getStatistics }: BoxStatisticsProps) {
  const [stats, setStats] = useState<BoxStatisticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [householdId]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Keine Statistiken verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
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
    return icons[category] || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total_boxes}</div>
                <div className="text-sm text-gray-600">Gesamt Kartons</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total_items}</div>
                <div className="text-sm text-gray-600">Gegenstände</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.fragile_items}</div>
                <div className="text-sm text-gray-600">Zerbrechlich</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.estimated_total_value.toFixed(0)}€</div>
                <div className="text-sm text-gray-600">Gesamtwert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Status-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.boxes_by_status).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold mb-1">{count}</div>
                <Badge className={getStatusColor(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kategorie-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kategorie-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.boxes_by_category)
              .filter(([_, count]) => count > 0)
              .sort(([_, a], [__, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {category}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Zusätzliche Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4" />
              Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.boxes_with_photos}
              </div>
              <div className="text-sm text-gray-600">
                von {stats.total_boxes} Kartons
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_boxes > 0 
                  ? `${((stats.boxes_with_photos / stats.total_boxes) * 100).toFixed(1)}%`
                  : '0%'
                } haben Fotos
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              Kommentare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.boxes_with_comments}
              </div>
              <div className="text-sm text-gray-600">
                von {stats.total_boxes} Kartons
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_boxes > 0 
                  ? `${((stats.boxes_with_comments / stats.total_boxes) * 100).toFixed(1)}%`
                  : '0%'
                } haben Kommentare
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              Fortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.boxes_by_status.ausgepackt}
              </div>
              <div className="text-sm text-gray-600">
                ausgepackt
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_boxes > 0 
                  ? `${((stats.boxes_by_status.ausgepackt / stats.total_boxes) * 100).toFixed(1)}%`
                  : '0%'
                } abgeschlossen
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empfehlungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empfehlungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.boxes_with_photos < stats.total_boxes * 0.5 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Fotos hinzufügen</div>
                  <div className="text-sm text-blue-700">
                    Nur {stats.boxes_with_photos} von {stats.total_boxes} Kartons haben Fotos. 
                    Fotos helfen bei der KI-gestützten Suche.
                  </div>
                </div>
              </div>
            )}

            {stats.fragile_items > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">Zerbrechliche Gegenstände</div>
                  <div className="text-sm text-orange-700">
                    Sie haben {stats.fragile_items} zerbrechliche Gegenstände. 
                    Stellen Sie sicher, dass diese sicher verpackt sind.
                  </div>
                </div>
              </div>
            )}

            {stats.boxes_by_status.leer > stats.total_boxes * 0.3 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Package className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-900">Leere Kartons</div>
                  <div className="text-sm text-yellow-700">
                    {stats.boxes_by_status.leer} Kartons sind noch leer. 
                    Beginnen Sie mit dem Packen der wichtigsten Räume.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Camera, 
  MapPin, 
  MessageSquare, 
  Package,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BoxWithDetails, BoxStatus, BoxCategory } from '@/types/box';
import { BoxDetailDialog } from './BoxDetailDialog';
import { BoxPhotoUpload } from './BoxPhotoUpload';

interface BoxListProps {
  boxes: BoxWithDetails[];
  onUpdateBox: (boxId: string, updates: any) => Promise<boolean>;
  onDeleteBox: (boxId: string) => Promise<boolean>;
  statusColors: Record<BoxStatus, string>;
  categoryIcons: Record<BoxCategory, string>;
}

export function BoxList({ 
  boxes, 
  onUpdateBox, 
  onDeleteBox, 
  statusColors, 
  categoryIcons 
}: BoxListProps) {
  const [selectedBox, setSelectedBox] = useState<BoxWithDetails | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handleStatusChange = async (boxId: string, newStatus: BoxStatus) => {
    await onUpdateBox(boxId, { status: newStatus });
  };

  const handleDeleteBox = async (boxId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Karton löschen möchten?')) {
      await onDeleteBox(boxId);
    }
  };

  const getStatusLabel = (status: BoxStatus) => {
    const labels: Record<BoxStatus, string> = {
      leer: 'Leer',
      gepackt: 'Gepackt',
      versiegelt: 'Versiegelt',
      transportiert: 'Transportiert',
      ausgepackt: 'Ausgepackt'
    };
    return labels[status];
  };

  const getCategoryLabel = (category: BoxCategory) => {
    const labels: Record<BoxCategory, string> = {
      küche: 'Küche',
      wohnzimmer: 'Wohnzimmer',
      schlafzimmer: 'Schlafzimmer',
      bad: 'Bad',
      keller: 'Keller',
      dachboden: 'Dachboden',
      büro: 'Büro',
      kinderzimmer: 'Kinderzimmer',
      garten: 'Garten',
      sonstiges: 'Sonstiges'
    };
    return labels[category];
  };

  if (boxes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kartons vorhanden</h3>
          <p className="text-gray-600">Erstellen Sie Ihren ersten Karton, um mit der Verwaltung zu beginnen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {boxes.map((box) => (
        <Card key={box.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{categoryIcons[box.category || 'sonstiges']}</div>
                <div>
                  <CardTitle className="text-lg">
                    {box.box_number} - {box.name || 'Unbenannter Karton'}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={statusColors[box.status || 'leer']}>
                      {getStatusLabel(box.status || 'leer')}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryLabel(box.category || 'sonstiges')}
                    </Badge>
                    {box.room && (
                      <Badge variant="secondary">
                        {box.room}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedBox(box);
                    setShowDetailDialog(true);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedBox(box);
                    setShowPhotoUpload(true);
                  }}>
                    <Camera className="h-4 w-4 mr-2" />
                    Foto hinzufügen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedBox(box);
                    setShowDetailDialog(true);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteBox(box.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            {box.description && (
              <p className="text-gray-600 mb-3">{box.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {box.photos && box.photos.length > 0 && (
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  <span>{box.photos.length} Foto{box.photos.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {box.contents && box.contents.length > 0 && (
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{box.contents.length} Gegenstand{box.contents.length !== 1 ? 'e' : ''}</span>
                </div>
              )}
              
              {box.comments && box.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{box.comments.length} Kommentar{box.comments.length !== 1 ? 'e' : ''}</span>
                </div>
              )}
              
              {box.current_location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{box.current_location.location_name}</span>
                </div>
              )}
            </div>

            {box.weight_kg && (
              <div className="mt-2 text-sm text-gray-500">
                Gewicht: {box.weight_kg} kg
              </div>
            )}

            {box.dimensions_cm && (
              <div className="mt-1 text-sm text-gray-500">
                Abmessungen: {box.dimensions_cm.length} × {box.dimensions_cm.width} × {box.dimensions_cm.height} cm
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Detail Dialog */}
      {selectedBox && (
        <BoxDetailDialog
          box={selectedBox}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          onUpdateBox={onUpdateBox}
          onDeleteBox={onDeleteBox}
          statusColors={statusColors}
          categoryIcons={categoryIcons}
        />
      )}

      {/* Photo Upload Dialog */}
      {selectedBox && (
        <BoxPhotoUpload
          box={selectedBox}
          open={showPhotoUpload}
          onOpenChange={setShowPhotoUpload}
        />
      )}
    </div>
  );
} 
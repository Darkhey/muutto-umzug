import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  MapPin, 
  MessageSquare, 
  Package,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { BoxWithDetails, BoxStatus, BoxCategory } from '@/types/box';

interface BoxDetailDialogProps {
  box: BoxWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBox: (boxId: string, updates: any) => Promise<boolean>;
  onDeleteBox: (boxId: string) => Promise<boolean>;
  statusColors: Record<BoxStatus, string>;
  categoryIcons: Record<BoxCategory, string>;
}

export function BoxDetailDialog({
  box,
  open,
  onOpenChange,
  onUpdateBox,
  onDeleteBox,
  statusColors,
  categoryIcons
}: BoxDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{categoryIcons[box.category || 'sonstiges']}</span>
              <div>
                <div className="text-xl font-bold">
                  {box.box_number} - {box.name || 'Unbenannter Karton'}
                </div>
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
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteBox(box.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Detailansicht für Karton {box.box_number} - {box.name || 'Unbenannter Karton'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="contents">Inhalt</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="comments">Kommentare</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kartonsnummer:</span>
                    <span className="font-medium">{box.box_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{box.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategorie:</span>
                    <span className="font-medium">{getCategoryLabel(box.category || 'sonstiges')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raum:</span>
                    <span className="font-medium">{box.room || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gewicht:</span>
                    <span className="font-medium">{box.weight_kg ? `${box.weight_kg} kg` : '-'}</span>
                  </div>
                  {box.dimensions_cm && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abmessungen:</span>
                      <span className="font-medium">
                        {box.dimensions_cm.length} × {box.dimensions_cm.width} × {box.dimensions_cm.height} cm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Statistiken</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <span>{box.photos?.length || 0} Foto{box.photos?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{box.contents?.length || 0} Gegenstand{box.contents?.length !== 1 ? 'e' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span>{box.comments?.length || 0} Kommentar{box.comments?.length !== 1 ? 'e' : ''}</span>
                  </div>
                  {box.current_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{box.current_location.location_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {box.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Beschreibung</h3>
                <p className="text-gray-600 text-sm">{box.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Kartoninhalt</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Gegenstand hinzufügen
              </Button>
            </div>
            
            {box.contents && box.contents.length > 0 ? (
              <div className="space-y-2">
                {box.contents.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{content.item_name}</div>
                      {content.description && (
                        <div className="text-sm text-gray-600">{content.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Menge: {content.quantity}</span>
                        {content.is_fragile && (
                          <Badge variant="destructive" className="text-xs">Zerbrechlich</Badge>
                        )}
                        {content.estimated_value && (
                          <span className="text-sm text-gray-500">
                            Wert: {content.estimated_value}€
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p>Noch keine Gegenstände hinzugefügt</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Fotos</h3>
              <Button size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Foto hinzufügen
              </Button>
            </div>
            
            {box.photos && box.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {box.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photo.photo_url} 
                      alt="Kartonfoto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>Noch keine Fotos hinzugefügt</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Kommentare</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Kommentar hinzufügen
              </Button>
            </div>
            
            {box.comments && box.comments.length > 0 ? (
              <div className="space-y-3">
                {box.comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('de-DE')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comment.comment_type}
                      </Badge>
                    </div>
                    <p className="text-sm">{comment.comment_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                <p>Noch keine Kommentare vorhanden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 
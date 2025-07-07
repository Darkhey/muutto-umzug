import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  X, 
  Eye,
  Package,
  Loader2
} from 'lucide-react';
import { BoxWithDetails } from '@/types/box';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';

// Validierungskonstanten
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

interface BoxPhotoUploadProps {
  box: BoxWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoxPhotoUpload({ box, open, onOpenChange }: BoxPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'content' | 'label' | 'damage'>('content');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Datei validieren
        validateFile(file);
        
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setAnalysisResult(null);
      } catch (error) {
        // Datei-Auswahl zurücksetzen
        if (event.target) {
          event.target.value = '';
        }
        
        // Fehlermeldung anzeigen
        alert(error instanceof Error ? error.message : 'Ungültige Datei');
        
        // State zurücksetzen
        setSelectedFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): void => {
    // Dateityp validieren
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `Ungültiger Dateityp. Erlaubte Formate: ${ALLOWED_MIME_TYPES.map(type => 
          type.replace('image/', '').toUpperCase()
        ).join(', ')}`
      );
    }

    // Dateigröße validieren
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `Datei zu groß. Maximale Größe: ${MAX_FILE_SIZE_MB} MB. Aktuelle Größe: ${(file.size / (1024 * 1024)).toFixed(1)} MB`
      );
    }

    // Zusätzliche Sicherheitsprüfungen
    if (file.size === 0) {
      throw new Error('Datei ist leer');
    }

    // Dateiname validieren (verhindert path traversal)
    const fileName = file.name.toLowerCase();
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Ungültiger Dateiname');
    }
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    // Datei validieren
    validateFile(file);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${(box as any).id}/${Date.now()}.${fileExt}`;
    const filePath = `box-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('box-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Fehler beim Hochladen: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('box-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const analyzePhotoWithAI = async (photoUrl: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Nicht authentifiziert');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-box-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          photo_url: photoUrl,
          box_id: (box as any).id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Fehler bei der KI-Analyse:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Foto hochladen
      const photoUrl = await uploadToStorage(selectedFile);

      // 2. Foto in Datenbank speichern
      const { error: photoError } = await supabase
        .from('box_photos')
        .insert({
          box_id: (box as any).id,
          photo_url: photoUrl,
          photo_type: photoType,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (photoError) {
        throw new Error(`Fehler beim Speichern: ${photoError.message}`);
      }

      // 3. KI-Analyse durchführen (nur für content-Fotos)
      if (photoType === 'content') {
        setAnalyzing(true);
        try {
          const analysis = await analyzePhotoWithAI(photoUrl);
          setAnalysisResult(analysis);
        } catch (analysisError) {
          console.error('KI-Analyse fehlgeschlagen:', analysisError);
          // Trotzdem fortfahren, da das Foto bereits hochgeladen wurde
        } finally {
          setAnalyzing(false);
        }
      }

      // Erfolg
      onOpenChange(false);
      handleRemoveFile();
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      alert(`Fehler beim Hochladen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto für Karton {(box as any).box_number} hochladen
          </DialogTitle>
          <DialogDescription>
            Lade ein Foto hoch, um den Inhalt deines Kartons zu dokumentieren. Die KI kann den Inhalt automatisch erkennen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Foto-Typ Auswahl */}
          <div className="space-y-2">
            <Label>Foto-Typ</Label>
            <Select value={photoType} onValueChange={(value: any) => setPhotoType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Inhalt (KI-Analyse)</SelectItem>
                <SelectItem value="label">Etikett</SelectItem>
                <SelectItem value="damage">Schaden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datei-Upload */}
          <div className="space-y-2">
            <Label>Foto auswählen</Label>
            <div className="text-xs text-gray-500 mb-2">
              Erlaubte Formate: {ALLOWED_MIME_TYPES.map(type => 
                type.replace('image/', '').toUpperCase()
              ).join(', ')} | Maximale Größe: {MAX_FILE_SIZE_MB} MB
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!selectedFile ? (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Klicken Sie hier oder ziehen Sie eine Datei hierher
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Datei auswählen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl!}
                      alt="Vorschau"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs">
                      Größe: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB | 
                      Typ: {selectedFile.type || 'Unbekannt'}
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* KI-Analyse Ergebnis */}
          {analysisResult && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">KI-Analyse Ergebnis</h4>
              {analysisResult.detected_items && analysisResult.detected_items.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    Erkannte Gegenstände: {analysisResult.detected_items.length}
                  </p>
                  <div className="space-y-1">
                    {analysisResult.detected_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.quantity}x
                        </Badge>
                        {item.is_fragile && (
                          <Badge variant="destructive" className="text-xs">
                            Zerbrechlich
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {analysisResult.notes && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Notizen:</strong> {analysisResult.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-blue-700">
                  Keine Gegenstände erkannt. Sie können den Inhalt manuell hinzufügen.
                </p>
              )}
            </div>
          )}

          {/* Aktions-Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Hochladen...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Hochladen
                </>
              )}
            </Button>
          </div>

          {/* Lade-Indikator für KI-Analyse */}
          {analyzing && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>KI analysiert das Foto...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  SwitchCamera, 
  X, 
  RotateCcw, 
  Download,
  Loader2
} from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onClose: () => void;
  isCapturing?: boolean;
}

export function CameraCapture({ onCapture, onClose, isCapturing = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check for available cameras
  const checkCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.warn('Could not enumerate devices:', err);
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Kamera-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.');
        } else if (err.name === 'NotFoundError') {
          setError('Keine Kamera gefunden. Bitte stellen Sie sicher, dass eine Kamera angeschlossen ist.');
        } else {
          setError('Fehler beim Zugriff auf die Kamera: ' + err.message);
        }
      } else {
        setError('Unbekannter Fehler beim Kamera-Zugriff');
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Initialize camera when component mounts
  useEffect(() => {
    checkCameras();
    startCamera();
  }, [checkCameras, startCamera]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isCapturing) {
        e.preventDefault();
        capturePhoto();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [capturePhoto, onClose, isCapturing]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-4">
        <Card className="bg-black border-gray-700">
          <CardContent className="p-0 relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Camera controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {hasMultipleCameras && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={switchCamera}
                  disabled={isLoading}
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={startCamera}
                disabled={isLoading}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Video preview */}
            <div className="relative bg-black">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Kamera wird initialisiert...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white bg-red-600/20 p-6 rounded-lg max-w-md">
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={startCamera}
                    >
                      Erneut versuchen
                    </Button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-auto max-h-[70vh] object-cover"
                playsInline
                muted
                style={{ display: isLoading || error ? 'none' : 'block' }}
              />

              {/* Capture overlay */}
              {!isLoading && !error && (
                <div className="absolute inset-0 border-2 border-white/30 pointer-events-none">
                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Capture button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={isLoading || error !== null || isCapturing}
                className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-200 shadow-lg"
              >
                {isCapturing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Camera className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Instructions */}
            {!isLoading && !error && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                <p className="text-white text-sm text-center bg-black/50 px-3 py-1 rounded">
                  Leertaste drücken oder Button tippen zum Fotografieren
                </p>
              </div>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
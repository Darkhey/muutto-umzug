import { useState, useEffect } from 'react'

interface LatLng {
  lat: number;
  lon: number;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function useGeocoding(address: string) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setCoords(null);
      return;
    }

    const fetchCoords = async () => {
      setLoading(true);
      setError(null);
      try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'muutto-umzug-app/1.0 (https://muutto.app)' // Replace with your app name and URL
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GeocodingResult[] = await response.json();

        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
        } else {
          setCoords(null);
          setError('Adresse nicht gefunden');
        }
      } catch (e) {
        console.error("Geocoding error:", e);
        setError(`Fehler beim Geocoding: ${e instanceof Error ? e.message : String(e)}`);
        setCoords(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [address]);

  return { coords, loading, error };
}

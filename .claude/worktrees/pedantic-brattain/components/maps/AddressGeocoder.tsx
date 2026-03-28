'use client';

import { useState, useCallback } from 'react';

interface GeocoderResult {
  lat: number;
  lng: number;
  formatted_address?: string;
}

interface UseGeocoderReturn {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  geocode: (address: string) => Promise<void>;
}

// In-memory cache to avoid repeated API calls
const geocodeCache = new Map<string, GeocoderResult>();

/**
 * useGeocoder - Hook to geocode addresses using the server-side endpoint
 * Caches results to avoid repeat calls for the same address
 */
export const useGeocoder = (): UseGeocoderReturn => {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string) => {
    // Reset error state
    setError(null);

    // Check cache first
    if (geocodeCache.has(address)) {
      const cached = geocodeCache.get(address)!;
      setLat(cached.lat);
      setLng(cached.lng);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data: GeocoderResult = await response.json();

      // Cache the result
      geocodeCache.set(address, data);

      setLat(data.lat);
      setLng(data.lng);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLat(null);
      setLng(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { lat, lng, loading, error, geocode };
};

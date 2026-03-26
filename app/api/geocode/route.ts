import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address?: string;
}

/**
 * GET /api/geocode?address=...
 * Server-side geocoding endpoint using Google Geocoding API
 * Keeps API key server-only for security
 */
export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  // Validate input
  if (!address || address.trim().length === 0) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if geocoding was successful
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: `Geocoding failed: ${data.status}` },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const formatted_address = result.formatted_address;

    const geocodeResult: GeocodeResult = {
      lat,
      lng,
      formatted_address,
    };

    return NextResponse.json(geocodeResult);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to geocode address',
      },
      { status: 500 }
    );
  }
}

import { findLandmark } from './landmarks.js';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address?: string;
  source: 'landmark' | 'google' | 'fallback';
}

export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  // First try to find in landmarks
  const landmark = findLandmark(location);
  if (landmark) {
    return {
      latitude: landmark.latitude,
      longitude: landmark.longitude,
      address: landmark.address,
      source: 'landmark'
    };
  }
  
  // If Google Maps API key is available, try Google Geocoding
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const result = await geocodeWithGoogle(location, apiKey);
      if (result) return result;
    } catch (error) {
      console.error('Google Geocoding error:', error);
    }
  }
  
  // Fallback to Miyakojima center if nothing found
  if (location.toLowerCase().includes('宮古') || location.toLowerCase().includes('miyako')) {
    return {
      latitude: 24.8047,
      longitude: 125.2814,
      address: '沖縄県宮古島市',
      source: 'fallback'
    };
  }
  
  return null;
}

async function geocodeWithGoogle(location: string, apiKey: string): Promise<GeocodingResult | null> {
  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = new URLSearchParams({
    address: `${location} 宮古島`,
    key: apiKey,
    language: 'ja',
    region: 'jp'
  });
  
  try {
    const response = await fetch(`${baseUrl}?${params}`);
    const data: any = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address,
        source: 'google'
      };
    }
  } catch (error) {
    console.error('Google Geocoding API error:', error);
  }
  
  return null;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
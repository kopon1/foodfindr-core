import { Restaurant, UserLocation } from '@/types/Restaurant';
import Constants from 'expo-constants';

const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3';
const FOURSQUARE_API_KEY = Constants.expoConfig?.extra?.FOURSQUARE_API_KEY || 
                           process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY || 
                           'fsq3bI9q9QuXOHUcOV5GylJD4nj7fxb3xdgQr0N6Nmg/kCw=';

interface FoursquareVenue {
  fsq_id: string;
  name: string;
  location: {
    formatted_address: string;
    locality: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  categories: Array<{
    id: number;
    name: string;
    short_name: string;
    plural_name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  distance: number;
  rating?: number;
  price?: number;
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
  description?: string;
  tel?: string;
  website?: string;
  verified?: boolean;
  hours?: {
    open_now: boolean;
    display: string;
  };
}

interface FoursquareSearchResponse {
  results: FoursquareVenue[];
  context: {
    geo_bounds: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  };
}

class FoursquareService {
  private readonly headers = {
    'Authorization': `Bearer ${FOURSQUARE_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  async searchRestaurants(
    location: UserLocation,
    radius: number = 10000, // 10km default
    limit: number = 50
  ): Promise<Restaurant[]> {
    try {
      const url = new URL(`${FOURSQUARE_API_URL}/places/search`);
      
      // Add search parameters
      url.searchParams.append('ll', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('categories', '13000'); // Food & Drink category
      url.searchParams.append('fields', 'fsq_id,name,location,categories,distance,rating,price,photos,description,tel,website,verified,hours');
      url.searchParams.append('sort', 'DISTANCE');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
      }

      const data: FoursquareSearchResponse = await response.json();
      
      return data.results
        .filter(venue => venue.categories.some(cat => cat.id.toString().startsWith('13'))) // Food & Drink
        .map(venue => this.transformVenueToRestaurant(venue));
    } catch (error) {
      console.error('Error searching restaurants via Foursquare:', error);
      throw error;
    }
  }

  async getVenueDetails(venueId: string): Promise<FoursquareVenue | null> {
    try {
      const url = `${FOURSQUARE_API_URL}/places/${venueId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching venue details:', error);
      return null;
    }
  }

  async getVenuePhotos(venueId: string): Promise<string[]> {
    try {
      const url = `${FOURSQUARE_API_URL}/places/${venueId}/photos`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((photo: any) => 
        `${photo.prefix}original${photo.suffix}`
      );
    } catch (error) {
      console.error('Error fetching venue photos:', error);
      return [];
    }
  }

  private transformVenueToRestaurant(venue: FoursquareVenue): Restaurant & { foursquareId: string; address?: string; phone?: string; website?: string; verified?: boolean; hours?: string; isOpen?: boolean } {
    const primaryCategory = venue.categories[0];
    const cuisineTypes = venue.categories
      .filter(cat => cat.id.toString().startsWith('13'))
      .map(cat => cat.name);

    // Generate image URL from photos or use a placeholder
    let imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
    
    if (venue.photos && venue.photos.length > 0) {
      const photo = venue.photos[0];
      imageUrl = `${photo.prefix}original${photo.suffix}`;
    }

    // Convert distance from meters to miles
    const distanceInMiles = venue.distance ? (venue.distance * 0.000621371).toFixed(1) : '0.0';

    // Generate price range based on Foursquare price tier
    let priceRange = '$$';
    if (venue.price) {
      switch (venue.price) {
        case 1:
          priceRange = '$';
          break;
        case 2:
          priceRange = '$$';
          break;
        case 3:
          priceRange = '$$$';
          break;
        case 4:
          priceRange = '$$$$';
          break;
        default:
          priceRange = '$$';
      }
    }

    return {
      id: venue.fsq_id,
      name: venue.name,
      imageUrl,
      rating: venue.rating || 4.0,
      priceRange,
      cuisineType: cuisineTypes.length > 0 ? cuisineTypes : [primaryCategory?.name || 'Restaurant'],
      description: venue.description || `${venue.name} - ${venue.location.formatted_address}`,
      location: {
        lat: venue.location.latitude,
        lng: venue.location.longitude,
      },
      distance: parseFloat(distanceInMiles),
      // Additional fields that might be useful
      foursquareId: venue.fsq_id,
      address: venue.location.formatted_address,
      phone: venue.tel,
      website: venue.website,
      verified: venue.verified || false,
      hours: venue.hours?.display,
      isOpen: venue.hours?.open_now,
    };
  }

  // Search for restaurants by query (text search)
  async searchRestaurantsByQuery(
    query: string,
    location: UserLocation,
    radius: number = 10000,
    limit: number = 50
  ): Promise<Restaurant[]> {
    try {
      const url = new URL(`${FOURSQUARE_API_URL}/places/search`);
      
      url.searchParams.append('query', query);
      url.searchParams.append('ll', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('categories', '13000'); // Food & Drink category
      url.searchParams.append('fields', 'fsq_id,name,location,categories,distance,rating,price,photos,description,tel,website,verified,hours');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
      }

      const data: FoursquareSearchResponse = await response.json();
      
      return data.results.map(venue => this.transformVenueToRestaurant(venue));
    } catch (error) {
      console.error('Error searching restaurants by query:', error);
      throw error;
    }
  }
}

export const foursquareService = new FoursquareService();
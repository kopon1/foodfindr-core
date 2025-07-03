import { Restaurant, UserLocation } from '@/types/Restaurant';
import { foursquareService } from './foursquareService';
import { supabase } from './supabaseClient';

interface DatabaseRestaurant {
  id?: string;
  foursquare_id: string;
  name: string;
  image_url?: string;
  rating?: number;
  price_range?: string;
  cuisine_type?: string[];
  description?: string;
  latitude: number;
  longitude: number;
  distance_miles?: number;
  address?: string;
  phone?: string;
  website?: string;
  verified?: boolean;
  hours?: string;
  is_open?: boolean;
}

class DataIngestionService {
  private readonly BATCH_SIZE = 10;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async fetchAndStoreRestaurants(
    location: UserLocation,
    radius: number = 10000,
    limit: number = 50
  ): Promise<Restaurant[]> {
    try {
      console.log('Fetching restaurants from Foursquare...');
      
      // Fetch restaurants from Foursquare
      const foursquareRestaurants = await foursquareService.searchRestaurants(
        location,
        radius,
        limit
      );

      if (foursquareRestaurants.length === 0) {
        console.log('No restaurants found from Foursquare');
        return [];
      }

      console.log(`Found ${foursquareRestaurants.length} restaurants from Foursquare`);

      // Store restaurants in Supabase
      const storedRestaurants = await this.storeRestaurantsInDatabase(foursquareRestaurants);
      
      console.log(`Stored ${storedRestaurants.length} restaurants in database`);
      
      return storedRestaurants;
    } catch (error) {
      console.error('Error in fetchAndStoreRestaurants:', error);
      throw error;
    }
  }

  async storeRestaurantsInDatabase(restaurants: Restaurant[]): Promise<Restaurant[]> {
    const storedRestaurants: Restaurant[] = [];
    
    // Process restaurants in batches to avoid overwhelming the database
    for (let i = 0; i < restaurants.length; i += this.BATCH_SIZE) {
      const batch = restaurants.slice(i, i + this.BATCH_SIZE);
      
      try {
        const batchResults = await this.processBatch(batch);
        storedRestaurants.push(...batchResults);
      } catch (error) {
        console.error(`Error processing batch ${i / this.BATCH_SIZE + 1}:`, error);
        // Continue with next batch even if one fails
      }
    }
    
    return storedRestaurants;
  }

  private async processBatch(restaurants: Restaurant[]): Promise<Restaurant[]> {
    const dbRestaurants: DatabaseRestaurant[] = restaurants.map(this.transformToDbFormat);
    
    // Use upsert to handle duplicates
    const { data, error } = await supabase
      .from('restaurants')
      .upsert(dbRestaurants, {
        onConflict: 'foursquare_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error upserting restaurants:', error);
      throw error;
    }

    return data?.map(this.transformFromDbFormat) || [];
  }

  private transformToDbFormat(restaurant: Restaurant): DatabaseRestaurant {
    return {
      foursquare_id: restaurant.foursquareId || restaurant.id,
      name: restaurant.name,
      image_url: restaurant.imageUrl,
      rating: restaurant.rating,
      price_range: restaurant.priceRange,
      cuisine_type: restaurant.cuisineType,
      description: restaurant.description,
      latitude: restaurant.location.lat,
      longitude: restaurant.location.lng,
      distance_miles: restaurant.distance,
      address: restaurant.address,
      phone: restaurant.phone,
      website: restaurant.website,
      verified: restaurant.verified,
      hours: restaurant.hours,
      is_open: restaurant.isOpen,
    };
  }

  private transformFromDbFormat(dbRestaurant: any): Restaurant {
    return {
      id: dbRestaurant.id,
      foursquareId: dbRestaurant.foursquare_id,
      name: dbRestaurant.name,
      imageUrl: dbRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: dbRestaurant.rating || 4.0,
      priceRange: dbRestaurant.price_range || '$$',
      cuisineType: dbRestaurant.cuisine_type || ['Restaurant'],
      description: dbRestaurant.description || '',
      location: {
        lat: dbRestaurant.latitude,
        lng: dbRestaurant.longitude,
      },
      distance: dbRestaurant.distance_miles || 0,
      address: dbRestaurant.address,
      phone: dbRestaurant.phone,
      website: dbRestaurant.website,
      verified: dbRestaurant.verified,
      hours: dbRestaurant.hours,
      isOpen: dbRestaurant.is_open,
      createdAt: dbRestaurant.created_at,
      updatedAt: dbRestaurant.updated_at,
    };
  }

  async getNearbyRestaurantsFromDatabase(
    location: UserLocation,
    radius: number = 10,
    limit: number = 50
  ): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_restaurants', {
          user_lat: location.lat,
          user_lng: location.lng,
          radius_miles: radius,
          limit_count: limit
        });

      if (error) {
        console.error('Error fetching nearby restaurants:', error);
        throw error;
      }

      return data?.map(this.transformFromDbFormat) || [];
    } catch (error) {
      console.error('Error in getNearbyRestaurantsFromDatabase:', error);
      throw error;
    }
  }

  async searchRestaurantsInDatabase(
    query: string,
    location: UserLocation,
    radius: number = 10,
    limit: number = 50
  ): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_restaurants', {
          search_query: query,
          user_lat: location.lat,
          user_lng: location.lng,
          radius_miles: radius,
          limit_count: limit
        });

      if (error) {
        console.error('Error searching restaurants:', error);
        throw error;
      }

      return data?.map(this.transformFromDbFormat) || [];
    } catch (error) {
      console.error('Error in searchRestaurantsInDatabase:', error);
      throw error;
    }
  }

  async checkIfRestaurantExists(foursquareId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('foursquare_id', foursquareId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  async getRestaurantByFoursquareId(foursquareId: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('foursquare_id', foursquareId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.transformFromDbFormat(data);
    } catch (error) {
      console.error('Error getting restaurant by Foursquare ID:', error);
      return null;
    }
  }

  async refreshRestaurantData(
    location: UserLocation,
    forceRefresh: boolean = false
  ): Promise<Restaurant[]> {
    try {
      // Check if we have recent data in the database
      if (!forceRefresh) {
        const existingRestaurants = await this.getNearbyRestaurantsFromDatabase(location);
        if (existingRestaurants.length > 0) {
          // Check if data is recent (within cache duration)
          const oldestRestaurant = existingRestaurants.reduce((oldest, current) => {
            const currentTime = new Date(current.updatedAt || current.createdAt || '').getTime();
            const oldestTime = new Date(oldest.updatedAt || oldest.createdAt || '').getTime();
            return currentTime < oldestTime ? current : oldest;
          });

          const age = Date.now() - new Date(oldestRestaurant.updatedAt || oldestRestaurant.createdAt || '').getTime();
          
          if (age < this.CACHE_DURATION) {
            console.log('Using cached restaurant data');
            return existingRestaurants;
          }
        }
      }

      // Fetch fresh data from Foursquare
      console.log('Fetching fresh restaurant data from Foursquare');
      return await this.fetchAndStoreRestaurants(location);
    } catch (error) {
      console.error('Error refreshing restaurant data:', error);
      
      // Fallback to database data if available
      try {
        const fallbackData = await this.getNearbyRestaurantsFromDatabase(location);
        if (fallbackData.length > 0) {
          console.log('Using fallback database data');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
      
      throw error;
    }
  }
}

export const dataIngestionService = new DataIngestionService();
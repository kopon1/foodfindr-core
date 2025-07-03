import { Restaurant, UserLocation } from '@/types/Restaurant';
import { dataIngestionService } from './dataIngestionService';
import { userLikesService } from './userLikesService';
import { locationService } from './locationService';
import { supabase } from './supabaseClient';

class RestaurantService {
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getNearbyRestaurants(location?: UserLocation): Promise<Restaurant[]> {
    try {
      // Get user location if not provided
      const userLocation = location || await locationService.getCurrentLocation();
      
      if (!userLocation) {
        throw new Error('Location is required to fetch nearby restaurants');
      }

      console.log('Fetching restaurants for location:', userLocation);

      // Try to get restaurants from database first, with fallback to Foursquare
      let restaurants = await dataIngestionService.getNearbyRestaurantsFromDatabase(
        userLocation,
        10, // 10 mile radius
        50  // limit to 50 restaurants
      );

      // If no restaurants in database, fetch from Foursquare and store
      if (restaurants.length === 0) {
        console.log('No restaurants in database, fetching from Foursquare...');
        restaurants = await dataIngestionService.refreshRestaurantData(userLocation, true);
      }

      return restaurants;
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      
      // Fallback to try database one more time
      try {
        if (location) {
          const fallbackRestaurants = await dataIngestionService.getNearbyRestaurantsFromDatabase(location, 25, 50);
          if (fallbackRestaurants.length > 0) {
            console.log('Using fallback database restaurants');
            return fallbackRestaurants;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      return [];
    }
  }

  async refreshRestaurants(location?: UserLocation, forceRefresh: boolean = false): Promise<Restaurant[]> {
    try {
      const userLocation = location || await locationService.getCurrentLocation();
      
      if (!userLocation) {
        throw new Error('Location is required to refresh restaurants');
      }

      return await dataIngestionService.refreshRestaurantData(userLocation, forceRefresh);
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
      throw error;
    }
  }

  async searchRestaurants(query: string, location?: UserLocation): Promise<Restaurant[]> {
    try {
      const userLocation = location || await locationService.getCurrentLocation();
      
      if (!userLocation) {
        throw new Error('Location is required to search restaurants');
      }

      return await dataIngestionService.searchRestaurantsInDatabase(
        query,
        userLocation,
        25, // 25 mile radius for search
        50  // limit to 50 results
      );
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }

  async likeRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be logged in to like restaurants');
      }

      await userLikesService.likeRestaurant(restaurant.id, userId);
    } catch (error) {
      console.error('Error liking restaurant:', error);
      throw error;
    }
  }

  async getLikedRestaurants(): Promise<Restaurant[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        console.log('User not logged in, returning empty liked restaurants');
        return [];
      }

      return await userLikesService.getUserLikedRestaurants(userId);
    } catch (error) {
      console.error('Error getting liked restaurants:', error);
      return [];
    }
  }

  async removeLikedRestaurant(restaurantId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be logged in to unlike restaurants');
      }

      await userLikesService.unlikeRestaurant(restaurantId, userId);
    } catch (error) {
      console.error('Error removing liked restaurant:', error);
      throw error;
    }
  }

  async clearAllLikedRestaurants(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be logged in to clear liked restaurants');
      }

      await userLikesService.clearAllLikedRestaurants(userId);
    } catch (error) {
      console.error('Error clearing liked restaurants:', error);
      throw error;
    }
  }

  async isRestaurantLiked(restaurantId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        return false;
      }

      return await userLikesService.isRestaurantLiked(restaurantId, userId);
    } catch (error) {
      console.error('Error checking if restaurant is liked:', error);
      return false;
    }
  }

  async getLikedRestaurantsCount(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        return 0;
      }

      return await userLikesService.getLikedRestaurantsCount(userId);
    } catch (error) {
      console.error('Error getting liked restaurants count:', error);
      return 0;
    }
  }
}

export const restaurantService = new RestaurantService(); 
import { Restaurant, UserLocation } from '@/types/Restaurant';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

class RestaurantService {
  async getNearbyRestaurants(location?: UserLocation): Promise<Restaurant[]> {
    try {
      // Default to LA downtown if no location is provided
      const lat = location?.lat || 34.0522;
      const lng = location?.lng || -118.2437;
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-nearby-restaurants?lat=${lat}&lng=${lng}&radius=10`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch nearby restaurants');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      throw error;
    }
  }

  async likeRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/like-restaurant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ restaurantId: restaurant.id })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like restaurant');
      }
    } catch (error) {
      console.error('Error liking restaurant:', error);
      throw error;
    }
  }

  async getLikedRestaurants(): Promise<Restaurant[]> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        return []; // Return empty array if user is not authenticated
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-liked-restaurants`,
        {
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch liked restaurants');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting liked restaurants:', error);
      return [];
    }
  }

  async removeLikedRestaurant(restaurantId: string): Promise<void> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/unlike-restaurant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ restaurantId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlike restaurant');
      }
    } catch (error) {
      console.error('Error removing liked restaurant:', error);
      throw error;
    }
  }

  async clearAllLikedRestaurants(): Promise<void> {
    try {
      // Get all liked restaurants
      const likedRestaurants = await this.getLikedRestaurants();
      
      // Remove each one
      const promises = likedRestaurants.map(restaurant => 
        this.removeLikedRestaurant(restaurant.id)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing liked restaurants:', error);
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService(); 
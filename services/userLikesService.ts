import { Restaurant } from '@/types/Restaurant';
import { supabase } from './supabaseClient';

class UserLikesService {
  async likeRestaurant(restaurantId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_likes')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
        });

      if (error) {
        // Check if it's a duplicate like (unique constraint violation)
        if (error.code === '23505') {
          console.log('Restaurant already liked by user');
          return;
        }
        
        console.error('Error liking restaurant:', error);
        throw error;
      }

      console.log('Restaurant liked successfully');
    } catch (error) {
      console.error('Error in likeRestaurant:', error);
      throw error;
    }
  }

  async unlikeRestaurant(restaurantId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Error unliking restaurant:', error);
        throw error;
      }

      console.log('Restaurant unliked successfully');
    } catch (error) {
      console.error('Error in unlikeRestaurant:', error);
      throw error;
    }
  }

  async getUserLikedRestaurants(userId: string): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_liked_restaurants', {
          user_id_param: userId
        });

      if (error) {
        console.error('Error fetching liked restaurants:', error);
        throw error;
      }

      return data?.map(this.transformFromDbFormat) || [];
    } catch (error) {
      console.error('Error in getUserLikedRestaurants:', error);
      throw error;
    }
  }

  async isRestaurantLiked(restaurantId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  async getLikedRestaurantsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting liked restaurants count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getLikedRestaurantsCount:', error);
      return 0;
    }
  }

  async clearAllLikedRestaurants(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing all liked restaurants:', error);
        throw error;
      }

      console.log('All liked restaurants cleared successfully');
    } catch (error) {
      console.error('Error in clearAllLikedRestaurants:', error);
      throw error;
    }
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
}

export const userLikesService = new UserLikesService();
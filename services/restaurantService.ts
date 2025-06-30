import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, UserLocation } from '@/types/Restaurant';

const LIKED_RESTAURANTS_KEY = 'likedRestaurants';

class RestaurantService {
  async getNearbyRestaurants(location?: UserLocation): Promise<Restaurant[]> {
    const lat = location?.lat ?? 14.5995;
    const lng = location?.lng ?? 120.9842;
  
    const url = `https://places-api.foursquare.com/places/search?ll=${lat},${lng}&radius=1000&categories=13000`;
  
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Places-Api-Version': '2025-06-17',
        authorization: `Bearer ${process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY}`
      }
    };
  
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      const results = json.results;
  
      const formatted: Restaurant[] = results.map((place: any) => ({
        id: place.fsq_id,
        name: place.name,
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', // Replace this later with real photo from details endpoint
        rating: Math.floor(Math.random() * 2) + 4, // Random rating for now
        priceRange: '$$',
        cuisineType: place.categories.map((cat: any) => cat.name),
        description: 'Powered by Foursquare',
        location: {
          lat: place.geocodes.main.latitude,
          lng: place.geocodes.main.longitude
        },
        distance: place.distance / 1000 // meters to km
      }));
  
      return formatted;
    } catch (err) {
      console.error('Foursquare error:', err);
      return [];
    }
  }
  

  async likeRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      const existingLikes = await this.getLikedRestaurants();
      const isAlreadyLiked = existingLikes.some(r => r.id === restaurant.id);
      
      if (!isAlreadyLiked) {
        const updatedLikes = [...existingLikes, restaurant];
        await AsyncStorage.setItem(LIKED_RESTAURANTS_KEY, JSON.stringify(updatedLikes));
      }
    } catch (error) {
      console.error('Error liking restaurant:', error);
      throw error;
    }
  }

  async getLikedRestaurants(): Promise<Restaurant[]> {
    try {
      const likedData = await AsyncStorage.getItem(LIKED_RESTAURANTS_KEY);
      return likedData ? JSON.parse(likedData) : [];
    } catch (error) {
      console.error('Error getting liked restaurants:', error);
      return [];
    }
  }

  async removeLikedRestaurant(restaurantId: string): Promise<void> {
    try {
      const existingLikes = await this.getLikedRestaurants();
      const updatedLikes = existingLikes.filter(r => r.id !== restaurantId);
      await AsyncStorage.setItem(LIKED_RESTAURANTS_KEY, JSON.stringify(updatedLikes));
    } catch (error) {
      console.error('Error removing liked restaurant:', error);
      throw error;
    }
  }

  async clearAllLikedRestaurants(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LIKED_RESTAURANTS_KEY);
    } catch (error) {
      console.error('Error clearing liked restaurants:', error);
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService();
console.log('Raw Foursquare data:', JSON.stringify(restaurantService.getNearbyRestaurants(), null, 2));  
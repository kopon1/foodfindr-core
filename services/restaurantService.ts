import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, UserLocation } from '@/types/Restaurant';

const LIKED_RESTAURANTS_KEY = 'likedRestaurants';

class RestaurantService {
  async getNearbyRestaurants(location?: UserLocation): Promise<Restaurant[]> {
    const lat = location?.lat ?? 14.5995;
    const lng = location?.lng ?? 120.9842;
  
    // Create URL with all needed parameters
    const url = new URL('https://places-api.foursquare.com/places/search');
    url.searchParams.append('ll', `${lat},${lng}`);
    url.searchParams.append('radius', '10000');
    url.searchParams.append('limit', '50');
    url.searchParams.append('fields', 'fsq_id,name,categories,location,distance,rating,price,photos,description,tel,website,hours');
    
    console.log(`Searching for restaurants at coordinates: ${lat},${lng}`);
  
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Places-Api-Version': '2025-06-17',
        authorization: `Bearer ${process.env.EXPO_PUBLIC_BEARER_KEY}`
      }
    };
    
    // Check if API key is available
    if (!process.env.EXPO_PUBLIC_BEARER_KEY) {
      console.error('ERROR: Foursquare API key (EXPO_PUBLIC_BEARER_KEY) is not set');
      throw new Error('Foursquare API key is missing. Please set EXPO_PUBLIC_BEARER_KEY.');
    }
  
    try {
      const res = await fetch(url.toString(), options);
      
      if (!res.ok) {
        throw new Error(`Foursquare API error: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log('Foursquare API response:', JSON.stringify(json, null, 2));
      const results = json.results || [];
      
      if (results.length === 0) {
        console.warn('No restaurant results returned from Foursquare API');
        return [];
      }
      
      console.log(`Got ${results.length} restaurants from Foursquare`);
  
      const formatted: Restaurant[] = results.map((place: any) => {
        const distanceInMiles = place.distance ? (place.distance / 1609.34).toFixed(1) : '?';
        
        // Get the first photo if available
        const photoUrl = place.photos && place.photos.length > 0
          ? `${place.photos[0].prefix}original${place.photos[0].suffix}`
          : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
        
        // Get categories or set default if missing
        const categories = place.categories && Array.isArray(place.categories) 
          ? place.categories.map((cat: any) => cat.name) 
          : ['Restaurant'];
        
        return {
          id: place.fsq_id || String(Math.random()),
          name: place.name || 'Unknown Restaurant',
          imageUrl: photoUrl,
          rating: place.rating || (Math.floor(Math.random() * 2) + 4),
          priceRange: place.price || '$$',
          cuisineType: categories,
          description: place.description || `${place.name} - Powered by Foursquare`,
          location: {
            lat: place.geocodes?.main?.latitude || lat,
            lng: place.geocodes?.main?.longitude || lng
          },
          distance: parseFloat(distanceInMiles)
        };
      });
  
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
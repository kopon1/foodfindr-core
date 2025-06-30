import { Restaurant, UserLocation } from '@/types/Restaurant';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded restaurant data
const HARDCODED_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Burger Palace',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.5,
    priceRange: '$$',
    cuisineType: ['American', 'Burgers'],
    description: 'Delicious burgers and fries in a casual setting',
    location: { lat: 34.052, lng: -118.243 },
    distance: 1.2
  },
  {
    id: '2',
    name: 'Sushi Heaven',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.8,
    priceRange: '$$$',
    cuisineType: ['Japanese', 'Sushi'],
    description: 'Premium sushi and Japanese cuisine',
    location: { lat: 34.053, lng: -118.244 },
    distance: 1.5
  },
  {
    id: '3',
    name: 'Pasta Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.3,
    priceRange: '$$',
    cuisineType: ['Italian', 'Pasta'],
    description: 'Authentic Italian pasta and wine',
    location: { lat: 34.055, lng: -118.245 },
    distance: 1.8
  },
  {
    id: '4',
    name: 'Taco Town',
    imageUrl: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.2,
    priceRange: '$',
    cuisineType: ['Mexican', 'Tacos'],
    description: 'Street-style tacos and Mexican favorites',
    location: { lat: 34.056, lng: -118.246 },
    distance: 2.0
  },
  {
    id: '5',
    name: 'Curry House',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356cf4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.6,
    priceRange: '$$',
    cuisineType: ['Indian', 'Curry'],
    description: 'Spicy and flavorful Indian curries',
    location: { lat: 34.057, lng: -118.247 },
    distance: 2.2
  },
  {
    id: '6',
    name: 'Pizza Planet',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80',
    rating: 4.0,
    priceRange: '$$',
    cuisineType: ['Italian', 'Pizza'],
    description: 'Wood-fired pizzas with creative toppings',
    location: { lat: 34.058, lng: -118.248 },
    distance: 2.5
  }
];

const LIKED_STORAGE_KEY = 'foodfindr_liked_restaurants';

class RestaurantService {
  async getNearbyRestaurants(_location?: UserLocation): Promise<Restaurant[]> {
    try {
      // Return hardcoded restaurants instead of API call
      return [...HARDCODED_RESTAURANTS];
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return [];
    }
  }

  async likeRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      // Get current liked restaurants from storage
      const currentLikedJson = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
      const currentLiked: Restaurant[] = currentLikedJson ? JSON.parse(currentLikedJson) : [];
      
      // Check if restaurant is already liked
      if (!currentLiked.some(r => r.id === restaurant.id)) {
        // Add to liked restaurants
        const updatedLiked = [...currentLiked, restaurant];
        await AsyncStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(updatedLiked));
      }
    } catch (error) {
      console.error('Error liking restaurant:', error);
      throw error;
    }
  }

  async getLikedRestaurants(): Promise<Restaurant[]> {
    try {
      const likedJson = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
      return likedJson ? JSON.parse(likedJson) : [];
    } catch (error) {
      console.error('Error getting liked restaurants:', error);
      return [];
    }
  }

  async removeLikedRestaurant(restaurantId: string): Promise<void> {
    try {
      const currentLikedJson = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
      const currentLiked: Restaurant[] = currentLikedJson ? JSON.parse(currentLikedJson) : [];
      
      const updatedLiked = currentLiked.filter(r => r.id !== restaurantId);
      await AsyncStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(updatedLiked));
    } catch (error) {
      console.error('Error removing liked restaurant:', error);
      throw error;
    }
  }

  async clearAllLikedRestaurants(): Promise<void> {
    try {
      await AsyncStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing liked restaurants:', error);
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService(); 
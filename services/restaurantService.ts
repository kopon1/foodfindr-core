import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, UserLocation } from '@/types/Restaurant';

const LIKED_RESTAURANTS_KEY = 'likedRestaurants';

class RestaurantService {
  async getNearbyRestaurants(_location?: UserLocation): Promise<Restaurant[]> {
    // Return hardcoded restaurant data
    return [
      {
        id: '1',
        name: 'Sakura Japanese Restaurant',
        imageUrl: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
        rating: 4.8,
        priceRange: '$$$',
        cuisineType: ['Japanese', 'Sushi', 'Asian'],
        description: 'Authentic Japanese cuisine featuring fresh sushi, sashimi, and traditional dishes in an elegant setting with minimalist décor.',
        location: {
          lat: 34.0522,
          lng: -118.2437
        },
        distance: 1.2
      },
      {
        id: '2',
        name: 'Trattoria Bella Italia',
        imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        rating: 4.6,
        priceRange: '$$',
        cuisineType: ['Italian', 'Pasta', 'Pizza'],
        description: 'Family-owned Italian restaurant serving homemade pasta, wood-fired pizzas, and regional specialties with imported wines.',
        location: {
          lat: 34.0548,
          lng: -118.2500
        },
        distance: 0.8
      },
      {
        id: '3',
        name: 'El Mariachi Taqueria',
        imageUrl: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
        rating: 4.4,
        priceRange: '$',
        cuisineType: ['Mexican', 'Tacos', 'Latin American'],
        description: 'Vibrant taqueria offering authentic Mexican street food, handmade tortillas, and a variety of salsas in a colorful atmosphere.',
        location: {
          lat: 34.0505,
          lng: -118.2300
        },
        distance: 1.5
      },
      {
        id: '4',
        name: 'Golden Dragon',
        imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
        rating: 4.3,
        priceRange: '$$',
        cuisineType: ['Chinese', 'Dim Sum', 'Asian'],
        description: 'Traditional Chinese restaurant specializing in dim sum, Cantonese dishes, and regional specialties from across China.',
        location: {
          lat: 34.0625,
          lng: -118.2380
        },
        distance: 2.1
      },
      {
        id: '5',
        name: 'Le Petit Bistro',
        imageUrl: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg',
        rating: 4.7,
        priceRange: '$$$',
        cuisineType: ['French', 'European', 'Fine Dining'],
        description: 'Charming French bistro offering classic dishes, fresh-baked pastries, and an extensive wine list in a romantic Parisian atmosphere.',
        location: {
          lat: 34.0660,
          lng: -118.2430
        },
        distance: 1.7
      },
      {
        id: '6',
        name: 'Spice of India',
        imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Indian', 'Curry', 'Vegetarian'],
        description: 'Aromatic Indian restaurant featuring tandoori specialties, rich curries, and fresh naan bread with both meat and vegetarian options.',
        location: {
          lat: 34.0550,
          lng: -118.2350
        },
        distance: 0.9
      },
      {
        id: '7',
        name: 'The Burger Joint',
        imageUrl: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
        rating: 4.2,
        priceRange: '$',
        cuisineType: ['American', 'Burgers', 'Fast Food'],
        description: 'Casual eatery serving gourmet burgers, hand-cut fries, and craft milkshakes with locally sourced ingredients.',
        location: {
          lat: 34.0530,
          lng: -118.2420
        },
        distance: 0.5
      },
      {
        id: '8',
        name: 'Mediterranean Oasis',
        imageUrl: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        rating: 4.6,
        priceRange: '$$',
        cuisineType: ['Mediterranean', 'Greek', 'Middle Eastern'],
        description: 'Relaxed Mediterranean restaurant offering mezze platters, kebabs, fresh seafood, and traditional dishes from across the region.',
        location: {
          lat: 34.0580,
          lng: -118.2390
        },
        distance: 1.3
      },
      {
        id: '9',
        name: 'Thai Orchid',
        imageUrl: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
        rating: 4.4,
        priceRange: '$$',
        cuisineType: ['Thai', 'Asian', 'Spicy'],
        description: 'Authentic Thai restaurant featuring flavorful curries, noodle dishes, and stir-fries with adjustable spice levels in a serene setting.',
        location: {
          lat: 34.0600,
          lng: -118.2450
        },
        distance: 1.8
      },
      {
        id: '10',
        name: 'Seafood Harbor',
        imageUrl: 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg',
        rating: 4.7,
        priceRange: '$$$',
        cuisineType: ['Seafood', 'American', 'Fine Dining'],
        description: 'Upscale seafood restaurant offering fresh catches, oyster bar, and seasonal specialties with waterfront views.',
        location: {
          lat: 34.0520,
          lng: -118.2480
        },
        distance: 2.0
      }
    ];
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
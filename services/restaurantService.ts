import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, UserLocation } from '@/types/Restaurant';

const LIKED_RESTAURANTS_KEY = 'likedRestaurants';

// Mock restaurant data with high-quality Pexels images
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Vista Italian',
    imageUrl: 'https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg',
    rating: 4.8,
    priceRange: '$$$$',
    cuisineType: ['Italian', 'Fine Dining'],
    description: 'Authentic Italian cuisine with a modern twist, featuring fresh pasta and wood-fired pizzas.',
    location: { lat: 40.7580, lng: -73.9855 },
    distance: 0.3,
  },
  {
    id: '2',
    name: 'Tokyo Sushi Bar',
    imageUrl: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
    rating: 4.9,
    priceRange: '$$$',
    cuisineType: ['Japanese', 'Sushi'],
    description: 'Fresh sushi and sashimi prepared by master chefs with the finest ingredients.',
    location: { lat: 40.7614, lng: -73.9776 },
    distance: 0.8,
  },
  {
    id: '3',
    name: 'The Garden Café',
    imageUrl: 'https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg',
    rating: 4.6,
    priceRange: '$$',
    cuisineType: ['American', 'Brunch', 'Healthy'],
    description: 'Farm-to-table dining with organic ingredients and beautiful garden seating.',
    location: { lat: 40.7505, lng: -73.9934 },
    distance: 1.2,
  },
  {
    id: '4',
    name: 'Spice Route',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    rating: 4.7,
    priceRange: '$$',
    cuisineType: ['Indian', 'Vegetarian'],
    description: 'Authentic Indian flavors with traditional spices and modern presentation.',
    location: { lat: 40.7549, lng: -73.9840 },
    distance: 0.5,
  },
  {
    id: '5',
    name: 'Ocean Breeze',
    imageUrl: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg',
    rating: 4.5,
    priceRange: '$$$',
    cuisineType: ['Seafood', 'Mediterranean'],
    description: 'Fresh seafood with Mediterranean influences overlooking the waterfront.',
    location: { lat: 40.7589, lng: -73.9851 },
    distance: 0.7,
  },
  {
    id: '6',
    name: 'Urban Burgers',
    imageUrl: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    rating: 4.4,
    priceRange: '$',
    cuisineType: ['American', 'Burgers'],
    description: 'Gourmet burgers made with locally sourced beef and artisanal buns.',
    location: { lat: 40.7527, lng: -73.9772 },
    distance: 1.0,
  },
  {
    id: '7',
    name: 'Le Petit Bistro',
    imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    rating: 4.8,
    priceRange: '$$$',
    cuisineType: ['French', 'Bistro'],
    description: 'Classic French bistro with cozy atmosphere and traditional dishes.',
    location: { lat: 40.7560, lng: -73.9899 },
    distance: 0.9,
  },
  {
    id: '8',
    name: 'Dragon Phoenix',
    imageUrl: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg',
    rating: 4.6,
    priceRange: '$$',
    cuisineType: ['Chinese', 'Asian'],
    description: 'Authentic Chinese cuisine with hand-pulled noodles and Peking duck.',
    location: { lat: 40.7543, lng: -73.9820 },
    distance: 0.6,
  },
  {
    id: '9',
    name: 'Verde Kitchen',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    rating: 4.7,
    priceRange: '$$',
    cuisineType: ['Vegetarian', 'Vegan', 'Healthy'],
    description: 'Plant-based cuisine that proves healthy can be delicious and satisfying.',
    location: { lat: 40.7502, lng: -73.9888 },
    distance: 1.1,
  },
  {
    id: '10',
    name: 'Steakhouse Prime',
    imageUrl: 'https://images.pexels.com/photos/1268549/pexels-photo-1268549.jpeg',
    rating: 4.9,
    priceRange: '$$$$',
    cuisineType: ['Steakhouse', 'American'],
    description: 'Premium steaks aged to perfection with an extensive wine selection.',
    location: { lat: 40.7598, lng: -73.9442 },
    distance: 2.1,
  },
];

class RestaurantService {
  async getNearbyRestaurants(location?: UserLocation): Promise<Restaurant[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return shuffled restaurants to simulate different results
    const shuffled = [...mockRestaurants].sort(() => Math.random() - 0.5);
    return shuffled;
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
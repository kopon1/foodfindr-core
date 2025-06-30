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
      },
      // --- 10 more restaurants below ---
      {
        id: '11',
        name: 'Urban Vegan Kitchen',
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Vegan', 'Healthy', 'American'],
        description: 'Trendy vegan spot serving creative plant-based dishes and smoothies in a modern, eco-friendly space.',
        location: {
          lat: 34.0611,
          lng: -118.2460
        },
        distance: 1.1
      },
      {
        id: '12',
        name: 'Pho Saigon',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.3,
        priceRange: '$',
        cuisineType: ['Vietnamese', 'Pho', 'Asian'],
        description: 'Classic Vietnamese eatery specializing in pho, banh mi, and other traditional noodle soups.',
        location: {
          lat: 34.0577,
          lng: -118.2412
        },
        distance: 1.6
      },
      {
        id: '13',
        name: 'BBQ Smokehouse',
        imageUrl: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg',
        rating: 4.6,
        priceRange: '$$',
        cuisineType: ['BBQ', 'American', 'Grill'],
        description: 'Rustic smokehouse offering slow-cooked barbecue meats, ribs, and classic Southern sides.',
        location: {
          lat: 34.0599,
          lng: -118.2377
        },
        distance: 2.2
      },
      {
        id: '14',
        name: 'Tapas & Wine Bar',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.4,
        priceRange: '$$',
        cuisineType: ['Spanish', 'Tapas', 'Wine Bar'],
        description: 'Cozy Spanish bar serving a variety of tapas, paella, and an extensive selection of wines.',
        location: {
          lat: 34.0632,
          lng: -118.2401
        },
        distance: 1.9
      },
      {
        id: '15',
        name: 'Bagel Bros',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.2,
        priceRange: '$',
        cuisineType: ['Bakery', 'Breakfast', 'Cafe'],
        description: 'Popular breakfast spot known for fresh bagels, sandwiches, and artisan coffee.',
        location: {
          lat: 34.0515,
          lng: -118.2499
        },
        distance: 0.7
      },
      {
        id: '16',
        name: 'Korean BBQ House',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.7,
        priceRange: '$$$',
        cuisineType: ['Korean', 'BBQ', 'Asian'],
        description: 'Lively Korean BBQ restaurant with table grills, marinated meats, and a variety of banchan.',
        location: {
          lat: 34.0566,
          lng: -118.2444
        },
        distance: 1.4
      },
      {
        id: '17',
        name: 'Falafel Express',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.3,
        priceRange: '$',
        cuisineType: ['Middle Eastern', 'Falafel', 'Vegetarian'],
        description: 'Quick-service spot for falafel wraps, hummus bowls, and Mediterranean salads.',
        location: {
          lat: 34.0588,
          lng: -118.2366
        },
        distance: 1.0
      },
      {
        id: '18',
        name: 'The Pancake House',
        imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
        rating: 4.5,
        priceRange: '$',
        cuisineType: ['Breakfast', 'American', 'Family'],
        description: 'Family-friendly diner famous for fluffy pancakes, omelets, and hearty brunch plates.',
        location: {
          lat: 34.0542,
          lng: -118.2477
        },
        distance: 0.6
      },
      {
        id: '19',
        name: 'Sushi Zen',
        imageUrl: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
        rating: 4.8,
        priceRange: '$$$',
        cuisineType: ['Japanese', 'Sushi', 'Seafood'],
        description: 'Modern sushi bar with creative rolls, sashimi, and omakase tasting menus.',
        location: {
          lat: 34.0620,
          lng: -118.2415
        },
        distance: 2.3
      },
      {
        id: '20',
        name: 'Gourmet Pizza Co.',
        imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
        rating: 4.6,
        priceRange: '$$',
        cuisineType: ['Pizza', 'Italian', 'Casual'],
        description: 'Trendy pizzeria serving wood-fired pizzas, salads, and craft beers in a lively setting.',
        location: {
          lat: 34.0537,
          lng: -118.2468
        },
        distance: 1.2
      },
      // --- 10 more restaurants below ---
      {
        id: '21',
        name: 'Bistro Provence',
        imageUrl: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
        rating: 4.7,
        priceRange: '$$$',
        cuisineType: ['French', 'Bistro', 'European'],
        description: 'Elegant French bistro with classic Provençal dishes and a curated wine list.',
        location: {
          lat: 34.0671,
          lng: -118.2421
        },
        distance: 1.5
      },
      {
        id: '22',
        name: 'Tandoori Palace',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Indian', 'Tandoori', 'Asian'],
        description: 'Traditional Indian restaurant specializing in tandoori and curry dishes.',
        location: {
          lat: 34.0555,
          lng: -118.2322
        },
        distance: 1.8
      },
      {
        id: '23',
        name: 'Burger & Brew',
        imageUrl: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
        rating: 4.4,
        priceRange: '$$',
        cuisineType: ['American', 'Burgers', 'Bar'],
        description: 'Craft burgers and local brews in a lively, casual setting.',
        location: {
          lat: 34.0528,
          lng: -118.2511
        },
        distance: 0.9
      },
      {
        id: '24',
        name: 'Casa de Tapas',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.3,
        priceRange: '$$',
        cuisineType: ['Spanish', 'Tapas', 'Bar'],
        description: 'Spanish tapas bar with small plates, sangria, and live music nights.',
        location: {
          lat: 34.0642,
          lng: -118.2399
        },
        distance: 2.0
      },
      {
        id: '25',
        name: 'Green Leaf Café',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.6,
        priceRange: '$$',
        cuisineType: ['Vegetarian', 'Healthy', 'Cafe'],
        description: 'Bright, modern café serving vegetarian and vegan breakfast and lunch options.',
        location: {
          lat: 34.0591,
          lng: -118.2407
        },
        distance: 1.3
      },
      {
        id: '26',
        name: 'Ramen House',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Japanese', 'Ramen', 'Asian'],
        description: 'Cozy ramen shop with rich broths and a variety of noodle bowls.',
        location: {
          lat: 34.0602,
          lng: -118.2432
        },
        distance: 1.7
      },
      {
        id: '27',
        name: 'Steakhouse Prime',
        imageUrl: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg',
        rating: 4.8,
        priceRange: '$$$$',
        cuisineType: ['Steakhouse', 'American', 'Fine Dining'],
        description: 'Upscale steakhouse with prime cuts, seafood, and an extensive wine cellar.',
        location: {
          lat: 34.0655,
          lng: -118.2477
        },
        distance: 2.5
      },
      {
        id: '28',
        name: 'Pasta Fresca',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.4,
        priceRange: '$$',
        cuisineType: ['Italian', 'Pasta', 'Casual'],
        description: 'Homemade pasta and Italian comfort food in a family-friendly atmosphere.',
        location: {
          lat: 34.0533,
          lng: -118.2388
        },
        distance: 1.0
      },
      {
        id: '29',
        name: 'Sabor Latino',
        imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        rating: 4.3,
        priceRange: '$$',
        cuisineType: ['Latin American', 'Grill', 'Bar'],
        description: 'Latin American grill with a variety of grilled meats, cocktails, and live salsa music.',
        location: {
          lat: 34.0572,
          lng: -118.2361
        },
        distance: 1.6
      },
      {
        id: '30',
        name: 'Fish & Chips Co.',
        imageUrl: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
        rating: 4.2,
        priceRange: '$$',
        cuisineType: ['Seafood', 'British', 'Casual'],
        description: 'Classic British fish and chips with a modern twist, plus craft beers.',
        location: {
          lat: 34.0519,
          lng: -118.2455
        },
        distance: 0.8
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
import { restaurantService } from '@/services/restaurantService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const LIKED_STORAGE_KEY = 'likedRestaurants';

describe('RestaurantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNearbyRestaurants', () => {
    it('should return an array of restaurants', async () => {
      const restaurants = await restaurantService.getNearbyRestaurants();
      
      expect(Array.isArray(restaurants)).toBe(true);
      expect(restaurants.length).toBeGreaterThan(0);
      expect(restaurants[0]).toHaveProperty('id');
      expect(restaurants[0]).toHaveProperty('name');
      expect(restaurants[0]).toHaveProperty('imageUrl');
    });
  });

  describe('likeRestaurant', () => {
    it('should save liked restaurant to storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const restaurant = {
        id: '1',
        name: 'Test Restaurant',
        imageUrl: 'https://example.com/image.jpg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Italian'],
        description: 'Test description',
        location: { lat: 40.7580, lng: -73.9855 },
        distance: 0.5,
      };

      await restaurantService.likeRestaurant(restaurant);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        LIKED_STORAGE_KEY,
        JSON.stringify([restaurant])
      );
    });

    it('should not duplicate liked restaurants', async () => {
      const restaurant = {
        id: '1',
        name: 'Test Restaurant',
        imageUrl: 'https://example.com/image.jpg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Italian'],
        description: 'Test description',
        location: { lat: 40.7580, lng: -73.9855 },
        distance: 0.5,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([restaurant]));

      await restaurantService.likeRestaurant(restaurant);

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getLikedRestaurants', () => {
    it('should return empty array when no liked restaurants', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await restaurantService.getLikedRestaurants();

      expect(result).toEqual([]);
    });

    it('should return parsed liked restaurants', async () => {
      const restaurant = {
        id: '1',
        name: 'Test Restaurant',
        imageUrl: 'https://example.com/image.jpg',
        rating: 4.5,
        priceRange: '$$',
        cuisineType: ['Italian'],
        description: 'Test description',
        location: { lat: 40.7580, lng: -73.9855 },
        distance: 0.5,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([restaurant]));

      const result = await restaurantService.getLikedRestaurants();

      expect(result).toEqual([restaurant]);
    });
  });

  describe('removeLikedRestaurant', () => {
    it('should remove restaurant from liked list', async () => {
      const restaurants = [
        { id: '1', name: 'Restaurant 1' },
        { id: '2', name: 'Restaurant 2' },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(restaurants));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await restaurantService.removeLikedRestaurant('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        LIKED_STORAGE_KEY,
        JSON.stringify([{ id: '2', name: 'Restaurant 2' }])
      );
    });
  });

  describe('clearAllLikedRestaurants', () => {
    it('should remove all liked restaurants', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await restaurantService.clearAllLikedRestaurants();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        LIKED_STORAGE_KEY,
        JSON.stringify([])
      );
    });
  });
});
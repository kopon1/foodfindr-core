import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  Alert,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { RestaurantCard } from '@/components/RestaurantCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { restaurantService } from '@/services/restaurantService';
import { locationService } from '@/services/locationService';
import { Restaurant } from '@/types/Restaurant';

const { width, height } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        // Load restaurants without location
        const mockRestaurants = await restaurantService.getNearbyRestaurants();
        setRestaurants(mockRestaurants);
      } else {
        // Get user location and nearby restaurants
        const location = await locationService.getCurrentLocation();
        const nearbyRestaurants = await restaurantService.getNearbyRestaurants(location);
        setRestaurants(nearbyRestaurants);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentRestaurant = restaurants[currentIndex];
    
    if (direction === 'right') {
      // Like the restaurant
      await restaurantService.likeRestaurant(currentRestaurant);
    }
    
    // Move to next restaurant
    setCurrentIndex(prev => prev + 1);
    
    // Load more restaurants if we're near the end
    if (currentIndex >= restaurants.length - 2) {
      try {
        const location = await locationService.getCurrentLocation();
        const moreRestaurants = await restaurantService.getNearbyRestaurants(location);
        setRestaurants(prev => [...prev, ...moreRestaurants]);
      } catch (error) {
        console.error('Error loading more restaurants:', error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (currentIndex >= restaurants.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No more restaurants!</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new discoveries
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FoodFindr</Text>
        {locationError && (
          <Text style={styles.locationError}>{locationError}</Text>
        )}
      </View>
      
      <View style={styles.cardContainer}>
        {restaurants.slice(currentIndex, currentIndex + 2).map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isTop={index === 0}
            onSwipe={handleSwipe}
            style={{
              zIndex: restaurants.length - index,
              transform: [{ scale: index === 0 ? 1 : 0.95 }],
              opacity: index === 0 ? 1 : 0.8,
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  locationError: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});
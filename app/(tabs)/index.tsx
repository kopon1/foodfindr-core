import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestaurantCard } from '@/components/RestaurantCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/Restaurant';

const { width, height } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Load hardcoded restaurants
      const hardcodedRestaurants = await restaurantService.getNearbyRestaurants();
      setRestaurants(hardcodedRestaurants);
      
    } catch (error) {
      console.error('Error initializing app:', error);
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
          <TouchableOpacity 
            style={styles.reloadButton}
            onPress={initializeApp}
          >
            <Text style={styles.reloadButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FoodFindr</Text>
      </View>
      
      <View style={styles.cardContainer}>
        {restaurants.slice(currentIndex, currentIndex + 3).map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isTop={index === 0}
            onSwipe={handleSwipe}
            style={{
              zIndex: restaurants.length - index,
              transform: [{ scale: index === 0 ? 1 : 0.95 - (index * 0.05) }],
              opacity: index === 0 ? 1 : 0.8 - (index * 0.1),
              top: index * 10,
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
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
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
  reloadButton: {
    padding: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    marginTop: 16,
  },
  reloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
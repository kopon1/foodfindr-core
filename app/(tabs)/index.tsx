import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, X, Star } from 'lucide-react-native';
import { Restaurant } from '@/types/Restaurant';
import { restaurantService } from '@/services/restaurantService';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import BoltLogo from '@/components/BoltLogo';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

export default function DiscoverScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const { user } = useAuth();
  const [swipedAll, setSwipedAll] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const fetchedRestaurants = await restaurantService.getNearbyRestaurants();
      setRestaurants(fetchedRestaurants);
      setCurrentIndex(0);
      setSwipedAll(false);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const restaurant = restaurants[currentIndex];
    
    if (direction === 'right' && restaurant) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      restaurantService.likeRestaurant(restaurant)
        .then(() => {
          console.log('Restaurant liked:', restaurant.name);
        })
        .catch(error => {
          console.error('Error liking restaurant:', error);
        });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= restaurants.length) {
          setSwipedAll(true);
          return prevIndex; // Keep at the last index
        }
        return nextIndex;
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderRestaurantCard = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Finding restaurants...</Text>
        </View>
      );
    }

    if (restaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchRestaurants}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (swipedAll) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You've seen all restaurants</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchRestaurants}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const restaurant = restaurants[currentIndex];
    
    if (!restaurant) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Restaurant data unavailable</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchRestaurants}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { rotate },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          
          <View style={styles.cardContent}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingText}>
                {restaurant.rating} ({restaurant.cuisineType.length} cuisines)
              </Text>
            </View>
            
            <View style={styles.categoryContainer}>
              {restaurant.cuisineType.map((cuisine, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{cuisine}</Text>
                </View>
              ))}
            </View>
            
            {restaurant.description && (
              <Text style={styles.description} numberOfLines={2}>
                {restaurant.description}
              </Text>
            )}
          </View>

          <Animated.View style={[styles.likeOverlay, { opacity: likeOpacity }]}>
            <Heart size={80} color="#FFFFFF" fill="#FFFFFF" />
          </Animated.View>

          <Animated.View style={[styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
            <X size={80} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (isLoading || restaurants.length === 0 || swipedAll || currentIndex >= restaurants.length) {
      return null;
    }

    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleSwipe('left')}
          activeOpacity={0.7}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
          activeOpacity={0.7}
        >
          <Heart size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BoltLogo size="small" />
        <Text style={styles.headerTitle}>FoodFindr</Text>
      </View>
      
      {renderRestaurantCard()}
      {renderActionButtons()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 12,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '60%',
  },
  cardContent: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#F7FAFC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: '#FF6B35',
  },
  dislikeButton: {
    backgroundColor: '#EF4444',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    right: 40,
    transform: [{ rotate: '20deg' }],
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 50,
    left: 40,
    transform: [{ rotate: '-20deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
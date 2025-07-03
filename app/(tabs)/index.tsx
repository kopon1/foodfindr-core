import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Dimensions, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RotateCcw, Settings, Zap, TrendingUp } from 'lucide-react-native';
import { Restaurant } from '@/types/Restaurant';
import { restaurantService } from '@/services/restaurantService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TinderCard } from '@/components/TinderCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [swipedAll, setSwipedAll] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
    loadLikedCount();
  }, []);

  const loadLikedCount = async () => {
    try {
      const count = await restaurantService.getLikedRestaurantsCount();
      setLikedCount(count);
    } catch (error) {
      console.error('Error loading liked count:', error);
    }
  };

  const fetchRestaurants = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      let fetchedRestaurants: Restaurant[] = [];
      
      if (forceRefresh) {
        fetchedRestaurants = await restaurantService.refreshRestaurants(undefined, true);
      } else {
        fetchedRestaurants = await restaurantService.getNearbyRestaurants();
      }
      
      setRestaurants(fetchedRestaurants);
      setCurrentIndex(0);
      setSwipedAll(false);
      
      if (fetchedRestaurants.length === 0 && !forceRefresh) {
        // Only show error for initial load, not refresh
        Alert.alert(
          'No Restaurants Found', 
          'We\'re having trouble finding restaurants. Using sample data for now!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      
      if (!forceRefresh) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Connection Issue', 'Using sample restaurants for demo!', [
          { text: 'OK', style: 'default' }
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const restaurant = restaurants[currentIndex];
    
    if (direction === 'right' && restaurant) {
      try {
        await restaurantService.likeRestaurant(restaurant);
        setLikedCount(prev => prev + 1);
        console.log('Restaurant liked:', restaurant.name);
      } catch (error) {
        console.error('Error liking restaurant:', error);
      }
    }
    
    // Move to next card
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= restaurants.length) {
        setSwipedAll(true);
        return prevIndex;
      }
      return nextIndex;
    });
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchRestaurants(true);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(prev => prev - 1);
      setSwipedAll(false);
    }
  };

  const renderCardStack = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Finding amazing restaurants...</Text>
          </LinearGradient>
        </View>
      );
    }

    if (restaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No restaurants found</Text>
          <Text style={styles.emptySubtitle}>Try refreshing to load new options</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.retryGradient}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    if (swipedAll) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>All done!</Text>
          <Text style={styles.emptySubtitle}>You've seen all restaurants in your area</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.retryGradient}
            >
              <Text style={styles.retryButtonText}>Start Over</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Render stack of cards (current + next 2)
    const cardsToShow = restaurants.slice(currentIndex, currentIndex + 3);
    
    return (
      <View style={styles.cardStack}>
        {cardsToShow.map((restaurant, index) => (
          <TinderCard
            key={`${restaurant.id}-${currentIndex + index}`}
            restaurant={restaurant}
            isTop={index === 0}
            onSwipe={handleSwipe}
            style={[
              styles.cardPosition,
              { 
                zIndex: cardsToShow.length - index,
                transform: [
                  { scale: 1 - (index * 0.05) },
                  { translateY: index * 8 }
                ]
              }
            ]}
            index={currentIndex + index}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <BlurView intensity={20} style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => router.push('/settings')}
                style={styles.headerButton}
              >
                <Settings size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <Text style={styles.appTitle}>FoodFindr</Text>
                <Text style={styles.tagline}>Swipe • Taste • Love</Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => router.push('/liked')}
                style={styles.headerButton}
              >
                <View style={styles.likedBadge}>
                  <TrendingUp size={20} color="#FFFFFF" />
                  {likedCount > 0 && (
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeText}>{likedCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Card Stack */}
          <View style={styles.content}>
            {renderCardStack()}
          </View>

          {/* Bottom Controls */}
          {!isLoading && !swipedAll && restaurants.length > 0 && (
            <BlurView intensity={20} style={styles.bottomControls}>
              <TouchableOpacity
                style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]}
                onPress={handleUndo}
                disabled={currentIndex === 0}
                activeOpacity={0.8}
              >
                <RotateCcw size={20} color={currentIndex === 0 ? "#666" : "#FFFFFF"} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.refreshButton]}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Zap size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </BlurView>
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 1,
  },
  likedBadge: {
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardStack: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPosition: {
    position: 'absolute',
    width: '100%',
    height: '85%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingGradient: {
    paddingVertical: 40,
    paddingHorizontal: 60,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  retryGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  refreshButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.8)',
  },
});
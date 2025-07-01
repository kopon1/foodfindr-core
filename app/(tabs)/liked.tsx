import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Trash2 } from 'lucide-react-native';
import { Restaurant } from '@/types/Restaurant';
import { restaurantService } from '@/services/restaurantService';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import BoltLogo from '@/components/BoltLogo';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 8;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function LikedScreen() {
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Reload liked restaurants every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadLikedRestaurants();
    }, [])
  );

  const loadLikedRestaurants = async () => {
    try {
      setIsLoading(true);
      const restaurants = await restaurantService.getLikedRestaurants();
      setLikedRestaurants(restaurants);
    } catch (error) {
      console.error('Error loading liked restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (restaurant: Restaurant) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await restaurantService.removeLikedRestaurant(restaurant.id);
      setLikedRestaurants(prev => prev.filter(r => r.id !== restaurant.id));
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to remove restaurant');
    }
  };

  const handleClearAll = () => {
    if (likedRestaurants.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear All',
      'Are you sure you want to remove all liked restaurants?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantService.clearAllLikedRestaurants();
              setLikedRestaurants([]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to clear restaurants');
            }
          },
        },
      ]
    );
  };

  const handleExplore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/');
  };

  const renderItem = ({ item }: { item: Restaurant }) => {
    if (!item || !item.id) {
      return null; // Skip rendering if item is null or has no id
    }
    
    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Could show restaurant details in the future
        }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/150?text=No+Image' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.unlikeButton}
            onPress={() => handleUnlike(item)}
            activeOpacity={0.7}
          >
            <Heart size={16} color="#FFFFFF" fill="#FF6B35" />
          </TouchableOpacity>
        </View>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cuisineType} numberOfLines={1}>
          {item.cuisineType.join(', ')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.emptyText}>Loading restaurants...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No liked restaurants yet</Text>
        <Text style={styles.emptyText}>
          Swipe right on restaurants you like to save them here
        </Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={handleExplore}
          activeOpacity={0.7}
        >
          <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BoltLogo size="medium" />
        <Text style={styles.headerTitle}>Liked</Text>
        {likedRestaurants.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF6B35" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={likedRestaurants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={9}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH + SPACING,
          offset: (ITEM_WIDTH + SPACING) * Math.floor(index / COLUMN_COUNT),
          index,
        })}
        ListFooterComponent={() => {
          return null;
        }}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  listContent: {
    padding: SPACING,
    paddingBottom: 40,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
    marginBottom: SPACING * 2,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unlikeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  cuisineType: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
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
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 80,
    paddingBottom: 16,
  },
  footerLogo: {
    width: 180,
    height: 60,
  },
});
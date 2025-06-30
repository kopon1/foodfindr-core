import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Trash2 } from 'lucide-react-native';
import { Restaurant } from '@/types/Restaurant';
import { restaurantService } from '@/services/restaurantService';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 8;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function LikedScreen() {
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      await restaurantService.removeLikedRestaurant(restaurant.id);
      setLikedRestaurants(prev => prev.filter(r => r.id !== restaurant.id));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove restaurant');
    }
  };

  const handleClearAll = () => {
    if (likedRestaurants.length === 0) return;
    
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
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to clear restaurants');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      activeOpacity={0.8}
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
          onPress={() => router.push('/')}
        >
          <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/public/logotext_poweredby_360w.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liked</Text>
        {likedRestaurants.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearAll}
          >
            <Trash2 size={18} color="#FF6B35" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={likedRestaurants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
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
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1,
    marginBottom: 8,
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
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
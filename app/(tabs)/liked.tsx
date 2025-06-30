import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, MapPin, Star } from 'lucide-react-native';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/Restaurant';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function LikedScreen() {
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedRestaurants();
  }, []);

  const loadLikedRestaurants = async () => {
    try {
      setLoading(true);
      const liked = await restaurantService.getLikedRestaurants();
      setLikedRestaurants(liked);
    } catch (error) {
      console.error('Error loading liked restaurants:', error);
      Alert.alert('Error', 'Failed to load liked restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLike = async (restaurantId: string) => {
    try {
      await restaurantService.removeLikedRestaurant(restaurantId);
      setLikedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (error) {
      console.error('Error removing like:', error);
      Alert.alert('Error', 'Failed to remove restaurant');
    }
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveLike(item.id)}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.restaurantMeta}>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.priceRange}>{item.priceRange}</Text>
        </View>
        
        <View style={styles.cuisineContainer}>
          {item.cuisineType.map((cuisine, index) => (
            <View key={index} style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>{cuisine}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.distance}>{item.distance} miles away</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liked Restaurants</Text>
        <Text style={styles.headerSubtitle}>
          {likedRestaurants.length} restaurant{likedRestaurants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {likedRestaurants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No liked restaurants yet</Text>
          <Text style={styles.emptySubtitle}>
            Start swiping to discover amazing places!
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  listContainer: {
    padding: 16,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginLeft: 4,
  },
  priceRange: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4ECDC4',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  cuisineTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
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
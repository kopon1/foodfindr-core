import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { 
  GestureDetector, 
  Gesture, 
  PanGestureHandlerEventPayload 
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Heart, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Restaurant } from '@/types/Restaurant';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface RestaurantCardProps {
  restaurant: Restaurant;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: any;
}

export function RestaurantCard({ 
  restaurant, 
  isTop, 
  onSwipe, 
  style 
}: RestaurantCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(direction);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event: PanGestureHandlerEventPayload) => {
      if (!isTop) return;
      
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, 0, screenWidth],
        [-30, 0, 30]
      );
      scale.value = interpolate(
        Math.abs(event.translationX),
        [0, SWIPE_THRESHOLD],
        [1, 0.95]
      );
    })
    .onEnd((event: PanGestureHandlerEventPayload) => {
      if (!isTop) return;

      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
        
        translateX.value = withTiming(targetX, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
        rotate.value = withTiming(direction === 'right' ? 30 : -30, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        
        runOnJS(triggerHapticFeedback)();
        setTimeout(() => {
          runOnJS(handleSwipe)(direction);
        }, 300);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const likeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
    transform: [
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.8, 1.1]) }
    ],
  }));

  const nopeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]),
    transform: [
      { scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1.1, 0.8]) }
    ],
  }));

  const handleLike = () => {
    if (!isTop) return;
    
    translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
    rotate.value = withTiming(30, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
    
    triggerHapticFeedback();
    setTimeout(() => {
      handleSwipe('right');
    }, 300);
  };

  const handlePass = () => {
    if (!isTop) return;
    
    translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
    rotate.value = withTiming(-30, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
    
    triggerHapticFeedback();
    setTimeout(() => {
      handleSwipe('left');
    }, 300);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, style, animatedStyle]}>
        <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
        
        {/* Swipe Indicators */}
        <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        
        <Animated.View style={[styles.nopeIndicator, nopeIndicatorStyle]}>
          <Text style={styles.nopeText}>PASS</Text>
        </Animated.View>
        
        {/* Content Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {restaurant.name || 'Unknown Restaurant'}
              </Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.rating}>{restaurant.rating || '4.0'}</Text>
              </View>
            </View>
            
            <View style={styles.meta}>
              <Text style={styles.priceRange}>{restaurant.priceRange || '$$'}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#E2E8F0" />
                <Text style={styles.distance}>{restaurant.distance} {typeof restaurant.distance === 'number' ? 'mi' : 'away'}</Text>
              </View>
            </View>
            
            <View style={styles.cuisineContainer}>
              {(restaurant.cuisineType || ['Restaurant']).slice(0, 3).map((cuisine, index) => (
                <View key={index} style={styles.cuisineTag}>
                  <Text style={styles.cuisineText}>{cuisine}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {restaurant.description || `${restaurant.name} - Powered by Foursquare`}
            </Text>
          </View>
        </LinearGradient>
        
        {/* Action Buttons */}
        {isTop && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.passButton} onPress={handlePass}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Heart size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRange: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4ECDC4',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
    marginLeft: 4,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  cuisineTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    lineHeight: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  likeIndicator: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  likeText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 60,
    left: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
  nopeText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
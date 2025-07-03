import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, X, Star, MapPin, Clock, Verified } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Restaurant } from '@/types/Restaurant';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.72;
const SWIPE_THRESHOLD = screenWidth * 0.25;
const ROTATION_STRENGTH = 15;

interface TinderCardProps {
  restaurant: Restaurant;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: any;
  index: number;
}

export function TinderCard({ 
  restaurant, 
  isTop, 
  onSwipe, 
  style,
  index 
}: TinderCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(isTop ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(isTop ? 1 : 0.8)).current;
  const [isPressed, setIsPressed] = useState(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS !== 'web') {
      const hapticType = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[type];
      Haptics.impactAsync(hapticType);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: () => isTop,
      
      onPanResponderGrant: () => {
        setIsPressed(true);
        triggerHaptic('light');
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },

      onPanResponderMove: (evt, gesture) => {
        if (!isTop) return;
        
        pan.setValue({ x: gesture.dx, y: gesture.dy * 0.1 });
        
        // Trigger haptic feedback when reaching threshold
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          if (!isPressed) {
            triggerHaptic('medium');
            setIsPressed(true);
          }
        } else {
          setIsPressed(false);
        }
      },

      onPanResponderRelease: (evt, gesture) => {
        setIsPressed(false);
        pan.flattenOffset();

        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          const direction = gesture.dx > 0 ? 'right' : 'left';
          const targetX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
          
          triggerHaptic('heavy');
          
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: targetX, y: gesture.dy },
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start(() => {
            onSwipe(direction);
          });
        } else {
          // Spring back to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleLike = () => {
    if (!isTop) return;
    
    triggerHaptic('heavy');
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: screenWidth * 1.5, y: -100 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onSwipe('right');
    });
  };

  const handlePass = () => {
    if (!isTop) return;
    
    triggerHaptic('medium');
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: -screenWidth * 1.5, y: -50 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onSwipe('left');
    });
  };

  // Animated styles
  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      {
        rotate: pan.x.interpolate({
          inputRange: [-screenWidth, 0, screenWidth],
          outputRange: [`-${ROTATION_STRENGTH}deg`, '0deg', `${ROTATION_STRENGTH}deg`],
          extrapolate: 'clamp',
        }),
      },
      { scale: scale },
    ],
    opacity: opacity,
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.cardContainer, style, cardStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Main Card */}
      <View style={styles.card}>
        {/* Restaurant Image */}
        <Image
          source={{ uri: restaurant.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Swipe Indicators */}
        <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
          <Text style={styles.likeLabelText}>YUMMY!</Text>
        </Animated.View>

        <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
          <Text style={styles.nopeLabelText}>NOPE</Text>
        </Animated.View>

        {/* Content Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            {/* Restaurant Info */}
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{restaurant.name}</Text>
                {restaurant.verified && (
                  <Verified size={20} color="#4ADEAA" fill="#4ADEAA" />
                )}
              </View>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{restaurant.rating}</Text>
              </View>
            </View>

            {/* Cuisine Tags */}
            <View style={styles.tagsContainer}>
              {restaurant.cuisineType.slice(0, 3).map((cuisine, idx) => (
                <BlurView key={idx} intensity={20} style={styles.tag}>
                  <Text style={styles.tagText}>{cuisine}</Text>
                </BlurView>
              ))}
            </View>

            {/* Price and Distance */}
            <View style={styles.metaRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
                <Text style={styles.priceLabel}>Price</Text>
              </View>
              
              <View style={styles.distanceContainer}>
                <MapPin size={14} color="#B0BEC5" />
                <Text style={styles.distance}>{restaurant.distance} mi</Text>
              </View>
              
              {restaurant.isOpen !== undefined && (
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: restaurant.isOpen ? '#4ADEAA' : '#FF6B6B' 
                  }]} />
                  <Text style={styles.statusText}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {restaurant.description}
            </Text>

            {/* Action Buttons */}
            {isTop && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.passButton]}
                  onPress={handlePass}
                  activeOpacity={0.8}
                >
                  <X size={28} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={handleLike}
                  activeOpacity={0.8}
                >
                  <Heart size={28} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
    flexShrink: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  priceContainer: {
    marginRight: 20,
  },
  priceRange: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ADEAA',
  },
  priceLabel: {
    fontSize: 11,
    color: '#B0BEC5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0E0E0',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E0E0E0',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#4ADEAA',
  },
  likeLabel: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: '#4ADEAA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '15deg' }],
    zIndex: 100,
  },
  likeLabelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  nopeLabel: {
    position: 'absolute',
    top: 60,
    left: 30,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-15deg' }],
    zIndex: 100,
  },
  nopeLabelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
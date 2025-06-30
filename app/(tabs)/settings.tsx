import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Trash2, 
  Info, 
  ChevronRight,
  User,
  LogOut
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantService } from '@/services/restaurantService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BoltLogo from '@/components/BoltLogo';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { user, signOut, refreshSession } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const locationSetting = await AsyncStorage.getItem('locationEnabled');
      
      if (locationSetting !== null) {
        setLocationEnabled(JSON.parse(locationSetting));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocationEnabled(value);
      await AsyncStorage.setItem('locationEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving location setting:', error);
    }
  };

  const handleClearLikedRestaurants = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Liked Restaurants',
      'Are you sure you want to remove all liked restaurants?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await restaurantService.clearAllLikedRestaurants();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'All liked restaurants have been cleared.');
            } catch (error) {
              console.error('Error clearing liked restaurants:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to clear liked restaurants.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefreshAccount = async () => {
    try {
      setIsRefreshing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await refreshSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing account:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'About FoodFindr',
      'FoodFindr v1.0.0\n\nDiscover amazing restaurants with a simple swipe. Built with React Native and Expo.\n\n© 2025 FoodFindr'
    );
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await signOut();
              router.replace('/auth/login');
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Sign out failed');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/auth/login');
  };

  const settings: SettingsItem[] = [
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Find restaurants near you',
      icon: <MapPin size={24} color="#FF6B35" />,
      type: 'toggle',
      value: locationEnabled,
      onToggle: handleLocationToggle,
    },
    {
      id: 'clear',
      title: 'Clear Liked Restaurants',
      subtitle: 'Remove all saved restaurants',
      icon: <Trash2 size={24} color="#EF4444" />,
      type: 'action',
      onPress: handleClearLikedRestaurants,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and info',
      icon: <Info size={24} color="#64748B" />,
      type: 'action',
      onPress: handleAbout,
    },
  ];

  // Add authentication settings based on user state
  if (user) {
    settings.push({
      id: 'signout',
      title: 'Sign Out',
      subtitle: 'Log out of your account',
      icon: <LogOut size={24} color="#EF4444" />,
      type: 'action',
      onPress: handleSignOut,
    });
  }

  const renderSettingItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
      activeOpacity={item.type === 'action' ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <View style={styles.settingAction}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#F1F5F9', true: '#FF6B35' }}
            thumbColor={item.value ? '#FFFFFF' : '#64748B'}
          />
        ) : (
          <ChevronRight size={20} color="#94A3B8" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Please wait...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          <BoltLogo size="medium" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {user ? (
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.user_metadata?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefreshAccount}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Text style={styles.refreshButtonText}>Refresh</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In to Your Account</Text>
          </TouchableOpacity>
        )}

        <View style={styles.settingsSection}>
          {settings.map(renderSettingItem)}
        </View>
        
        <View style={styles.footer}>
          <Image
            source={require('@/public/logotext_poweredby_360w.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A202C',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  settingAction: {
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  footerLogo: {
    width: 180,
    height: 60,
  },
});
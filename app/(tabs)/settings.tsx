import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView
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
  const { user, signOut } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState(true);
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
      setLocationEnabled(value);
      await AsyncStorage.setItem('locationEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving location setting:', error);
    }
  };

  const handleClearLikedRestaurants = () => {
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
              await restaurantService.clearAllLikedRestaurants();
              Alert.alert('Success', 'All liked restaurants have been cleared.');
            } catch (error) {
              console.error('Error clearing liked restaurants:', error);
              Alert.alert('Error', 'Failed to clear liked restaurants.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About FoodFindr',
      'FoodFindr v1.0.0\n\nDiscover amazing restaurants with a simple swipe. Built with React Native and Expo.\n\n© 2025 FoodFindr'
    );
  };

  const handleSignOut = async () => {
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
              await signOut();
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Sign out failed');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FF6B35',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1A202C',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  settingsSection: {
    paddingHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1A202C',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  settingAction: {
    marginLeft: 16,
  }
});
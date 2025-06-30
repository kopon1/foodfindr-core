import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  TextInput,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Bell, 
  Trash2, 
  Info, 
  ChevronRight,
  User,
  LogOut,
  Mail,
  Lock,
  LogIn
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantService } from '@/services/restaurantService';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const locationSetting = await AsyncStorage.getItem('locationEnabled');
      const notificationSetting = await AsyncStorage.getItem('notificationsEnabled');
      
      if (locationSetting !== null) {
        setLocationEnabled(JSON.parse(locationSetting));
      }
      if (notificationSetting !== null) {
        setNotificationsEnabled(JSON.parse(notificationSetting));
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

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleClearLikedRestaurants = () => {
    Alert.alert(
      'Clear Liked Restaurants',
      'Are you sure you want to remove all liked restaurants? This action cannot be undone.',
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

  const handleOpenAuthModal = (signUpMode = false) => {
    setIsSignUp(signUpMode);
    setEmail('');
    setPassword('');
    setName('');
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
      } else {
        await signIn(email, password);
      }
      handleCloseAuthModal();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been signed out');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign out failed');
    }
  };

  const settings: SettingsItem[] = [
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Find restaurants near you',
      icon: <MapPin size={24} color="#4ECDC4" />,
      type: 'toggle',
      value: locationEnabled,
      onToggle: handleLocationToggle,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Get notified about new restaurants',
      icon: <Bell size={24} color="#FF6B35" />,
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
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
            trackColor={{ false: '#F1F5F9', true: '#4ECDC4' }}
            thumbColor={item.value ? '#FFFFFF' : '#64748B'}
          />
        ) : (
          <ChevronRight size={20} color="#94A3B8" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your FoodFindr experience
          </Text>
        </View>

        <View style={styles.profileSection}>
          {user ? (
            <>
              <View style={styles.profileIcon}>
                <User size={32} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.user_metadata?.name || 'Food Explorer'}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileIcon}>
                <User size={32} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Guest User</Text>
                <Text style={styles.profileEmail}>Not signed in</Text>
              </View>
              <View style={styles.authButtons}>
                <TouchableOpacity 
                  style={styles.authButton}
                  onPress={() => handleOpenAuthModal(false)}
                >
                  <Text style={styles.authButtonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.authButton, styles.signUpButton]}
                  onPress={() => handleOpenAuthModal(true)}
                >
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settings.map(renderSettingItem)}
        </View>
      </ScrollView>

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAuthModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseAuthModal}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={20} color="#64748B" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color="#64748B" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? 'Please wait...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  authButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  authButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    marginBottom: 8,
  },
  authButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  signUpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B35',
  },
  settingsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  settingAction: {
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
    lineHeight: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  }
});
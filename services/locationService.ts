import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { UserLocation } from '@/types/Restaurant';
import Constants from 'expo-constants';

// Popular test locations for development
const TEST_LOCATIONS = {
  nyc: { lat: 40.7580, lng: -73.9855, name: 'Manhattan, NYC' },
  sf: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
  la: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
  chicago: { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
  miami: { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
  london: { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
  paris: { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
  tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }
};

class LocationService {
  private isDevelopmentMode = __DEV__;
  private isEmulator = this.detectEmulator();

  private detectEmulator(): boolean {
    if (Platform.OS === 'android') {
      // Check for common emulator indicators
      return (
        (Platform.constants as any)?.Fingerprint?.includes('generic') ||
        (Platform.constants as any)?.Fingerprint?.includes('emulator') ||
        Platform.constants?.Release?.includes('sdk') ||
        Constants.deviceName?.toLowerCase().includes('emulator') ||
        Constants.deviceName?.toLowerCase().includes('simulator')
      );
    }
    
    if (Platform.OS === 'ios') {
      return Constants.deviceName?.toLowerCase().includes('simulator') || false;
    }
    
    return false;
  }

  async getCurrentLocation(useTestLocation: boolean = false): Promise<UserLocation> {
    // Force test location if requested or if in development on emulator
    if (useTestLocation || (this.isDevelopmentMode && this.isEmulator)) {
      console.log('Using test location for development/emulator');
      return this.getTestLocation();
    }

    try {
      console.log('Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission not granted, using fallback location');
        return this.getFallbackLocation();
      }

      console.log('Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      console.log('Location obtained:', userLocation);
      return userLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      console.log('Using fallback location due to error');
      return this.getFallbackLocation();
    }
  }

  private getTestLocation(): UserLocation {
    // Cycle through test locations based on current time for variety
    const locations = Object.values(TEST_LOCATIONS);
    const index = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % locations.length;
    const selected = locations[index];
    
    console.log(`Using test location: ${selected.name}`);
    return { lat: selected.lat, lng: selected.lng };
  }

  private getFallbackLocation(): UserLocation {
    // Default to NYC for fallback
    console.log('Using fallback location: Manhattan, NYC');
    return TEST_LOCATIONS.nyc;
  }

  async checkLocationServices(): Promise<{
    enabled: boolean;
    permissions: Location.LocationPermissionResponse | null;
  }> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      const permissions = await Location.getForegroundPermissionsAsync();
      
      return { enabled, permissions };
    } catch (error) {
      console.error('Error checking location services:', error);
      return { enabled: false, permissions: null };
    }
  }

  getLocationDebugInfo(): {
    isDevelopmentMode: boolean;
    isEmulator: boolean;
    platform: string;
    deviceName: string | null;
  } {
    return {
      isDevelopmentMode: this.isDevelopmentMode,
      isEmulator: this.isEmulator,
      platform: Platform.OS,
      deviceName: Constants.deviceName || null,
    };
  }

  calculateDistance(point1: UserLocation, point2: UserLocation): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

interface NetworkInfo {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: any;
}

class NetworkService {
  private networkState: NetworkInfo | null = null;
  private listeners: ((info: NetworkInfo) => void)[] = [];

  async initialize(): Promise<void> {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.networkState = this.transformNetworkState(state);
      
      // Subscribe to network changes
      NetInfo.addEventListener(state => {
        const networkInfo = this.transformNetworkState(state);
        this.networkState = networkInfo;
        this.notifyListeners(networkInfo);
      });
      
      console.log('Network service initialized:', this.networkState);
    } catch (error) {
      console.error('Failed to initialize network service:', error);
    }
  }

  private transformNetworkState(state: any): NetworkInfo {
    return {
      isConnected: state.isConnected || false,
      type: state.type || 'unknown',
      isInternetReachable: state.isInternetReachable,
      details: state.details || {}
    };
  }

  getCurrentNetworkInfo(): NetworkInfo | null {
    return this.networkState;
  }

  async checkConnectivity(): Promise<NetworkInfo> {
    try {
      const state = await NetInfo.fetch();
      const networkInfo = this.transformNetworkState(state);
      this.networkState = networkInfo;
      return networkInfo;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
        details: {}
      };
    }
  }

  async testApiConnectivity(): Promise<{
    foursquare: boolean;
    supabase: boolean;
    general: boolean;
  }> {
    const results = {
      foursquare: false,
      supabase: false,
      general: false
    };

    // Test general internet connectivity
    try {
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
      });
      results.general = response.ok;
    } catch (error) {
      console.warn('General connectivity test failed:', error);
    }

    // Test Foursquare API connectivity
    try {
      const response = await fetch('https://api.foursquare.com/v3/places/search?limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY}`,
        },
      });
      results.foursquare = response.status === 200 || response.status === 400; // 400 means API is reachable but missing params
    } catch (error) {
      console.warn('Foursquare connectivity test failed:', error);
    }

    // Test Supabase connectivity
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      results.supabase = response.status < 500; // Any response < 500 means API is reachable
    } catch (error) {
      console.warn('Supabase connectivity test failed:', error);
    }

    console.log('API connectivity test results:', results);
    return results;
  }

  onNetworkChange(callback: (info: NetworkInfo) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(networkInfo: NetworkInfo): void {
    this.listeners.forEach(callback => {
      try {
        callback(networkInfo);
      } catch (error) {
        console.error('Error in network change listener:', error);
      }
    });
  }

  getEmulatorNetworkTips(): string[] {
    const tips = [
      'For Android Emulator:',
      '• Use "10.0.2.2" to access host machine localhost',
      '• Enable "Wipe data" and restart emulator if having persistent issues',
      '• Check if emulator has internet access in browser',
      '• Try using tunnel mode: expo start --tunnel',
      '',
      'For networking issues:',
      '• Ensure your firewall allows Expo CLI',
      '• Try different network (mobile hotspot) if on corporate network',
      '• Check if VPN is interfering with connections',
      '• Restart both emulator and Metro bundler'
    ];
    
    return tips;
  }

  async diagnoseConnectivity(): Promise<{
    network: NetworkInfo;
    apis: { foursquare: boolean; supabase: boolean; general: boolean };
    platform: string;
    recommendations: string[];
  }> {
    const network = await this.checkConnectivity();
    const apis = await this.testApiConnectivity();
    
    const recommendations = [];
    
    if (!network.isConnected) {
      recommendations.push('No network connection detected. Check your internet connection.');
    }
    
    if (network.isInternetReachable === false) {
      recommendations.push('Internet not reachable. May be behind captive portal or firewall.');
    }
    
    if (!apis.general) {
      recommendations.push('General internet connectivity failed. Check DNS or proxy settings.');
    }
    
    if (!apis.foursquare) {
      recommendations.push('Foursquare API unreachable. Check API key and network settings.');
    }
    
    if (!apis.supabase) {
      recommendations.push('Supabase unreachable. Check project URL and network settings.');
    }
    
    if (Platform.OS === 'android' && recommendations.length > 0) {
      recommendations.push(...this.getEmulatorNetworkTips());
    }
    
    return {
      network,
      apis,
      platform: Platform.OS,
      recommendations
    };
  }
}

export const networkService = new NetworkService();
# FoodFindr - Connectivity & Location Troubleshooting Guide

This guide helps resolve common connectivity and location issues when developing with Android emulators and testing the FoodFindr app.

## Quick Fix Checklist ✅

### 1. **Use Tunnel Mode (Recommended)**
```bash
expo start --tunnel
```
This bypasses many network configuration issues by creating a tunnel through Expo's servers.

### 2. **Install Required Dependencies**
```bash
npm install @react-native-community/netinfo
```

### 3. **Enable Development Mode Features**
The app automatically detects emulators and provides:
- Mock location data (cycles through major cities)
- Fallback restaurants if APIs fail
- Debug tools in Settings screen

## Common Issues & Solutions

### 🌐 Network Connectivity Issues

#### **Problem**: App can't connect to Foursquare or Supabase APIs

**Solutions**:
1. **Use Tunnel Mode**: `expo start --tunnel`
2. **Check Firewall**: Ensure Windows Firewall allows Expo CLI
3. **Try Mobile Hotspot**: Corporate networks often block required ports
4. **Disable VPN**: VPNs can interfere with local development
5. **Restart Services**: Close and restart both emulator and Expo CLI

#### **Problem**: "Network request failed" errors

**For Android Emulator**:
1. **Use 10.0.2.2**: In emulator, localhost becomes `10.0.2.2`
2. **Cold Boot**: Wipe emulator data and restart:
   - Android Studio → AVD Manager → Actions → Wipe Data
3. **Enable Internet**: Test browser in emulator to confirm internet access

**For Physical Device**:
1. **Same Network**: Ensure phone and computer are on same WiFi
2. **Developer Mode**: Enable USB debugging
3. **Check Expo Go**: Update to latest version

### 📍 Location Issues

#### **Problem**: Location permissions denied or not working

**Solutions**:
1. **Grant Permissions**: Allow location access when prompted
2. **System Settings**: 
   - Android: Settings → Apps → Expo Go → Permissions → Location
   - iOS: Settings → Privacy → Location Services → Expo Go
3. **Use Test Location**: The app automatically provides test locations in development mode

#### **Problem**: Location services unavailable on emulator

**For Android Emulator**:
1. **Enable Location**: 
   - Settings → Location → On
   - Settings → Apps → Permissions → Location → Allow
2. **Mock Location**: 
   - Developer Options → Select mock location app → Allow
3. **GPS Simulation**: Use Extended Controls in emulator (... button) → Location

**Automatic Fallback**: The app detects emulators and automatically uses test locations from major cities.

### 🔧 Android Studio Emulator Setup

#### **Optimal Emulator Configuration**:
1. **API Level**: Use API 29+ (Android 10+)
2. **RAM**: Allocate at least 2GB RAM
3. **Graphics**: Use Hardware acceleration
4. **Network**: Ensure "Use host GPU" is enabled

#### **Network Configuration**:
1. **Extended Controls** (... button in emulator)
2. **Settings → Proxy**: Set to "No proxy" 
3. **Cellular → Signal strength**: Set to "Great"
4. **WiFi**: Enable and connect

#### **Location Configuration**:
1. **Extended Controls → Location**
2. **Set location** to a major city (NYC, SF, LA)
3. **Or use GPX/KML file** for route simulation

### 🛠️ Built-in Debug Tools

The app includes debug tools accessible via **Settings screen**:

#### **1. Connectivity Diagnosis**
- Tests network connection
- Checks API connectivity (Foursquare & Supabase)
- Provides detailed recommendations
- Shows device and platform info

#### **2. Test Location**
- Shows current location detection
- Indicates if using emulator fallback
- Displays coordinates being used

#### **3. Development Mode Features**
When `__DEV__` is true, the app automatically:
- Detects emulator environment
- Uses test locations (cycles through major cities)
- Provides mock restaurant data if APIs fail
- Shows detailed console logging

## Environment Setup

### **Required Environment Variables**
Ensure these are set in your `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_FOURSQUARE_API_KEY=your-foursquare-api-key
```

### **Network Ports**
Expo uses these ports (ensure they're not blocked):
- **19000**: Expo Dev Tools
- **19001**: Expo CLI server
- **19002**: Metro bundler

## Testing Strategies

### **1. Emulator Testing**
- Use the built-in debug tools first
- Check console logs for detailed error messages
- Test with tunnel mode: `expo start --tunnel`

### **2. Physical Device Testing**
- Connect via USB and enable USB debugging
- Ensure same WiFi network
- Try scanning QR code vs manual IP entry

### **3. Network Isolation Testing**
```bash
# Test individual components
expo start --tunnel --dev-client
```

## Console Commands for Debugging

### **Check Network Status**
```javascript
// In app console
import { networkService } from './services/networkService';
await networkService.diagnoseConnectivity();
```

### **Test Location Service**
```javascript
// In app console  
import { locationService } from './services/locationService';
console.log(locationService.getLocationDebugInfo());
await locationService.getCurrentLocation(true); // Force test location
```

### **Check Restaurant Service**
```javascript
// In app console
import { restaurantService } from './services/restaurantService';
const restaurants = await restaurantService.getNearbyRestaurants();
console.log(`Found ${restaurants.length} restaurants`);
```

## When to Use Each Solution

| Issue | First Try | If That Fails | Last Resort |
|-------|-----------|---------------|-------------|
| Can't connect to Metro | `expo start --tunnel` | Restart emulator | Use physical device |
| API calls failing | Check debug tools | Try mobile hotspot | Use mock data (dev mode) |
| Location not working | Grant permissions | Use test location | Mock coordinates |
| Emulator slow/buggy | Cold boot emulator | Increase RAM allocation | Use different emulator |

## Getting Help

### **Debug Information to Collect**:
1. **Platform**: Android/iOS, emulator/device
2. **Network**: Result of connectivity diagnosis
3. **Location**: Result of location test  
4. **Console logs**: Any error messages
5. **Environment**: Development vs production build

### **Common Error Patterns**:
- `Network request failed` → Connectivity issue
- `Location permission denied` → Permissions issue  
- `No restaurants found` → API or location issue
- `Unable to resolve host` → DNS/network configuration

The app is designed to be resilient with multiple fallback mechanisms, so most issues can be resolved by following this guide systematically.
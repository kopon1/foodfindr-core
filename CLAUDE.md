# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoodFindr is a Tinder-style restaurant discovery app built with React Native, Expo, and Supabase. Users can swipe through restaurant cards to like or pass, manage their liked restaurants, and discover new places based on location.

## Development Commands

- `npm run dev` - Start the Expo development server (with telemetry disabled)
- `npm run build:web` - Build the web version using Expo export
- `npm run lint` - Run Expo linting
- `npm run test` - Run Jest tests

## Architecture

### Core Stack
- **React Native** with **Expo** for cross-platform mobile development
- **Expo Router** for file-based navigation with typed routes
- **Supabase** for backend services (auth, database, edge functions)
- **TypeScript** with strict mode enabled

### Key Architecture Patterns

#### Authentication Flow
- Uses `AuthContext` for global auth state management
- `AuthGuard` component in `app/_layout.tsx` handles route protection
- Session caching with AsyncStorage for faster app startup
- Auth state synchronized with Supabase auth changes

#### Navigation Structure
- File-based routing with Expo Router
- Main app structure: `/(tabs)` for authenticated users, `/auth` for login/signup
- Tab navigation for main app features (discover, liked, settings)

#### Data Layer
- Services layer: `authService`, `locationService`, `restaurantService`
- Supabase client configured for React Native with AsyncStorage persistence
- Edge functions for complex operations (nearby restaurants, liked management)

#### State Management
- React Context for authentication
- Local component state for UI interactions
- AsyncStorage for data persistence and caching

### Key Files and Directories

- `app/` - Expo Router file-based routing
- `components/` - Reusable UI components
- `contexts/` - React Context providers (AuthContext)
- `services/` - Business logic and API integration
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions

## Testing

- Jest configured for React Native environment
- Test setup in `jest.setup.js`
- Path mapping configured for `@/` imports
- Run individual tests with `jest <test-file>`

## Supabase Integration

The app connects to a Supabase instance for:
- User authentication (sign up, sign in, session management)
- Restaurant data storage and retrieval
- Location-based restaurant discovery via edge functions
- User preferences and liked restaurants tracking

Key edge functions:
- `get-nearby-restaurants` - Fetches restaurants by location
- `like-restaurant` - Manages user's liked restaurants
- `get-liked-restaurants` - Retrieves user's favorites
- `unlike-restaurant` - Removes from liked list

## Development Notes

- The app uses `useFrameworkReady` hook for proper initialization
- Authentication state is cached for instant UI display on app startup
- Location permissions are required for restaurant discovery
- Haptic feedback is implemented for user interactions
- The app supports both development and production Supabase environments
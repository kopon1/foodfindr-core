# FoodFindr App

A Tinder-style restaurant discovery app built with React Native and Expo.

## Features

- Swipe through restaurant cards to like or pass
- View and manage liked restaurants
- Authentication with Supabase (sign up, sign in, sign out)
- Dynamic restaurant data loaded from Supabase backend
- Location-based restaurant discovery

## Supabase Backend

The app uses Supabase for its backend with the following components:

### Database Schema

- **restaurants**: Stores restaurant information (name, image, rating, etc.)
- **cuisine_types**: Stores available cuisine types
- **restaurant_cuisine_types**: Maps restaurants to their cuisine types (many-to-many)
- **users**: Stores user information (extended from auth.users)
- **liked_restaurants**: Tracks which restaurants users have liked

### Edge Functions

- **get-nearby-restaurants**: Fetches restaurants near a specified location
- **like-restaurant**: Adds a restaurant to a user's liked list
- **get-liked-restaurants**: Retrieves a user's liked restaurants
- **unlike-restaurant**: Removes a restaurant from a user's liked list

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Expo CLI

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/foodfindr.git
cd foodfindr
```

2. Install dependencies:
```
pnpm install
```

3. Start the development server:
```
pnpm dev
```

## Environment Variables

The app connects to a Supabase instance. The connection details are already set up in the code.

## Authentication

The app includes a complete authentication system:
- Sign up with email and password
- Sign in with existing credentials
- Sign out functionality

## Development

This project uses:
- React Native with Expo
- Supabase for backend and authentication
- React Navigation for routing
- Gesture Handler and Reanimated for animations

## License

This project is licensed under the MIT License.

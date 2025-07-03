# Database Setup Guide

This guide explains how to set up the Supabase database for the FoodFindr app with real Foursquare data integration.

## Prerequisites

1. A Supabase project with the URL and anon key configured in your `.env` file
2. Foursquare API credentials (already configured in `.env`)
3. Supabase CLI (optional, for running migrations)

## Database Schema

The app uses three main tables:

### 1. `restaurants` table
Stores restaurant data fetched from Foursquare API:
- `id` (UUID, primary key)
- `foursquare_id` (TEXT, unique)
- `name` (TEXT)
- `image_url` (TEXT)
- `rating` (DECIMAL)
- `price_range` (TEXT)
- `cuisine_type` (TEXT[])
- `description` (TEXT)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `distance_miles` (DECIMAL)
- `address` (TEXT)
- `phone` (TEXT)
- `website` (TEXT)
- `verified` (BOOLEAN)
- `hours` (TEXT)
- `is_open` (BOOLEAN)
- Timestamps: `created_at`, `updated_at`

### 2. `user_likes` table
Tracks which restaurants users have liked:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `restaurant_id` (UUID, foreign key to restaurants)
- `created_at` (TIMESTAMP)

### 3. Database Functions
- `get_nearby_restaurants()` - Finds restaurants within a radius using Haversine formula
- `search_restaurants()` - Full-text search across restaurant names, descriptions, and cuisines
- `get_liked_restaurants()` - Gets user's liked restaurants with details

## Setting Up the Database

### Option 1: Manual Setup (Recommended)

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run each migration file in order:
   - `supabase/migrations/001_create_restaurants_table.sql`
   - `supabase/migrations/002_create_user_likes_table.sql`
   - `supabase/migrations/003_create_nearby_restaurants_function.sql`

### Option 2: Using Supabase CLI

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Row Level Security (RLS) Policies

The database includes RLS policies for security:

### Restaurants Table
- Public read access (anyone can view restaurants)
- Authenticated users can insert/update (for admin operations)

### User Likes Table
- Users can only view, insert, and delete their own likes
- Complete isolation between users

## Data Flow

1. **Initial Load**: App checks for restaurants in database
2. **If Empty**: Fetches from Foursquare API and stores in database
3. **Subsequent Loads**: Uses cached database data
4. **Refresh**: Force refreshes from Foursquare (24-hour cache by default)
5. **User Interactions**: Likes/unlikes stored directly in database

## Environment Variables

Ensure these are set in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_FOURSQUARE_API_KEY=your-foursquare-api-key
```

## Performance Optimizations

- **Spatial Indexing**: Location-based queries use spatial indexes
- **Text Search**: Full-text search indexes for restaurant names and descriptions
- **Caching**: 24-hour cache for restaurant data
- **Batch Processing**: Restaurants are inserted in batches to avoid overwhelming the database
- **Pagination**: Database functions support limit parameters

## Troubleshooting

### No Restaurants Found
1. Check location permissions
2. Verify Foursquare API key is valid
3. Check network connectivity
4. Review app logs for API errors

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check RLS policies are correctly applied
3. Ensure user is authenticated for like operations

### Performance Issues
1. Check if spatial indexes are created
2. Monitor database usage in Supabase dashboard
3. Consider adjusting cache duration if needed

## Monitoring

Monitor your setup through:
- Supabase Dashboard → Database → Logs
- Supabase Dashboard → API → Logs
- App console logs for service-level errors
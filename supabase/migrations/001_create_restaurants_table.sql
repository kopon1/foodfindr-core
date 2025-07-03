-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foursquare_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 4.0,
    price_range TEXT DEFAULT '$$',
    cuisine_type TEXT[] DEFAULT '{}',
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    distance_miles DECIMAL(5, 2),
    address TEXT,
    phone TEXT,
    website TEXT,
    verified BOOLEAN DEFAULT false,
    hours TEXT,
    is_open BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create an index on foursquare_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_foursquare_id ON public.restaurants(foursquare_id);

-- Create a spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants USING GIST (
    point(longitude, latitude)
);

-- Create index for name searches
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON public.restaurants USING GIN (
    to_tsvector('english', name)
);

-- Create index for cuisine type searches
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON public.restaurants USING GIN (cuisine_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to restaurants" ON public.restaurants
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update (for admin operations)
CREATE POLICY "Allow authenticated users to insert restaurants" ON public.restaurants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update restaurants" ON public.restaurants
    FOR UPDATE USING (auth.role() = 'authenticated');
-- Create user_likes table for tracking liked restaurants
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, restaurant_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON public.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_restaurant_id ON public.user_likes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_created_at ON public.user_likes(created_at);

-- Enable RLS
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for user likes
CREATE POLICY "Users can view their own likes" ON public.user_likes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON public.user_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.user_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to get liked restaurants for a user
CREATE OR REPLACE FUNCTION public.get_liked_restaurants(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    foursquare_id TEXT,
    name TEXT,
    image_url TEXT,
    rating DECIMAL(3,2),
    price_range TEXT,
    cuisine_type TEXT[],
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_miles DECIMAL(5, 2),
    address TEXT,
    phone TEXT,
    website TEXT,
    verified BOOLEAN,
    hours TEXT,
    is_open BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    liked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.foursquare_id,
        r.name,
        r.image_url,
        r.rating,
        r.price_range,
        r.cuisine_type,
        r.description,
        r.latitude,
        r.longitude,
        r.distance_miles,
        r.address,
        r.phone,
        r.website,
        r.verified,
        r.hours,
        r.is_open,
        r.created_at,
        r.updated_at,
        ul.created_at as liked_at
    FROM public.restaurants r
    INNER JOIN public.user_likes ul ON r.id = ul.restaurant_id
    WHERE ul.user_id = user_id_param
    ORDER BY ul.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_liked_restaurants(UUID) TO authenticated;
-- Create function to get nearby restaurants
CREATE OR REPLACE FUNCTION public.get_nearby_restaurants(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_miles DECIMAL(5, 2) DEFAULT 10.0,
    limit_count INTEGER DEFAULT 50
)
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
    updated_at TIMESTAMP WITH TIME ZONE
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
        -- Calculate distance in miles using Haversine formula
        ROUND(
            (3959 * ACOS(
                COS(RADIANS(user_lat)) * COS(RADIANS(r.latitude)) * 
                COS(RADIANS(r.longitude) - RADIANS(user_lng)) + 
                SIN(RADIANS(user_lat)) * SIN(RADIANS(r.latitude))
            ))::DECIMAL, 2
        ) AS distance_miles,
        r.address,
        r.phone,
        r.website,
        r.verified,
        r.hours,
        r.is_open,
        r.created_at,
        r.updated_at
    FROM public.restaurants r
    WHERE 
        -- Filter by distance using bounding box for performance
        r.latitude BETWEEN (user_lat - (radius_miles / 69.0)) AND (user_lat + (radius_miles / 69.0))
        AND r.longitude BETWEEN (user_lng - (radius_miles / (69.0 * COS(RADIANS(user_lat))))) AND (user_lng + (radius_miles / (69.0 * COS(RADIANS(user_lat)))))
    ORDER BY 
        -- Calculate distance for ordering
        (3959 * ACOS(
            COS(RADIANS(user_lat)) * COS(RADIANS(r.latitude)) * 
            COS(RADIANS(r.longitude) - RADIANS(user_lng)) + 
            SIN(RADIANS(user_lat)) * SIN(RADIANS(r.latitude))
        ))
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users (including anonymous)
GRANT EXECUTE ON FUNCTION public.get_nearby_restaurants(DECIMAL, DECIMAL, DECIMAL, INTEGER) TO anon, authenticated;

-- Create function to search restaurants by name or cuisine
CREATE OR REPLACE FUNCTION public.search_restaurants(
    search_query TEXT,
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_miles DECIMAL(5, 2) DEFAULT 10.0,
    limit_count INTEGER DEFAULT 50
)
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
    updated_at TIMESTAMP WITH TIME ZONE
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
        -- Calculate distance in miles
        ROUND(
            (3959 * ACOS(
                COS(RADIANS(user_lat)) * COS(RADIANS(r.latitude)) * 
                COS(RADIANS(r.longitude) - RADIANS(user_lng)) + 
                SIN(RADIANS(user_lat)) * SIN(RADIANS(r.latitude))
            ))::DECIMAL, 2
        ) AS distance_miles,
        r.address,
        r.phone,
        r.website,
        r.verified,
        r.hours,
        r.is_open,
        r.created_at,
        r.updated_at
    FROM public.restaurants r
    WHERE 
        -- Distance filter
        r.latitude BETWEEN (user_lat - (radius_miles / 69.0)) AND (user_lat + (radius_miles / 69.0))
        AND r.longitude BETWEEN (user_lng - (radius_miles / (69.0 * COS(RADIANS(user_lat))))) AND (user_lng + (radius_miles / (69.0 * COS(RADIANS(user_lat)))))
        -- Text search filter
        AND (
            to_tsvector('english', r.name) @@ plainto_tsquery('english', search_query)
            OR to_tsvector('english', r.description) @@ plainto_tsquery('english', search_query)
            OR EXISTS (
                SELECT 1 FROM unnest(r.cuisine_type) AS cuisine
                WHERE cuisine ILIKE '%' || search_query || '%'
            )
        )
    ORDER BY 
        -- Calculate distance for ordering
        (3959 * ACOS(
            COS(RADIANS(user_lat)) * COS(RADIANS(r.latitude)) * 
            COS(RADIANS(r.longitude) - RADIANS(user_lng)) + 
            SIN(RADIANS(user_lat)) * SIN(RADIANS(r.latitude))
        ))
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.search_restaurants(TEXT, DECIMAL, DECIMAL, DECIMAL, INTEGER) TO anon, authenticated;
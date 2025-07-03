export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  priceRange: string;
  cuisineType: string[];
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
  // Additional Foursquare fields
  foursquareId?: string;
  address?: string;
  phone?: string;
  website?: string;
  verified?: boolean;
  hours?: string;
  isOpen?: boolean;
  // Database fields
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
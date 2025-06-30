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
}

export interface UserLocation {
  lat: number;
  lng: number;
}
import { Restaurant, UserLocation } from '@/types/Restaurant';

const FOOD_IMAGES = {
  burgers: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1550317138-10000687a72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1563612488-04ae1e292640?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  pasta: [
    'https://images.unsplash.com/photo-1556761223-4c4282c73f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1563379091339-03246963d51b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  tacos: [
    'https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1565299585323-38174c5f1d20?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356cf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  chinese: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1585394207991-b50a5b4ac486?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  seafood: [
    'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1559847844-d721426d6edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1563379091339-03246963d51b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ],
  coffee: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'
  ]
};

const RESTAURANT_TEMPLATES = [
  // Burgers & American
  {
    name: 'The Burger Lab',
    category: 'burgers',
    cuisineType: ['American', 'Burgers'],
    priceRange: '$$',
    description: 'Gourmet burgers with locally sourced ingredients and artisanal buns',
    rating: 4.7,
    verified: true,
    specialties: ['Truffle Burger', 'BBQ Bacon Smash', 'Plant-Based Wonder']
  },
  {
    name: 'Smash Street',
    category: 'burgers',
    cuisineType: ['American', 'Fast Casual'],
    priceRange: '$',
    description: 'Classic smash burgers done right with crispy edges and melted cheese',
    rating: 4.5,
    verified: false,
    specialties: ['Double Smash', 'Crispy Chicken', 'Loaded Fries']
  },
  {
    name: 'Crown & Anchor',
    category: 'burgers',
    cuisineType: ['American', 'Pub Food'],
    priceRange: '$$$',
    description: 'Upscale gastropub featuring craft burgers and local craft beer',
    rating: 4.6,
    verified: true,
    specialties: ['Wagyu Burger', 'Beer-Battered Fish', 'Craft Beer Selection']
  },

  // Pizza & Italian
  {
    name: 'Nonna\'s Table',
    category: 'pizza',
    cuisineType: ['Italian', 'Pizza'],
    priceRange: '$$',
    description: 'Authentic Neapolitan pizza with wood-fired ovens and family recipes',
    rating: 4.8,
    verified: true,
    specialties: ['Margherita Classica', 'Prosciutto e Funghi', 'Burrata Special']
  },
  {
    name: 'Slice Paradise',
    category: 'pizza',
    cuisineType: ['Italian', 'New York Style'],
    priceRange: '$',
    description: 'Giant NY-style slices and whole pies with that perfect crispy crust',
    rating: 4.4,
    verified: false,
    specialties: ['Pepperoni Classic', 'White Pizza', 'Sicilian Square']
  },
  {
    name: 'Artisan Fire',
    category: 'pizza',
    cuisineType: ['Italian', 'Artisanal'],
    priceRange: '$$$',
    description: 'Creative artisanal pizzas with unique toppings and craft cocktails',
    rating: 4.6,
    verified: true,
    specialties: ['Fig & Goat Cheese', 'Truffle Mushroom', 'Spicy Honey Pepperoni']
  },

  // Sushi & Japanese
  {
    name: 'Zen Sushi',
    category: 'sushi',
    cuisineType: ['Japanese', 'Sushi'],
    priceRange: '$$$',
    description: 'Fresh sashimi and creative rolls in a tranquil bamboo setting',
    rating: 4.9,
    verified: true,
    specialties: ['Omakase Experience', 'Dragon Roll', 'Chirashi Bowl']
  },
  {
    name: 'Tokyo Express',
    category: 'sushi',
    cuisineType: ['Japanese', 'Fast Casual'],
    priceRange: '$$',
    description: 'Quick and fresh sushi bowls, ramen, and bento boxes',
    rating: 4.3,
    verified: false,
    specialties: ['Salmon Poke Bowl', 'Tonkotsu Ramen', 'Bento Boxes']
  },
  {
    name: 'Sakura Premium',
    category: 'sushi',
    cuisineType: ['Japanese', 'Fine Dining'],
    priceRange: '$$$$',
    description: 'High-end sushi bar with master chef and pristine ingredients',
    rating: 4.8,
    verified: true,
    specialties: ['A5 Wagyu', 'Seasonal Omakase', 'Premium Sake Selection']
  },

  // Mexican & Tacos
  {
    name: 'El Corazón',
    category: 'tacos',
    cuisineType: ['Mexican', 'Tacos'],
    priceRange: '$',
    description: 'Authentic street tacos with house-made tortillas and fresh salsas',
    rating: 4.6,
    verified: true,
    specialties: ['Al Pastor', 'Carnitas', 'Fish Tacos']
  },
  {
    name: 'Taco Libre',
    category: 'tacos',
    cuisineType: ['Mexican', 'Tex-Mex'],
    priceRange: '$$',
    description: 'Modern Mexican with creative tacos, margaritas, and live music',
    rating: 4.4,
    verified: false,
    specialties: ['Korean BBQ Taco', 'Craft Margaritas', 'Elote Street Corn']
  },
  {
    name: 'Casa Fuego',
    category: 'tacos',
    cuisineType: ['Mexican', 'Regional'],
    priceRange: '$$$',
    description: 'Elevated Mexican cuisine celebrating regional traditions and mezcal',
    rating: 4.7,
    verified: true,
    specialties: ['Mole Negro', 'Cochinita Pibil', 'Mezcal Collection']
  },

  // Indian & Curry
  {
    name: 'Spice Route',
    category: 'indian',
    cuisineType: ['Indian', 'Curry'],
    priceRange: '$$',
    description: 'Aromatic curries and tandoor specialties from across India',
    rating: 4.5,
    verified: true,
    specialties: ['Butter Chicken', 'Biryani', 'Garlic Naan']
  },
  {
    name: 'Bombay Palace',
    category: 'indian',
    cuisineType: ['Indian', 'Fine Dining'],
    priceRange: '$$$',
    description: 'Elegant Indian dining with regional specialties and wine pairings',
    rating: 4.7,
    verified: true,
    specialties: ['Lamb Vindaloo', 'Seafood Curry', 'Thali Platters']
  },

  // Chinese & Asian
  {
    name: 'Golden Dragon',
    category: 'chinese',
    cuisineType: ['Chinese', 'Cantonese'],
    priceRange: '$$',
    description: 'Traditional Cantonese dishes with dim sum and Peking duck',
    rating: 4.4,
    verified: false,
    specialties: ['Peking Duck', 'Har Gow', 'Mapo Tofu']
  },
  {
    name: 'Wok This Way',
    category: 'chinese',
    cuisineType: ['Chinese', 'Fast Casual'],
    priceRange: '$',
    description: 'Quick wok-fried dishes and noodles made to order',
    rating: 4.2,
    verified: false,
    specialties: ['Kung Pao Chicken', 'Lo Mein', 'Fried Rice']
  },

  // Seafood
  {
    name: 'Ocean\'s Bounty',
    category: 'seafood',
    cuisineType: ['Seafood', 'American'],
    priceRange: '$$$',
    description: 'Fresh catch daily with coastal-inspired preparations',
    rating: 4.6,
    verified: true,
    specialties: ['Lobster Roll', 'Grilled Salmon', 'Seafood Platter']
  },
  {
    name: 'The Crab Shack',
    category: 'seafood',
    cuisineType: ['Seafood', 'Casual'],
    priceRange: '$$',
    description: 'Casual seafood spot with crab boils and fish & chips',
    rating: 4.3,
    verified: false,
    specialties: ['Crab Boil', 'Fish & Chips', 'Shrimp Po\'boy']
  },

  // Dessert & Coffee
  {
    name: 'Sweet Dreams',
    category: 'dessert',
    cuisineType: ['Dessert', 'Bakery'],
    priceRange: '$$',
    description: 'Artisanal desserts and pastries made fresh daily',
    rating: 4.8,
    verified: true,
    specialties: ['Chocolate Lava Cake', 'Crème Brûlée', 'Seasonal Tarts']
  },
  {
    name: 'Bean There',
    category: 'coffee',
    cuisineType: ['Coffee', 'Breakfast'],
    priceRange: '$',
    description: 'Third-wave coffee roastery with breakfast pastries and wifi',
    rating: 4.5,
    verified: true,
    specialties: ['Single Origin Pour-over', 'Avocado Toast', 'House Roast']
  }
];

class MockDataService {
  private getRandomImage(category: keyof typeof FOOD_IMAGES): string {
    const images = FOOD_IMAGES[category];
    return images[Math.floor(Math.random() * images.length)];
  }

  private generateDistance(): number {
    // Generate realistic distances between 0.1 and 5.0 miles
    return Math.round((Math.random() * 4.9 + 0.1) * 10) / 10;
  }

  private generateCoordinates(baseLocation: UserLocation, distance: number): { lat: number; lng: number } {
    // Generate coordinates within roughly the distance specified
    const angle = Math.random() * 2 * Math.PI;
    const distanceInDegrees = distance / 69; // Rough conversion: 1 degree ≈ 69 miles
    
    return {
      lat: baseLocation.lat + Math.cos(angle) * distanceInDegrees * (0.5 + Math.random() * 0.5),
      lng: baseLocation.lng + Math.sin(angle) * distanceInDegrees * (0.5 + Math.random() * 0.5)
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  generateRestaurants(baseLocation: UserLocation, count: number = 30): Restaurant[] {
    // Shuffle templates to get variety
    const shuffledTemplates = this.shuffleArray(RESTAURANT_TEMPLATES);
    const restaurants: Restaurant[] = [];

    for (let i = 0; i < count; i++) {
      const template = shuffledTemplates[i % shuffledTemplates.length];
      const distance = this.generateDistance();
      const location = this.generateCoordinates(baseLocation, distance);
      
      // Add some variation to names if we're repeating templates
      const nameVariation = i >= shuffledTemplates.length ? ` ${Math.floor(i / shuffledTemplates.length) + 1}` : '';
      
      const restaurant: Restaurant = {
        id: `mock-${i + 1}`,
        foursquareId: `mock-fs-${i + 1}`,
        name: template.name + nameVariation,
        imageUrl: this.getRandomImage(template.category as keyof typeof FOOD_IMAGES),
        rating: template.rating + (Math.random() - 0.5) * 0.4, // Slight variation
        priceRange: template.priceRange,
        cuisineType: template.cuisineType,
        description: template.description,
        location: location,
        distance: distance,
        verified: template.verified,
        address: this.generateAddress(),
        phone: this.generatePhoneNumber(),
        website: `https://${template.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        hours: this.generateHours(),
        isOpen: Math.random() > 0.2, // 80% chance of being open
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      restaurants.push(restaurant);
    }

    // Sort by distance
    return restaurants.sort((a, b) => a.distance - b.distance);
  }

  private generateAddress(): string {
    const streetNumbers = [123, 456, 789, 321, 654, 987, 147, 258, 369];
    const streetNames = [
      'Main St', 'Oak Ave', 'Elm St', 'Pine Rd', 'Cedar Blvd', 'Maple Dr',
      'Washington St', 'First Ave', 'Second St', 'Third Ave', 'Park Blvd',
      'Broadway', 'Market St', 'Union Square', 'Harbor Dr', 'Valley Rd'
    ];
    
    const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    return `${streetNumber} ${streetName}`;
  }

  private generatePhoneNumber(): string {
    const areaCodes = ['415', '510', '650', '925', '408', '669', '831'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private generateHours(): string {
    const options = [
      'Mon-Sun 11am-10pm',
      'Mon-Thu 11am-9pm, Fri-Sat 11am-11pm, Sun 12pm-9pm',
      'Tue-Sun 5pm-10pm, Closed Mon',
      'Mon-Fri 7am-3pm, Sat-Sun 8am-4pm',
      'Daily 11am-9pm',
      'Mon-Sat 11am-10pm, Sun 12pm-9pm'
    ];
    
    return options[Math.floor(Math.random() * options.length)];
  }

  generateTrendingRestaurants(baseLocation: UserLocation): Restaurant[] {
    // Generate a smaller set of "trending" restaurants with higher ratings
    const trending = this.generateRestaurants(baseLocation, 8);
    return trending.map(restaurant => ({
      ...restaurant,
      rating: Math.max(4.3, restaurant.rating), // Ensure high ratings for trending
      verified: true // Trending restaurants are typically verified
    }));
  }

  generateNearbyRestaurants(baseLocation: UserLocation): Restaurant[] {
    // Generate restaurants within 2 miles
    const nearby = this.generateRestaurants(baseLocation, 15);
    return nearby.filter(r => r.distance <= 2.0);
  }
}

export const mockDataService = new MockDataService();
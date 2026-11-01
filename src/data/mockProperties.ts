import { Property, Inquiry, User } from '@/types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-madhu-001',
    name: 'Madhu Sharma',
    email: 'info.madhu786@gmail.com',
    phone: '+91 98765 43210',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-priya-002',
    name: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '+91 98220 12345',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    createdAt: '2024-02-10T12:30:00Z',
  },
  {
    id: 'user-rahul-003',
    name: 'Rahul Kulkarni',
    email: 'rahul.k@realnest.in',
    phone: '+91 99112 88776',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    createdAt: '2023-11-05T08:00:00Z',
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '3-bhk-apartment-baner-pune',
    title: '3 BHK Ultra-Luxury Skyline Apartment in Baner',
    description: 'Breathtaking 3 BHK luxury apartment situated in the prime high-street vicinity of Baner, Pune. Features panoramic balcony views of the Baner hills, expansive Italian marble living hall, modular German fittings kitchen, smart home automation, and 2 dedicated covered stilt car parking slots. Within 5 minutes drive to Balewadi High Street and Mumbai-Pune expressway.',
    features: ['Modular German Kitchen', 'Italian Marble Flooring', '2 Covered Parkings', 'Smart Home Automation', 'Baner Hill View Deck'],
    price: 16500000,
    propertyType: 'apartment',
    city: 'Pune',
    location: 'Baner',
    bedrooms: 3,
    bathrooms: 3,
    area: 1850,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Spacious Designer Living Room'
      },
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 1,
        caption: 'Exterior Building Architecture & Balconies'
      },
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 2,
        caption: 'Master Bedroom with Wooden Flooring'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-25T14:30:00Z'
  },
  {
    id: '2-bhk-sunlit-flat-baner-pashan-pune',
    title: '2 BHK Modern Sunlit Flat in Baner Pashan Link Road',
    description: 'Well-maintained 2 BHK flat for immediate sale. Prime location with excellent cross-ventilation, east-west orientation, modular kitchen cabinets, and spacious dry balcony. Gated society with swimming pool, gym, clubhouse and 24x7 security guard staff.',
    features: ['Pashan Lake Breeze', 'Gated Society', 'Modular Woodwork', 'Covered Parking'],
    price: 9200000,
    propertyType: 'apartment',
    city: 'Pune',
    location: 'Baner',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-201',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Apartment Hall & Dining'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-20T10:15:00Z'
  },
  {
    id: '3-bhk-premium-garden-residence-wakad-pune',
    title: '3 BHK Premium Garden View Residence in Wakad',
    description: 'Located in the heart of Wakad, this 3 BHK boasts pristine garden views, dual master bedrooms, piped gas connection, wooden finish floor tiles, and close proximity to Hinjewadi IT Park.',
    features: ['Garden Facing', 'Double Master Bedrooms', 'Clubhouse & Pool'],
    price: 13500000,
    propertyType: 'apartment',
    city: 'Pune',
    location: 'Wakad',
    bedrooms: 3,
    bathrooms: 3,
    area: 1550,
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-301',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Living Room'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-22T09:00:00Z'
  },
  {
    id: '4-bhk-sea-facing-penthouse-bandra-west-mumbai',
    title: '4 BHK Sea Facing Penthouse with Private Terrace in Bandra West',
    description: 'Exquisite 4 BHK penthouse offering uninterrupted Arabian Sea panoramas from Perry Cross Road, Bandra West. Features double-height living room ceilings, private elevator access, and plunge pool.',
    features: ['Arabian Sea View', 'Private Plunge Pool', 'Direct Elevator Access', 'Private Deck'],
    price: 125000000,
    propertyType: 'villa',
    city: 'Mumbai',
    location: 'Bandra West',
    bedrooms: 4,
    bathrooms: 5,
    area: 4200,
    coverImage: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-m1',
        url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Luxury Penthouse Terrace Deck'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-18T16:00:00Z'
  },
  {
    id: '2-bhk-designer-apartment-rent-powai-mumbai',
    title: '2 BHK Designer Apartment in Powai Hiranandani',
    description: 'Chic European style 2 BHK flat overlooking the serene Powai lake. Equipped with branded electronics, double-door refrigerator, leather recliners, and high-speed fiber internet.',
    features: ['Lake View Balcony', 'Imported Leather Recliners', 'Olympic Pool'],
    price: 85000,
    propertyType: 'apartment',
    city: 'Mumbai',
    location: 'Powai',
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-p1',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Bright Scandinavian Living Room'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-27T11:00:00Z'
  },
  {
    id: '4-bhk-luxury-courtyard-villa-whitefield-bangalore',
    title: '4 BHK Luxury Courtyard Villa in Whitefield',
    description: 'Sprawling 4 BHK independent triplex villa in an exclusive gated enclave in Whitefield. Features private lawn, double car garage, solar water heating, and close access to ITPL.',
    features: ['Private Landscaped Lawn', 'Double Car Garage', 'Solar Heating'],
    price: 38000000,
    propertyType: 'villa',
    city: 'Bangalore',
    location: 'Whitefield',
    bedrooms: 4,
    bathrooms: 4,
    area: 3600,
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-b1',
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Villa Exterior & Lawn'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-24T08:30:00Z'
  },
  {
    id: '3-bhk-high-rise-flat-lake-view-sarjapur-bangalore',
    title: '3 BHK High-Rise Flat with Lake View in Sarjapur Road',
    description: 'Corner 3 BHK apartment with breathtaking views of Kaikondrahalli Lake. Ample natural sunlight, premium bathroom fittings, Italian tiles, modular kitchen with chimney and hob.',
    features: ['Kaikondrahalli Lake View', 'Italian Tiles', 'Corner Unit'],
    price: 18500000,
    propertyType: 'apartment',
    city: 'Bangalore',
    location: 'Sarjapur Road',
    bedrooms: 3,
    bathrooms: 3,
    area: 1780,
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-b3',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Modern Living Space'
      }
    ],
    ownerId: 'user-priya-002',
    createdAt: '2026-10-26T12:00:00Z'
  },
  {
    id: '3-bhk-elegant-builder-floor-greater-kailash-delhi',
    title: '3 BHK Elegant Builder Floor in Greater Kailash 1',
    description: 'Brand new luxury builder floor on stilt parking with private elevator access in GK-1, South Delhi. Italian marble flooring, VRV air conditioning, expansive balconies and dedicated servant quarters.',
    features: ['Private Elevator', 'VRV Air Conditioning', 'Italian Marble'],
    price: 49500000,
    propertyType: 'house',
    city: 'Delhi NCR',
    location: 'Greater Kailash',
    bedrooms: 3,
    bathrooms: 4,
    area: 2400,
    coverImage: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-d1',
        url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Master Drawing Room'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-15T10:00:00Z'
  },
  {
    id: '3-bhk-high-end-flat-gachibowli-hyderabad',
    title: '3 BHK High-End Gated Community Flat in Gachibowli',
    description: 'Located in Gachibowli Financial District, minutes away from Microsoft, Google, and Amazon campuses. Premium fittings, club with swimming pool, badminton, cricket nets, and supermarket inside society.',
    features: ['Near Tech Campuses', 'Olympic Pool', 'Supermarket on-site'],
    price: 21500000,
    propertyType: 'apartment',
    city: 'Hyderabad',
    location: 'Gachibowli',
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    coverImage: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-h1',
        url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Luxury Apartment Interior'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-19T13:45:00Z'
  },
  {
    id: '4-bhk-beachside-villa-ecr-chennai',
    title: '4 BHK Beachside Independent Villa on ECR Road',
    description: 'Stunning contemporary beach house located off East Coast Road (ECR), Chennai. Direct private pathway to clean sandy beach, private plunge pool, manicured lawn, and dedicated solar rooftop setup.',
    features: ['Direct Beach Access', 'Private Plunge Pool', 'Solar Rooftop Setup'],
    price: 52000000,
    propertyType: 'villa',
    city: 'Chennai',
    location: 'ECR (East Coast Road)',
    bedrooms: 4,
    bathrooms: 5,
    area: 4500,
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img-c1',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Villa Facade & Pool'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-12T15:20:00Z'
  },
  {
    id: 'modern-luxury-villa-san-diego',
    title: 'Modern Architectural Villa with Ocean Deck in La Jolla',
    description: 'Stunning coastal luxury villa in San Diego featuring expansive glass walls, heated infinity pool, panoramic Pacific views, open-concept gourmet kitchen, and private sunset observation terrace.',
    features: ['Pacific Ocean Views', 'Infinity Pool', 'Designer Kitchen', 'Private Sunset Terrace'],
    price: 2850000,
    propertyType: 'villa',
    city: 'San Diego',
    location: 'La Jolla',
    address: '742 Coast Blvd, La Jolla, San Diego, CA',
    bedrooms: 4,
    bathrooms: 4,
    area: 3800,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'sd-1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Front Villa Architecture'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-30T10:00:00Z'
  },
  {
    id: 'victorian-designer-home-san-francisco',
    title: 'Restored Victorian Luxury Residence in Pacific Heights',
    description: 'Iconic San Francisco charm with completely modern interior finishes. High ceilings, herringbone hardwood floors, bay windows overlooking the Golden Gate Bay, and private landscaped garden.',
    features: ['Bay Windows', 'Herringbone Hardwood', 'Private Garden', 'Golden Gate Views'],
    price: 3450000,
    propertyType: 'house',
    city: 'San Francisco',
    location: 'Pacific Heights',
    address: '2240 Broadway St, San Francisco, CA',
    bedrooms: 3,
    bathrooms: 3,
    area: 2600,
    coverImage: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'sf-1',
        url: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'San Francisco Architecture'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-29T14:00:00Z'
  },
  {
    id: 'luxury-brownstone-residence-new-jersey',
    title: 'Historic Modernized Brownstone with Rooftop Deck',
    description: 'Beautifully crafted multi-story home in historic Hoboken, New Jersey. Exposed brick walls, custom chef kitchen with Viking appliances, private elevator, and Manhattan skyline views from private rooftop.',
    features: ['Manhattan Skyline View', 'Custom Chef Kitchen', 'Private Rooftop', 'Exposed Brick'],
    price: 1650000,
    propertyType: 'house',
    city: 'New Jersey',
    location: 'Hoboken',
    address: '815 Washington St, Hoboken, NJ',
    bedrooms: 3,
    bathrooms: 3,
    area: 2350,
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'nj-1',
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Brownstone Facade'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-28T16:30:00Z'
  },
  {
    id: 'contemporary-penthouse-loop-chicago',
    title: 'Contemporary High-Floor Penthouse Overlooking Millennium Park',
    description: 'Floor-to-ceiling glass corner unit in Chicago Loop. Unobstructed views of Lake Michigan and the city skyline. 24/7 concierge, private parking garage, and fitness club access.',
    features: ['Lake Michigan View', '24/7 Concierge', 'Floor-to-Ceiling Glass', 'Covered Garage'],
    price: 1420000,
    propertyType: 'apartment',
    city: 'Chicago',
    location: 'The Loop',
    address: '130 N Garland Ct, Chicago, IL',
    bedrooms: 2,
    bathrooms: 2,
    area: 1850,
    coverImage: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'chi-1',
        url: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Skyline Terrace'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-27T08:00:00Z'
  },
  {
    id: 'high-rise-loft-new-york',
    title: 'Sun-Drenched Industrial Luxury Loft in SoHo',
    description: 'Quintessential New York loft featuring cast-iron columns, 13-foot timber ceilings, wide-plank oak floors, custom Boffi kitchen, and oversized soundproof windows in premier downtown Manhattan/SoHo location.',
    features: ['13-ft Ceilings', 'Cast-iron Columns', 'Boffi Kitchen', 'Soundproof Windows'],
    price: 3200000,
    propertyType: 'apartment',
    city: 'New York',
    location: 'SoHo',
    address: '482 Broome St, New York, NY',
    bedrooms: 2,
    bathrooms: 2,
    area: 2100,
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'ny-1',
        url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'New York Loft'
      }
    ],
    ownerId: 'user-madhu-001',
    createdAt: '2026-10-26T11:45:00Z'
  },
  {
    id: 'skyline-tower-apartment-manhattan',
    title: 'Ultra-Modern Skyline Tower Residence in Tribeca',
    description: 'Masterpiece 3-bedroom residence in Tribeca, Manhattan. Unrivaled Hudson River vistas, private key-locked elevator landing, Calacatta marble bathrooms, and world-class luxury building amenities.',
    features: ['Hudson River Views', 'Private Elevator Landing', 'Calacatta Marble', 'Tribeca Prime'],
    price: 4600000,
    propertyType: 'apartment',
    city: 'Manhattan',
    location: 'Tribeca',
    address: '111 Murray St, Manhattan, NY',
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    coverImage: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'man-1',
        url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
        sortOrder: 0,
        caption: 'Tribeca Tower'
      }
    ],
    ownerId: 'user-rahul-003',
    createdAt: '2026-10-25T09:15:00Z'
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-001',
    propertyId: '3-bhk-apartment-baner-pune',
    propertyTitle: '3 BHK Ultra-Luxury Skyline Apartment in Baner',
    propertySlug: '3-bhk-apartment-baner-pune',
    propertyCity: 'Pune',
    propertyCoverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    senderId: 'user-priya-002',
    name: 'Anand Patil',
    email: 'anand.patil@outlook.com',
    phone: '+91 98234 56789',
    message: 'Hello, I am interested in visiting this 3 BHK in Baner this Saturday afternoon around 3 PM.',
    status: 'replied',
    replyMessage: 'Hi Anand! Saturday 3:00 PM works great. Our site coordinator Mr. Sharma (+91 98765 43210) will receive you at the main clubhouse reception for a private guided walkthrough. Looking forward to welcoming you!',
    repliedAt: '2026-10-31T11:45:00Z',
    createdAt: '2026-10-31T09:15:00Z',
  },
  {
    id: 'inq-002',
    propertyId: '4-bhk-sea-facing-penthouse-bandra-west-mumbai',
    propertyTitle: '4 BHK Sea Facing Penthouse with Private Terrace in Bandra West',
    propertySlug: '4-bhk-sea-facing-penthouse-bandra-west-mumbai',
    propertyCity: 'Mumbai',
    propertyCoverImage: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    senderId: null,
    name: 'Vikramaditya Singhania',
    email: 'vikram.s@singhaniagroup.com',
    phone: '+91 98200 99881',
    message: 'We are looking for sea-view penthouse properties in Bandra West for senior executive relocation.',
    status: 'read',
    createdAt: '2026-10-29T11:20:00Z',
  }
];

// Cities matching the exact "Properties by cities" section from Humero
export const HUMERO_CITIES = [
  {
    name: 'San Diego',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1541464522988-31b420f688b9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'San Francisco',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'New Jersey',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chicago',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'New York',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Manhattan',
    count: '1 Property',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80',
  }
];

export const TOP_CITIES = [
  {
    name: 'San Diego',
    state: 'California',
    count: '850+',
    image: 'https://images.unsplash.com/photo-1541464522988-31b420f688b9?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['La Jolla', 'Downtown', 'Pacific Beach', 'Mission Valley']
  },
  {
    name: 'San Francisco',
    state: 'California',
    count: '1,200+',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Downtown', 'Pacific Heights', 'Marina', 'SoMa']
  },
  {
    name: 'New Jersey',
    state: 'New Jersey',
    count: '980+',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Hoboken', 'Jersey City', 'Newark', 'Princeton']
  },
  {
    name: 'Chicago',
    state: 'Illinois',
    count: '1,560+',
    image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['The Loop', 'Lincoln Park', 'River North', 'West Loop']
  },
  {
    name: 'New York',
    state: 'New York',
    count: '3,400+',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Manhattan', 'Brooklyn', 'Queens', 'Williamsburg']
  },
  {
    name: 'Manhattan',
    state: 'New York',
    count: '2,100+',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Tribeca', 'SoHo', 'Midtown', 'Upper East Side']
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    count: '14,250+',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Baner', 'Wakad', 'Hinjewadi', 'Viman Nagar']
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    count: '22,400+',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Bandra West', 'Powai', 'Andheri West', 'Juhu']
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    count: '18,800+',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
    popularLocalities: ['Whitefield', 'Sarjapur Road', 'HSR Layout']
  }
];

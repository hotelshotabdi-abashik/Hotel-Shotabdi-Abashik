
export interface Room {
  id: string;
  title: string;
  price: string;
  discountPrice: string;
  tag: string;
  desc: string;
  features: string[];
  image: string;
  capacity: number;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  buttonText: string;
  locationLabel: string;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  distance: string;
  image: string;
  tag: string;
  mapUrl?: string;
  phone?: string;
}

export interface Attraction {
  id: number;
  name: string;
  subtitle: string;
  distance: string;
  description: string;
  image: string;
  mapUrl: string;
  phone?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  ctaText: string;
  discountPercent?: number;
  isOneTime?: boolean;
  startDate?: number;
  endDate?: number;
}

export interface SiteConfig {
  hero: HeroConfig;
  rooms: Room[];
  restaurants: Restaurant[];
  touristGuides: Attraction[];
  offers: Offer[];
  announcement: string;
  lastUpdated: number;
}

export interface GuestInfo {
  legalName: string;
  age: string;
  nidNumber: string;
  phone: string;
  guardianPhone: string;
  nidImageUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roomTitle: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  guests: GuestInfo[];
  price: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  roomNumber?: string;
  rejectionReason?: string;
  hasEdited: boolean;
  createdAt: number;
  // Fix: Added missing optional timestamps for tracking guest arrival and departure
  arrivedAt?: number;
  leftAt?: number;
}

export interface UserProfile {
  uid: string;
  legalName: string;
  username: string;
  email: string;
  phone: string;
  guardianPhone: string;
  nidNumber: string;
  nidImageUrl: string;
  photoURL: string;
  age: string;
  bio: string;
  createdAt: number;
  lastUpdated: number;
  lastLogin: number;
  isComplete: boolean;
  claims?: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking_update' | 'system';
  read: boolean;
  createdAt: number;
}

/**
 * ChatMessage interface for AI Concierge conversation history
 */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

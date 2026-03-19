
export interface Room {
  id: string;
  title: string;
  price: string;
  discountPrice: string;
  discountLabel?: string;
  tag: string;
  desc: string;
  features: string[];
  image: string;
  capacity: number;
  isRecommended?: boolean;
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
  description?: string;
  mapUrl?: string;
  phone?: string;
  isRecommended?: boolean;
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
  isRecommended?: boolean;
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
  isRecommended?: boolean;
}

export interface HelpDeskNumber {
  number: string;
  labelEn: string;
  labelBn: string;
}

export interface SiteConfig {
  hero: HeroConfig;
  rooms: Room[];
  restaurants: Restaurant[];
  touristGuides: Attraction[];
  offers: Offer[];
  announcement: string;
  logoUrl?: string;
  helpDeskNumbers?: HelpDeskNumber[];
  lastUpdated: number;
  socialLinks?: {
    facebook: string;
    instagram: string;
    website: string;
  };
}

export interface GuestInfo {
  legalName: string;
  age: string;
  nidNumber: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  nidImageUrl: string;
}

export type BookingMode = 'website' | 'call_confirm' | 'direct_call';

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
  bookingMode: BookingMode;
  roomNumber?: string;
  rejectionReason?: string;
  hasEdited: boolean;
  createdAt: number;
  arrivedAt?: number;
  leftAt?: number;
}

export interface UserProfile {
  uid: string;
  legalName: string;
  username: string;
  email: string;
  phone: string;
  guardianName: string;
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
  fcmToken?: string;
  role?: 'guest' | 'staff' | 'manager' | 'owner';
  onlineStatus?: boolean;
  isTyping?: boolean;
  lastSeenPath?: string;
  lastActive?: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking_update' | 'system';
  read: boolean;
  createdAt: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

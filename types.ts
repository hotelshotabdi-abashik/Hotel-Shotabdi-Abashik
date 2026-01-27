
export interface Room {
  id: string;
  title: string;
  price: string;
  tag: string;
  desc: string;
  features: string[];
  image: string;
  capacity: number;
}

export type ViewType = 'overview' | 'rooms' | 'guide' | 'restaurants' | 'privacy' | 'terms';

export interface TouristSpot {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
  bio: string;
  createdAt: number;
  lastUpdated: number;
  lastLogin: number;
  isComplete: boolean;
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
  guests: string;
  price: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  roomNumber?: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking_update' | 'system';
  read: boolean;
  createdAt: number;
}

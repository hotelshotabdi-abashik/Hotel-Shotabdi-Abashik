
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

// Added ChatMessage interface to fix: Module '"../types"' has no exported member 'ChatMessage'.
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

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

export type ViewType = 'overview' | 'rooms' | 'guide' | 'restaurants';

export interface TouristSpot {
  title: string;
  uri: string;
}

// Added ChatMessage for AI conversation components
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
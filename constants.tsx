
import React from 'react';
import { Home, Bed, Map, Utensils, Tag } from 'lucide-react';
import { Room } from './types';

export const ROOMS_DATA: Room[] = [
  {
    id: 'deluxe-single',
    title: "Deluxe Single",
    price: "1,300",
    discountPrice: "1,000",
    tag: "BEST VALUE",
    desc: "Cozy accommodation designed for 1 person. Perfect for solo travelers seeking peace.",
    features: ["Free Wi-Fi", "Single Bed", "Attached Bath", "City View"],
    image: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&q=80",
    capacity: 1
  },
  {
    id: 'deluxe-double',
    title: "Deluxe Double",
    price: "3,500",
    discountPrice: "2,600",
    tag: "POPULAR",
    desc: "Spacious comfort for 2 persons. Ideal for couples or business partners visiting Sylhet.",
    features: ["Mini-fridge", "King Size Bed", "AC", "Balcony"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80",
    capacity: 2
  },
  {
    id: 'family-suite',
    title: "Family Suite",
    price: "4,500",
    discountPrice: "3,400",
    tag: "GRAND",
    desc: "Luxurious space for up to 5 persons. Great for small families on vacation.",
    features: ["Living Area", "2 Double Beds", "Extra Bed", "River View"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80",
    capacity: 5
  },
  {
    id: 'super-deluxe',
    title: "Super Deluxe",
    price: "5,500",
    discountPrice: "4,200",
    tag: "LUXURY",
    desc: "Premium massive suite for 6-7 persons. The ultimate group experience in Sylhet.",
    features: ["3 Queen Beds", "Large Living Hall", "Kitchenette", "Panoramic View"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    capacity: 7
  }
];

export const NAV_ITEMS = [
  { id: 'overview', path: '/', label: 'Overview', icon: <Home size={20} /> },
  { id: 'offers', path: '/offers', label: 'Exclusive Offers', icon: <Tag size={20} /> },
  { id: 'rooms', path: '/rooms', label: 'Our Rooms', icon: <Bed size={20} /> },
  { id: 'restaurants', path: '/restaurants', label: 'Restaurants', icon: <Utensils size={20} /> },
  { id: 'guide', path: '/guide', label: 'Tourist Guide', icon: <Map size={20} /> },
];

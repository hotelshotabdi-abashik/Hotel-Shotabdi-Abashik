
// DO NOT REMOVE OR OVERWRITE - ACTIVE PRODUCTION DATA.
// This file contains the primary registry for rooms, restaurants, and tourist guides.

import React from 'react';
import { Home, Bed, Map, Utensils, Tag, MessageSquare, History } from 'lucide-react';
import { Room, Restaurant, Attraction } from './types';

// Global application constants
export const LOGO_ICON_URL = "https://pub-9f3e455c1df04b5b98df165c6987ccca.r2.dev/Logo/shotabdi%20logo.png";

export const ROOMS_DATA: Room[] = [
  {
    id: 'deluxe-single',
    title: "Deluxe Single",
    price: "1,333",
    discountPrice: "1,000",
    discountLabel: "25% OFF",
    tag: "BEST VALUE",
    desc: "Cozy accommodation designed for 1 person. Perfect for solo travelers seeking peace.",
    features: ["Free Wi-Fi", "Single Bed", "Attached Bath", "City View"],
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200",
    capacity: 1
  },
  {
    id: 'deluxe-double',
    title: "Deluxe Double",
    price: "3,467",
    discountPrice: "2,600",
    discountLabel: "25% OFF",
    tag: "POPULAR",
    desc: "Spacious comfort for 2 persons. Ideal for couples or business partners visiting Sylhet.",
    features: ["Mini-fridge", "King Size Bed", "AC", "Balcony"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
    capacity: 2
  },
  {
    id: 'family-suite',
    title: "Family Suite",
    price: "4,533",
    discountPrice: "3,400",
    discountLabel: "25% OFF",
    tag: "GRAND",
    desc: "Luxurious space for up to 5 persons. Great for small families on vacation.",
    features: ["Living Area", "2 Double Beds", "Extra Bed", "River View"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200",
    capacity: 5
  },
  {
    id: 'super-deluxe',
    title: "Super Deluxe",
    price: "5,600",
    discountPrice: "4,200",
    discountLabel: "25% OFF",
    tag: "LUXURY",
    desc: "Premium massive suite for 6-7 persons. The ultimate group experience in Sylhet.",
    features: ["3 Queen Beds", "Large Living Hall", "Kitchenette", "Panoramic View"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
    capacity: 7
  }
];

export const SYLHET_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Panshi Restaurant", cuisine: "Traditional Bengali", rating: 4.8, time: "15m", distance: "4.5 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800", tag: "🥘 Must Visit", description: "The most famous restaurant in Sylhet. Try their duck curry and 30+ types of Bhorta.", phone: "+8801711223344", isRecommended: true },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "18m", distance: "4.6 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b547b4de5?auto=format&fit=crop&q=80&w=800", tag: "🍛 Authentic", description: "Rival to Panshi, famous for variety and authentic Sylheti fish dishes.", phone: "+8801711223355", isRecommended: true },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "20m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800", tag: "🍢 Fine Dining", description: "Best kebabs and Biryani in a royal environment at Zindabazar.", phone: "+8801711223366", isRecommended: true },
  { id: 4, name: "Eatopia", cuisine: "Multi-Cuisine", rating: 4.5, time: "22m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", tag: "🍕 Global", description: "Modern multicuisine restaurant perfect for families and large groups.", phone: "+8801711223377" },
  { id: 5, name: "Handi Restaurant", cuisine: "North Indian", rating: 4.7, time: "25m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800", tag: "🥘 Spicy", description: "Authentic Indian Handi cuisine and butter chicken in the heart of Zindabazar.", phone: "+8801711223388" },
  { id: 6, name: "Seven 17", cuisine: "Cafe & Fast Food", rating: 4.4, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800", tag: "☕ Trendy", description: "Popular youth hang-out with great pasta, burgers, and cold coffee.", phone: "+8801711223399" },
  { id: 7, name: "Chicken Hut", cuisine: "Fast Food", rating: 4.2, time: "12m", distance: "3.5 km", image: "https://images.unsplash.com/photo-15626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800", tag: "🍗 Fried", description: "Reliable local favorite for fried chicken and snacks in Ambarkhana.", phone: "+8801711223300" },
  { id: 8, name: "Burger King (Sylhet)", cuisine: "Burgers", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800", tag: "🍔 Global Chain", description: "International standard flame-grilled burgers located in Zindabazar.", phone: "+8801711445566" },
  { id: 9, name: "KFC Sylhet", cuisine: "Fried Chicken", rating: 4.4, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80&w=800", tag: "🍗 Global Chain", description: "The original Colonel's secret recipe chicken at Zindabazar center.", phone: "+8801711445577" },
  { id: 10, name: "Secret Recipe", cuisine: "Cafe/Cakes", rating: 4.5, time: "24m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800", tag: "🍰 Premium", description: "Famous for international standard cakes and continental dishes.", phone: "+8801711445588" },
  { id: 11, name: "Tasty Treat", cuisine: "Bakery & Cafe", rating: 4.1, time: "10m", distance: "3.2 km", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", tag: "🥯 Bakery", description: "Quick snacks, pastries, and affordable bites at Ambarkhana.", phone: "+8801711445599" },
  { id: 12, name: "Cooper's Sylhet", cuisine: "Bakery", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800", tag: "🍰 Classic", description: "Legendary bakery brand offering high-quality savories and desserts.", phone: "+8801711445500" },
  { id: 13, name: "Spice Sylhet", cuisine: "Asian Fusion", rating: 4.2, time: "18m", distance: "4.7 km", image: "https://images.unsplash.com/photo-1512058560366-cd242959b4fe?auto=format&fit=crop&q=80&w=800", tag: "🌶️ Asian", description: "Excellent Thai and Chinese dishes in a modern setting.", phone: "+8801711556611" },
  { id: 14, name: "Grand Buffet", cuisine: "Buffet", rating: 4.6, time: "25m", distance: "5.4 km", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", tag: "🍱 Mega Buffet", description: "Sylhet's largest buffet spread with over 80+ items.", phone: "+8801711556622" },
  { id: 15, name: "Skyline Restaurant", cuisine: "Continental", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800", tag: "☁️ City View", description: "Breathtaking views and great steaks in Zindabazar.", phone: "+8801711556633" },
  { id: 16, name: "Mithai", cuisine: "Traditional Sweets", rating: 4.2, time: "10m", distance: "3.4 km", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800", tag: "🍬 Sweets", description: "Famous for traditional Bengali sweets and snacks at Ambarkhana.", phone: "+8801711556644" },
  { id: 17, name: "BBQ Tonight", cuisine: "Grill", rating: 4.4, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800", tag: "🔥 Grill House", description: "Specialized in barbecue platters, naan, and Afghani chicken.", phone: "+8801711556655" },
  { id: 18, name: "Pizza Hut", cuisine: "Pizza", rating: 4.3, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", tag: "🍕 Global Chain", description: "Reliable pizza chain located at Zindabazar crossing.", phone: "+8801711556677" },
  { id: 19, name: "Chillox Sylhet", cuisine: "Burgers", rating: 4.5, time: "18m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800", tag: "🍔 Juicy", description: "Juicy, loaded burgers that are highly popular among youth.", phone: "+8801711556688" },
  { id: 20, name: "Takeout Sylhet", cuisine: "Burgers", rating: 4.4, time: "18m", distance: "4.7 km", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800", tag: "🍔 Takeout", description: "Famous for cheese-loaded burgers and unique sauces.", phone: "+8801711556699" },
  { id: 21, name: "Kacchi Bhai", cuisine: "Kacchi Biryani", rating: 4.7, time: "18m", distance: "4.6 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800", tag: "🍛 Kacchi King", description: "Authentic Bashmati Kacchi Biryani served in Zindabazar.", phone: "+8801711667700" },
  { id: 22, name: "Sultan's Dine", cuisine: "Kacchi Biryani", rating: 4.8, time: "18m", distance: "4.5 km", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800", tag: "👑 Premium Kacchi", description: "Luxury Kacchi experience with borhani and chatni.", phone: "+8801711667711" },
  { id: 23, name: "Food Forest", cuisine: "Chinese", rating: 4.2, time: "12m", distance: "3.6 km", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=800", tag: "🥡 Local Chinese", description: "Reliable and tasty local Chinese food in Ambarkhana area.", phone: "+8801711667722" },
  { id: 24, name: "Cafe 12", cuisine: "Cafe", rating: 4.4, time: "5m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800", tag: "☕ SUST Area", description: "Cozy student-friendly cafe located very close to the SUST main gate.", phone: "+8801711667733" },
  { id: 25, name: "Tea Garden Cafe", cuisine: "Snacks & Tea", rating: 4.5, time: "25m", distance: "6.5 km", image: "https://images.unsplash.com/photo-1544739313-6fad02872377?auto=format&fit=crop&q=80&w=800", tag: "🍃 Nature", description: "Enjoy fresh tea in the middle of Malnicherra tea garden.", phone: "+8801711667744" },
  { id: 26, name: "Al-Hamrah Buffet", cuisine: "Multi", rating: 4.1, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=800", tag: "🥘 Buffet", description: "Budget-friendly buffet option inside Al-Hamrah Shopping City.", phone: "+8801711667755" },
  { id: 27, name: "Cilantro", cuisine: "Mexican/Fusion", rating: 4.5, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", tag: "🌮 Mexican", description: "Sylhet's best spot for nachos, tacos, and sizzling fajitas.", phone: "+8801711667766" },
  { id: 28, name: "The Grameen", cuisine: "Bengali", rating: 4.2, time: "18m", distance: "4.9 km", image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&q=80&w=800", tag: "🍚 Traditional", description: "Authentic village-style Bengali food in the city center.", phone: "+8801711667777" },
  { id: 29, name: "Royal Dine", cuisine: "Indian Mughlai", rating: 4.4, time: "22m", distance: "5.3 km", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800", tag: "👑 Royal", description: "Grand interior and premium Indian dishes.", phone: "+8801711667788" },
  { id: 30, name: "Shotabdi Kitchen", cuisine: "Bengali & Continental", rating: 5.0, time: "0m", distance: "0 km", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", tag: "🏨 In-House", description: "Our very own kitchen serving fresh and safe meals directly to your room.", phone: "Dial 101", isRecommended: true }
];

export const SYLHET_ATTRACTIONS: Attraction[] = [
  { id: 1, name: "Keane Bridge", subtitle: "Historic Landmark", distance: "0.8 km", description: "The 'Gateway to Sylhet'. An iconic 1936 steel structure offering panoramic river views.", image: "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Keane+Bridge+Sylhet", isRecommended: true },
  { id: 2, name: "Shah Jalal Dargah", subtitle: "Spiritual Center", distance: "1.5 km", description: "The most sacred spiritual site in the region, housing the tomb of the famous saint.", image: "https://images.unsplash.com/photo-1564767609342-620cb19b2357?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Shah+Jalal+Dargah+Sylhet", isRecommended: true },
  { id: 3, name: "Malnicherra Tea Estate", subtitle: "Nature & Heritage", distance: "3.5 km", description: "The oldest tea garden in South Asia. Rolling hills of green as far as the eye can see.", image: "https://images.unsplash.com/photo-1544739313-6fad02872377?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Malnicherra+Tea+Estate" },
  { id: 4, name: "Ratargul Swamp Forest", subtitle: "Nature & Wonder", distance: "26 km", description: "Bangladesh's only freshwater swamp forest. A mystical boat journey through submerged trees.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ratargul+Swamp+Forest" },
  { id: 5, name: "Bisnakandi", subtitle: "Stone & Stream", distance: "42 km", description: "Where the Meghalaya mountains meet the clear blue streams. A paradise for nature lovers.", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bisnakandi+Sylhet", isRecommended: false },
  { id: 6, name: "Jaflong", subtitle: "Stone Collection", distance: "56 km", description: "Famous for its stone collection from the riverbed and the stunning Zero Point border.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jaflong+Sylhet", isRecommended: false }
];

export const NAV_ITEMS = [
  { id: 'home', path: '/', label: 'Home', icon: <Home size={20} /> },
  { id: 'about', path: '/about', label: 'About', icon: <Tag size={20} /> },
  { id: 'helpdesk', path: '/helpdesk', label: 'Help Desk', icon: <MessageSquare size={20} /> },
];

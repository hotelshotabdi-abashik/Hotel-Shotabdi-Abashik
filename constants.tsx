
import React from 'react';
import { Home, Bed, Map, Utensils, Tag } from 'lucide-react';
import { Room, Restaurant, Attraction } from './types';

// Global application constants
export const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";

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
    image: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    capacity: 7
  }
];

export const SYLHET_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Panshi Restaurant", cuisine: "Traditional Bengali", rating: 4.8, time: "15m", distance: "4.5 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Must Visit", description: "The most famous restaurant in Sylhet. Try their duck curry and 30+ types of Bhorta.", phone: "+8801711223344", isRecommended: true },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "18m", distance: "4.6 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Authentic", description: "Rival to Panshi, famous for variety and authentic Sylheti fish dishes.", phone: "+8801711223355", isRecommended: true },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "20m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Fine Dining", description: "Best kebabs and Biryani in a royal environment at Zindabazar.", phone: "+8801711223366", isRecommended: true },
  { id: 4, name: "Eatopia", cuisine: "Multi-Cuisine", rating: 4.5, time: "22m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍕 Global", description: "Modern multicuisine restaurant perfect for families and large groups.", phone: "+8801711223377" },
  { id: 5, name: "Handi Restaurant", cuisine: "North Indian", rating: 4.7, time: "25m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Spicy", description: "Authentic Indian Handi cuisine and butter chicken in the heart of Zindabazar.", phone: "+8801711223388" },
  { id: 6, name: "Seven 17", cuisine: "Cafe & Fast Food", rating: 4.4, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "☕ Trendy", description: "Popular youth hang-out with great pasta, burgers, and cold coffee.", phone: "+8801711223399" },
  { id: 7, name: "Chicken Hut", cuisine: "Fast Food", rating: 4.2, time: "12m", distance: "3.5 km", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80", tag: "🍗 Fried", description: "Reliable local favorite for fried chicken and snacks in Ambarkhana.", phone: "+8801711223300" },
  { id: 8, name: "Burger King (Sylhet)", cuisine: "Burgers", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80", tag: "🍔 Global Chain", description: "International standard flame-grilled burgers located in Zindabazar.", phone: "+8801711445566" },
  { id: 9, name: "KFC Sylhet", cuisine: "Fried Chicken", rating: 4.4, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80", tag: "🍗 Global Chain", description: "The original Colonel's secret recipe chicken at Zindabazar center.", phone: "+8801711445577" },
  { id: 10, name: "Secret Recipe", cuisine: "Cafe/Cakes", rating: 4.5, time: "24m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1559925393-8be0ec41b50b?auto=format&fit=crop&q=80", tag: "🍰 Premium", description: "Famous for international standard cakes and continental dishes.", phone: "+8801711445588" },
  { id: 11, name: "Tasty Treat", cuisine: "Bakery & Cafe", rating: 4.1, time: "10m", distance: "3.2 km", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80", tag: "🥯 Bakery", description: "Quick snacks, pastries, and affordable bites at Ambarkhana.", phone: "+8801711445599" },
  { id: 12, name: "Cooper's Sylhet", cuisine: "Bakery", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80", tag: "🍰 Classic", description: "Legendary bakery brand offering high-quality savories and desserts.", phone: "+8801711445500" },
  { id: 13, name: "Spice Sylhet", cuisine: "Asian Fusion", rating: 4.2, time: "18m", distance: "4.7 km", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80", tag: "🌶️ Asian", description: "Excellent Thai and Chinese dishes in a modern setting.", phone: "+8801711556611" },
  { id: 14, name: "Grand Buffet", cuisine: "Buffet", rating: 4.6, time: "25m", distance: "5.4 km", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80", tag: "🍱 Mega Buffet", description: "Sylhet's largest buffet spread with over 80+ items.", phone: "+8801711556622" },
  { id: 15, name: "Skyline Restaurant", cuisine: "Continental", rating: 4.3, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80", tag: "☁️ City View", description: "Breathtaking views and great steaks in Zindabazar.", phone: "+8801711556633" },
  { id: 16, name: "Mithai", cuisine: "Traditional Sweets", rating: 4.2, time: "10m", distance: "3.4 km", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80", tag: "🍬 Sweets", description: "Famous for traditional Bengali sweets and snacks at Ambarkhana.", phone: "+8801711556644" },
  { id: 17, name: "BBQ Tonight", cuisine: "Grill", rating: 4.4, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80", tag: "🔥 Grill House", description: "Specialized in barbecue platters, naan, and Afghani chicken.", phone: "+8801711556655" },
  { id: 18, name: "Pizza Hut", cuisine: "Pizza", rating: 4.3, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80", tag: "🍕 Global Chain", description: "Reliable pizza chain located at Zindabazar crossing.", phone: "+8801711556677" },
  { id: 19, name: "Chillox Sylhet", cuisine: "Burgers", rating: 4.5, time: "18m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80", tag: "🍔 Juicy", description: "Juicy, loaded burgers that are highly popular among youth.", phone: "+8801711556688" },
  { id: 20, name: "Takeout Sylhet", cuisine: "Burgers", rating: 4.4, time: "18m", distance: "4.7 km", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80", tag: "🍔 Takeout", description: "Famous for cheese-loaded burgers and unique sauces.", phone: "+8801711556699" },
  { id: 21, name: "Kacchi Bhai", cuisine: "Kacchi Biryani", rating: 4.7, time: "18m", distance: "4.6 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🍛 Kacchi King", description: "Authentic Bashmati Kacchi Biryani served in Zindabazar.", phone: "+8801711667700" },
  { id: 22, name: "Sultan's Dine", cuisine: "Kacchi Biryani", rating: 4.8, time: "18m", distance: "4.5 km", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80", tag: "👑 Premium Kacchi", description: "Luxury Kacchi experience with borhani and chatni.", phone: "+8801711667711" },
  { id: 23, name: "Food Forest", cuisine: "Chinese", rating: 4.2, time: "12m", distance: "3.6 km", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80", tag: "🥡 Local Chinese", description: "Reliable and tasty local Chinese food in Ambarkhana area.", phone: "+8801711667722" },
  { id: 24, name: "Cafe 12", cuisine: "Cafe", rating: 4.4, time: "5m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "☕ SUST Area", description: "Cozy student-friendly cafe located very close to the SUST main gate.", phone: "+8801711667733" },
  { id: 25, name: "Tea Garden Cafe", cuisine: "Snacks & Tea", rating: 4.5, time: "25m", distance: "6.5 km", image: "https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?auto=format&fit=crop&q=80", tag: "🍃 Nature", description: "Enjoy fresh tea in the middle of Malnicherra tea garden.", phone: "+8801711667744" },
  { id: 26, name: "Al-Hamrah Buffet", cuisine: "Multi", rating: 4.1, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80", tag: "🥘 Buffet", description: "Budget-friendly buffet option inside Al-Hamrah Shopping City.", phone: "+8801711667755" },
  { id: 27, name: "Cilantro", cuisine: "Mexican/Fusion", rating: 4.5, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80", tag: "🌮 Mexican", description: "Sylhet's best spot for nachos, tacos, and sizzling fajitas.", phone: "+8801711667766" },
  { id: 28, name: "The Grameen", cuisine: "Bengali", rating: 4.2, time: "18m", distance: "4.9 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🍚 Traditional", description: "Authentic village-style Bengali food in the city center.", phone: "+8801711667777" },
  { id: 29, name: "Royal Dine", cuisine: "Indian Mughlai", rating: 4.4, time: "22m", distance: "5.3 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "👑 Royal", description: "Grand interior and premium Indian dishes.", phone: "+8801711667788" },
  { id: 30, name: "Pasta Club", cuisine: "Italian", rating: 4.3, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80", tag: "🍝 Pasta", description: "Wide range of cheesy pastas and Italian appetizers.", phone: "+8801711667799" },
  { id: 31, name: "Steak House Sylhet", cuisine: "Steaks", rating: 4.4, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80", tag: "🥩 Steak", description: "Premium cuts of beef and sizzlers cooked to perfection.", phone: "+8801711778800" },
  { id: 32, name: "Juice Box", cuisine: "Beverages", rating: 4.2, time: "10m", distance: "3.3 km", image: "https://images.unsplash.com/photo-1536599424071-0b215a388ba7?auto=format&fit=crop&q=80", tag: "🥤 Fresh", description: "Fresh fruit juices and healthy smoothies near Ambarkhana.", phone: "+8801711778811" },
  { id: 33, name: "Hot Spot", cuisine: "Fast Food", rating: 4.0, time: "3m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🍔 Quick Bite", description: "Closest quick snack spot near Kumar Gaon Bus Stand.", phone: "+8801711778822" },
  { id: 34, name: "Sylhet Coffee House", cuisine: "Cafe", rating: 4.5, time: "18m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80", tag: "☕ Classic Coffee", description: "The oldest coffee house in the city with great heritage.", phone: "+8801711778833" },
  { id: 35, name: "Dine Out", cuisine: "Continental", rating: 4.2, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80", tag: "🍽️ Elegant", description: "Great service and balanced continental flavors.", phone: "+8801711778844" },
  { id: 36, name: "Spicy Seafood", cuisine: "Seafood", rating: 4.1, time: "22m", distance: "5.2 km", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80", tag: "🐟 Seafood", description: "Fresh river fish and sea fish cooked in local spices.", phone: "+8801711778855" },
  { id: 37, name: "The Green Garden", cuisine: "Bengali/Continental", rating: 4.6, time: "30m", distance: "7.0 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🌿 Garden", description: "Dine amidst lush greenery near the airport road.", phone: "+8801711778866" },
  { id: 38, name: "Crispy Fried", cuisine: "Fast Food", rating: 4.0, time: "4m", distance: "1.0 km", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80", tag: "🍗 Student Choice", description: "Budget friendly fried chicken popular with SUST students.", phone: "+8801711778877" },
  { id: 39, name: "Sweet Home", cuisine: "Desserts", rating: 4.3, time: "10m", distance: "3.2 km", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80", tag: "🍩 Donuts", description: "Best donuts and eclairs in the Ambarkhana region.", phone: "+8801711778888" },
  { id: 40, name: "Asian Spice", cuisine: "Pan Asian", rating: 4.4, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80", tag: "🥢 Fusion", description: "Mix of Japanese, Korean, and Thai favorites.", phone: "+8801711778899" },
  { id: 41, name: "Kebab Junction", cuisine: "Grill", rating: 4.1, time: "12m", distance: "3.4 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Quick Kebab", description: "Fast service kebabs and parathas in Ambarkhana.", phone: "+8801711889900" },
  { id: 42, name: "Biryani Express", cuisine: "Biryani", rating: 4.2, time: "10m", distance: "3.3 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🍛 Fast Delivery", description: "Cheap and best Biryani option for quick delivery.", phone: "+8801711889911" },
  { id: 43, name: "Mezbaan Sylhet", cuisine: "Traditional Beef", rating: 4.5, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🐂 Beef Specialist", description: "Famous Chittagong style Mezbaani beef curry in Sylhet.", phone: "+8801711889922" },
  { id: 44, name: "Thai Sensation", cuisine: "Thai", rating: 4.3, time: "20m", distance: "5.1 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍜 Tom Yum", description: "Authentic Thai soups and fried rice options.", phone: "+8801711889933" },
  { id: 45, name: "The Coffee Shop", cuisine: "Cafe", rating: 4.4, time: "4m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80", tag: "☕ SUST Gate", description: "Artisan coffee and freshly baked pastries right at SUST gate.", phone: "+8801711889944" },
  { id: 46, name: "Grill Master", cuisine: "Grilled", rating: 4.2, time: "12m", distance: "3.5 km", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80", tag: "🍗 Peri Peri", description: "Excellent Peri Peri chicken and grilled vegetables.", phone: "+8801711889955" },
  { id: 47, name: "Midnight Kitchen", cuisine: "Fast Food", rating: 4.1, time: "2m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🌙 Late Night", description: "Open until late for midnight cravings near our hotel.", phone: "+8801711889966" },
  { id: 48, name: "Dosa Express", cuisine: "South Indian", rating: 4.0, time: "18m", distance: "4.8 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Vegetarian", description: "Authentic South Indian Dosas and Vadas at Zindabazar.", phone: "+8801711889977" },
  { id: 49, name: "Pasta Garden", cuisine: "Italian", rating: 4.4, time: "20m", distance: "5.0 km", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80", tag: "🌿 Outdoor", description: "Beautiful outdoor seating and great creamy pastas.", phone: "+8801711889988" },
  { id: 50, name: "Shotabdi Kitchen", cuisine: "Bengali & Continental", rating: 5.0, time: "0m", distance: "0 km", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80", tag: "🏨 In-House", description: "Our very own kitchen serving fresh and safe meals directly to your room.", phone: "Dial 101", isRecommended: true }
];

export const NAV_ITEMS = [
  { id: 'overview', path: '/', label: 'Overview', icon: <Home size={20} /> },
  { id: 'offers', path: '/offers', label: 'Exclusive Offers', icon: <Tag size={20} /> },
  { id: 'rooms', path: '/rooms', label: 'Our Rooms', icon: <Bed size={20} /> },
  { id: 'restaurants', path: '/restaurants', label: 'Restaurants', icon: <Utensils size={20} /> },
  { id: 'guide', path: '/guide', label: 'Tourist Guide', icon: <Map size={20} /> },
];

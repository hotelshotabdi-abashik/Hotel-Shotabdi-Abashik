import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Star, Map as MapIcon, ChevronRight, Camera, RefreshCw, Trash2, Plus, Globe, Search, Wand2, CheckSquare, Phone, AlertCircle } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurants: Restaurant[];
  isEditMode?: boolean;
  onUpdate?: (res: Restaurant[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "5m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pansi+Restaurant+Sylhet", phone: "01726-100200" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "6m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pach+Bhai+Restaurant+Sylhet", phone: "01723-556677" },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "8m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Kebab • Biryani", mapUrl: "https://www.google.com/maps/search/?api=1&query=Woondaal+King+Kebab+Sylhet", phone: "01712-889900" },
  { id: 4, name: "Eatopia", cuisine: "International", rating: 4.5, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍕 Pizza • Pasta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Eatopia+Sylhet", phone: "01715-443322" },
  { id: 5, name: "Handi Restaurant", cuisine: "Indian", rating: 4.7, time: "12m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Indian • Curry", mapUrl: "https://www.google.com/maps/search/?api=1&query=Handi+Restaurant+Sylhet", phone: "01721-332211" },
  { id: 6, name: "Platinum Lounge", cuisine: "Continental", rating: 4.4, time: "15m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🥗 Fine Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Platinum+Lounge+Sylhet", phone: "01730-112233" },
  { id: 7, name: "Woodfire Sylhet", cuisine: "Italian", rating: 4.5, time: "8m", distance: "0.7 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80", tag: "🍕 Woodfire Pizza", mapUrl: "https://www.google.com/maps/search/?api=1&query=Woodfire+Sylhet", phone: "01755-667788" },
  { id: 8, name: "The Mad Grill", cuisine: "Fusion", rating: 4.6, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1529193591184-b1d58b34ecdf?auto=format&fit=crop&q=80", tag: "🍔 Juicy Burgers", mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Mad+Grill+Sylhet", phone: "01766-990011" },
  { id: 9, name: "Garden Tower Restaurant", cuisine: "Multi", rating: 4.2, time: "12m", distance: "1.0 km", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80", tag: "🏢 Rooftop View", mapUrl: "https://www.google.com/maps/search/?api=1&query=Garden+Tower+Restaurant+Sylhet", phone: "01711-223344" },
  { id: 10, name: "Burger King Sylhet", cuisine: "Fast Food", rating: 4.3, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80", tag: "🍔 Global Brand", mapUrl: "https://www.google.com/maps/search/?api=1&query=Burger+King+Sylhet", phone: "01788-554433" },
  { id: 11, name: "KFC Sylhet", cuisine: "Fast Food", rating: 4.4, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80", tag: "🍗 Fried Chicken", mapUrl: "https://www.google.com/maps/search/?api=1&query=KFC+Sylhet", phone: "01799-112233" },
  { id: 12, name: "Pizza Hut Sylhet", cuisine: "Fast Food", rating: 4.3, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80", tag: "🍕 Classic Pizza", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pizza+Hut+Sylhet", phone: "01744-887766" },
  { id: 13, name: "Rose View Rooftop", cuisine: "Continental", rating: 4.7, time: "15m", distance: "1.5 km", image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80", tag: "⭐ 5-Star Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rose+View+Hotel+Sylhet", phone: "01730-337435" },
  { id: 14, name: "Exotica Restaurant", cuisine: "Mughlai", rating: 4.4, time: "12m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1544124499-58ec2d354674?auto=format&fit=crop&q=80", tag: "🍖 Rich Flavors", mapUrl: "https://www.google.com/maps/search/?api=1&query=Exotica+Sylhet", phone: "01722-665544" },
  { id: 15, name: "Cafe 16", cuisine: "Cafe", rating: 4.5, time: "5m", distance: "0.4 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "☕ Coffee • Snacks", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+16+Sylhet", phone: "01733-445566" },
  { id: 16, name: "Seven Eleven Restaurant", cuisine: "Bengali", rating: 4.2, time: "7m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80", tag: "🥘 Everyday Meal", mapUrl: "https://www.google.com/maps/search/?api=1&query=Seven+Eleven+Restaurant+Sylhet", phone: "01712-334455" },
  { id: 17, name: "Secret Recipe Sylhet", cuisine: "Cafe", rating: 4.4, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80", tag: "🍰 Cakes • Meals", mapUrl: "https://www.google.com/maps/search/?api=1&query=Secret+Recipe+Sylhet", phone: "01755-998877" },
  { id: 18, name: "Hotel Metro Restaurant", cuisine: "International", rating: 4.3, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🏨 Hotel Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Metro+International+Sylhet", phone: "01713-332211" },
  { id: 19, name: "Silver Chef", cuisine: "Fusion", rating: 4.5, time: "12m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80", tag: "🍳 Modern Twist", mapUrl: "https://www.google.com/maps/search/?api=1&query=Silver+Chef+Sylhet", phone: "01733-112233" },
  { id: 20, name: "Hungry Eyes", cuisine: "Fast Food", rating: 4.1, time: "8m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🌭 Students' Choice", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hungry+Eyes+Sylhet", phone: "01711-887766" },
  { id: 21, name: "Noorjahan Grand Restaurant", cuisine: "Continental", rating: 4.6, time: "15m", distance: "1.8 km", image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&q=80", tag: "✨ Grand Ambience", mapUrl: "https://www.google.com/maps/search/?api=1&query=Noorjahan+Grand+Sylhet", phone: "01730-334455" },
  { id: 22, name: "Grandiose Restaurant", cuisine: "Buffet", rating: 4.5, time: "15m", distance: "1.6 km", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80", tag: "🍽️ Luxury Buffet", mapUrl: "https://www.google.com/maps/search/?api=1&query=Grandiose+Restaurant+Sylhet", phone: "01730-336677" },
  { id: 23, name: "Tasty Treat Sylhet", cuisine: "Bakery", rating: 4.2, time: "5m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80", tag: "🥐 Snacks • Bakery", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tasty+Treat+Sylhet", phone: "01713-998877" },
  { id: 24, name: "Mithai Sylhet", cuisine: "Sweets", rating: 4.4, time: "5m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1589114126522-89366d344837?auto=format&fit=crop&q=80", tag: "🍬 Traditional Sweets", mapUrl: "https://www.google.com/maps/search/?api=1&query=Mithai+Sylhet", phone: "01713-114422" },
  { id: 25, name: "Cafe 360", cuisine: "Cafe", rating: 4.3, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1521017432531-fbd92d744264?auto=format&fit=crop&q=80", tag: "🎸 Young Hub", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+360+Sylhet", phone: "01712-443322" },
  { id: 26, name: "Hot Spot Sylhet", cuisine: "Chinese", rating: 4.1, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80", tag: "🍜 Desi Chinese", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hot+Spot+Sylhet", phone: "01711-332211" },
  { id: 27, name: "Kabab Station", cuisine: "Mughlai", rating: 4.3, time: "8m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1544124499-58ec2d354674?auto=format&fit=crop&q=80", tag: "🍢 Grilled Kababs", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kabab+Station+Sylhet", phone: "01733-442211" },
  { id: 28, name: "Grill & Chill", cuisine: "Steakhouse", rating: 4.4, time: "12m", distance: "1.3 km", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80", tag: "🥩 Sizzling Steaks", mapUrl: "https://www.google.com/maps/search/?api=1&query=Grill+and+Chill+Sylhet", phone: "01744-112233" },
  { id: 29, name: "Royal Dine", cuisine: "Multi", rating: 4.2, time: "15m", distance: "1.4 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "👑 Family Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Royal+Dine+Sylhet", phone: "01755-334455" },
  { id: 30, name: "Tandoori Hub", cuisine: "Indian", rating: 4.3, time: "10m", distance: "0.7 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Clay Oven", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tandoori+Hub+Sylhet", phone: "01766-112244" },
  { id: 31, name: "Cafe Apparels", cuisine: "Cafe", rating: 4.5, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "📸 Aesthetic", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+Apparels+Sylhet", phone: "01713-445577" },
  { id: 32, name: "Aria Restaurant", cuisine: "Chinese", rating: 4.2, time: "12m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80", tag: "🥡 Quality Chinese", mapUrl: "https://www.google.com/maps/search/?api=1&query=Aria+Restaurant+Sylhet", phone: "01733-556677" },
  { id: 33, name: "The Tea Garden Cafe", cuisine: "Bengali", rating: 4.6, time: "15m", distance: "2.5 km", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", tag: "🍃 Nature View", mapUrl: "https://www.google.com/maps/search/?api=1&query=Lakkatura+Tea+Garden+Cafe", phone: "01744-889900" },
  { id: 34, name: "Kacchi Bhai Sylhet", cuisine: "Mughlai", rating: 4.7, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🍚 Best Kacchi", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kacchi+Bhai+Sylhet", phone: "01788-223344" },
  { id: 35, name: "Sultans Dine Sylhet", cuisine: "Mughlai", rating: 4.8, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "👑 Premium Biryani", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sultans+Dine+Sylhet", phone: "01799-334455" },
  { id: 36, name: "BFC Sylhet", cuisine: "Fast Food", rating: 4.1, time: "8m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80", tag: "🍗 Fried Chicken", mapUrl: "https://www.google.com/maps/search/?api=1&query=BFC+Sylhet", phone: "01711-445566" },
  { id: 37, name: "Western Grill", cuisine: "Continental", rating: 4.3, time: "12m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80", tag: "🍔 Burgers • Grills", mapUrl: "https://www.google.com/maps/search/?api=1&query=Western+Grill+Sylhet", phone: "01722-114455" },
  { id: 38, name: "Chicken Hut", cuisine: "Fast Food", rating: 4.0, time: "5m", distance: "0.4 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80", tag: "🍗 Quick Bites", mapUrl: "https://www.google.com/maps/search/?api=1&query=Chicken+Hut+Sylhet", phone: "01712-665544" },
  { id: 39, name: "Food Forest", cuisine: "Multi", rating: 4.2, time: "15m", distance: "1.5 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🌳 Garden Setting", mapUrl: "https://www.google.com/maps/search/?api=1&query=Food+Forest+Sylhet", phone: "01733-887766" },
  { id: 40, name: "Chillox Sylhet", cuisine: "Fast Food", rating: 4.6, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80", tag: "🍔 Famous Burgers", mapUrl: "https://www.google.com/maps/search/?api=1&query=Chillox+Sylhet", phone: "01744-332211" },
  { id: 41, name: "Takeout Sylhet", cuisine: "Fast Food", rating: 4.5, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80", tag: "🍔 Burger Joint", mapUrl: "https://www.google.com/maps/search/?api=1&query=Takeout+Sylhet", phone: "01755-112233" },
  { id: 42, name: "Mr. Burger", cuisine: "Fast Food", rating: 4.1, time: "7m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🍔 Budget Burger", mapUrl: "https://www.google.com/maps/search/?api=1&query=Mr.+Burger+Sylhet", phone: "01711-224466" },
  { id: 43, name: "American Burger", cuisine: "Fast Food", rating: 4.2, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🍔 Authentic Taste", mapUrl: "https://www.google.com/maps/search/?api=1&query=American+Burger+Sylhet", phone: "01722-334455" },
  { id: 44, name: "Cp Five Star", cuisine: "Fast Food", rating: 4.0, time: "5m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80", tag: "🍗 Fried Chicken", mapUrl: "https://www.google.com/maps/search/?api=1&query=CP+Five+Star+Sylhet", phone: "01733-114422" },
  { id: 45, name: "Grill Kingdom", cuisine: "Mughlai", rating: 4.3, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1544124499-58ec2d354674?auto=format&fit=crop&q=80", tag: "🍢 Grilled Items", mapUrl: "https://www.google.com/maps/search/?api=1&query=Grill+Kingdom+Sylhet", phone: "01744-556677" },
  { id: 46, name: "Foodies Sylhet", cuisine: "Multi", rating: 4.2, time: "12m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🍛 Group Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Foodies+Sylhet", phone: "01755-667788" },
  { id: 47, name: "Cafe De Sylhet", cuisine: "Cafe", rating: 4.4, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "☕ Cozy Vibe", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+De+Sylhet", phone: "01766-990011" },
  { id: 48, name: "Subway Sylhet", cuisine: "Fast Food", rating: 4.3, time: "10m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1509722747041-619f39d4033b?auto=format&fit=crop&q=80", tag: "🥖 Healthy Subs", mapUrl: "https://www.google.com/maps/search/?api=1&query=Subway+Sylhet", phone: "01711-223344" },
  { id: 49, name: "Yum Yum Sylhet", cuisine: "Fast Food", rating: 4.1, time: "8m", distance: "0.7 km", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80", tag: "🍔 Quick Meal", mapUrl: "https://www.google.com/maps/search/?api=1&query=Yum+Yum+Sylhet", phone: "01722-665544" },
  { id: 50, name: "Cafe 360", cuisine: "Cafe", rating: 4.4, time: "12m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1521017432531-fbd92d744264?auto=format&fit=crop&q=80", tag: "🎸 Music • Coffee", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+360+Sylhet", phone: "01733-445566" }
];

/**
 * Utility to check string similarity for fuzzy matching recommendations.
 * Simple overlap-based heuristic.
 */
const getStringSimilarity = (str1: string, str2: string) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  let overlap = 0;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  words1.forEach(w1 => {
    words2.forEach(w2 => {
      if (w1.length > 2 && w2.length > 2 && (w1.startsWith(w2.substring(0, 3)) || w2.startsWith(w1.substring(0, 3)))) {
        overlap++;
      }
    });
  });
  
  return overlap / Math.max(words1.length, words2.length);
};

const NearbyRestaurants: React.FC<Props> = ({ restaurants = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleItems, setVisibleItems] = useState(12);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayList = restaurants.length > 0 ? restaurants : DEFAULT_RESTAURANTS;

  // Filtered list based on search
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return displayList;
    return displayList.filter(res => 
      res.name.toLowerCase().includes(q) || 
      res.cuisine.toLowerCase().includes(q) || 
      (res.tag && res.tag.toLowerCase().includes(q))
    );
  }, [displayList, searchQuery]);

  // Fuzzy recommendations if no results found
  const recommendations = useMemo(() => {
    if (filteredList.length > 0 || !searchQuery.trim()) return [];
    return displayList
      .map(res => ({ res, score: getStringSimilarity(res.name, searchQuery) }))
      .filter(item => item.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.res);
  }, [filteredList, displayList, searchQuery]);

  const generateMapUrl = (name: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Sylhet, Bangladesh')}`;
  };

  const handleImageChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setUploadingId(id);
      try {
        const url = await onImageUpload(file);
        const updated = displayList.map(r => r.id === id ? { ...r, image: url } : r);
        onUpdate?.(updated);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const updateRes = (id: number, field: keyof Restaurant, value: any) => {
    const updated = displayList.map(r => r.id === id ? { ...r, [field]: value } : r);
    onUpdate?.(updated);
  };

  const syncMapLink = (id: number) => {
    const res = displayList.find(r => r.id === id);
    if (res && res.name) {
      updateRes(id, 'mapUrl', generateMapUrl(res.name));
    }
  };

  const deleteRes = (id: number) => {
    if (window.confirm("Remove this restaurant from the list?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addRes = () => {
    const newItem: Restaurant = {
      id: Date.now(),
      name: "New Restaurant",
      cuisine: "Cuisine Type",
      rating: 4.5,
      time: "10-15m",
      distance: "0.5 km",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
      tag: "🍴 New Spot",
      mapUrl: "",
      phone: ""
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="restaurants" className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-12 md:pb-20 w-full animate-fade-in">
      <div className="mb-12 text-center flex flex-col items-center">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">Gastronomy</span>
        <h2 className="text-3xl md:text-5xl font-sans text-gray-900 mb-6 font-black tracking-tighter">Nearby Dining</h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed mb-10">
          A curated selection of the finest eateries in Sylhet, all located within a short distance of <span className="text-hotel-primary font-bold">Hotel Shotabdi</span>.
        </p>

        <div className="w-full max-w-2xl mb-12 flex flex-col items-center gap-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search by restaurant name or cuisine (e.g. Biryani, Italian)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 shadow-xl rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:border-blue-600 outline-none transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          </div>

          {recommendations.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle size={12} /> Did you mean?
              </span>
              {recommendations.map(rec => (
                <button 
                  key={rec.id}
                  onClick={() => setSearchQuery(rec.name)}
                  className="px-4 py-1.5 bg-gray-50 hover:bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-50 transition-all active:scale-95"
                >
                  {rec.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isEditMode && (
          <button 
            onClick={addRes}
            className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-100 hover:scale-105 transition-all mb-10"
          >
            <Plus size={18} /> Add New Restaurant
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredList.slice(0, visibleItems).map((res) => (
          <div key={res.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative">
            <div className="h-48 relative overflow-hidden shrink-0">
              <img src={res.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={res.name} />
              <div className="absolute top-4 left-4">
                {isEditMode ? (
                  <input 
                    className="bg-white/95 backdrop-blur shadow-sm px-3 py-1 rounded-xl text-[9px] font-black text-gray-800 outline-none border border-blue-200"
                    value={res.tag}
                    onChange={(e) => updateRes(res.id, 'tag', e.target.value)}
                  />
                ) : (
                  <span className="bg-white/95 backdrop-blur shadow-sm px-3 py-1 rounded-xl text-[9px] font-black text-gray-800">
                    {res.tag}
                  </span>
                )}
              </div>
              
              {isEditMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <label className="cursor-pointer bg-white p-3 rounded-2xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(res.id, e)} />
                      {uploadingId === res.id ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                   </label>
                   <button 
                    onClick={() => deleteRes(res.id)}
                    className="bg-white p-3 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {isEditMode ? (
                    <input 
                      className="text-xl font-black text-gray-900 border-b-2 border-blue-600 outline-none w-full"
                      value={res.name}
                      placeholder="Restaurant Name"
                      onChange={(e) => updateRes(res.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{res.name}</h3>
                  )}
                  {isEditMode ? (
                    <input 
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 w-full outline-none"
                      value={res.cuisine}
                      placeholder="Cuisine Type"
                      onChange={(e) => updateRes(res.id, 'cuisine', e.target.value)}
                    />
                  ) : (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{res.cuisine}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                  <span className="text-xs font-black">{res.rating}</span>
                  <Star size={10} fill="currentColor" />
                </div>
              </div>

              <div className="mb-4">
                {isEditMode ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                    <input 
                      className="w-full bg-gray-50 rounded-xl py-2 pl-8 pr-4 text-[10px] font-bold text-gray-700 outline-none border border-gray-100"
                      value={res.phone || ''}
                      placeholder="Phone Number"
                      onChange={(e) => updateRes(res.id, 'phone', e.target.value)}
                    />
                  </div>
                ) : res.phone && (
                  <a href={`tel:${res.phone}`} className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:underline">
                    <Phone size={12} /> {res.phone}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Travel Time</span>
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-700">
                    <Clock size={12} className="text-blue-600" />
                    {isEditMode ? (
                      <input 
                        className="w-full bg-gray-50 rounded px-1 outline-none border-b border-blue-200"
                        value={res.time}
                        onChange={(e) => updateRes(res.id, 'time', e.target.value)}
                      />
                    ) : res.time}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">From Hotel</span>
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-700">
                    <MapPin size={12} className="text-blue-600" />
                    {isEditMode ? (
                      <input 
                        className="w-full bg-gray-50 rounded px-1 outline-none border-b border-blue-200"
                        value={res.distance}
                        onChange={(e) => updateRes(res.id, 'distance', e.target.value)}
                      />
                    ) : res.distance}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {isEditMode ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Map Sync (Titled)</label>
                       <div className="flex gap-2">
                         <button 
                            onClick={() => syncMapLink(res.id)}
                            className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline group/sync"
                            title="Auto-fill search link for title"
                          >
                            <Wand2 size={10} className="group-hover/sync:rotate-12 transition-transform" /> Magic Sync
                          </button>
                          {res.mapUrl && (
                            <a 
                              href={res.mapUrl} 
                              target="_blank" 
                              className="text-[8px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              <CheckSquare size={10} /> Live Test
                            </a>
                          )}
                       </div>
                    </div>
                    <div className="relative">
                      <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                      <input 
                        className="w-full bg-gray-50 rounded-xl py-3 pl-8 pr-4 text-[10px] font-medium outline-none border border-gray-100 focus:border-blue-600"
                        placeholder="Search link will appear here..."
                        value={res.mapUrl || ''}
                        onChange={(e) => updateRes(res.id, 'mapUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <a 
                    href={res.mapUrl || generateMapUrl(res.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group/map"
                  >
                    <MapIcon size={14} className="group-hover/map:text-white transition-colors" /> View Location
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && searchQuery.trim() !== '' && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No matching eateries found</h3>
            <p className="text-sm text-gray-400 font-medium">Try searching for a different name or cuisine type.</p>
          </div>
        )}
      </div>

      {visibleItems < filteredList.length && (
        <div className="mt-16 text-center">
          <button 
            onClick={() => setVisibleItems(prev => prev + 9)}
            className="group px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-[2rem] hover:border-blue-600 hover:text-blue-600 transition-all shadow-xl shadow-gray-100/50"
          >
            Show More Local Eateries <ChevronRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
};

export default NearbyRestaurants;
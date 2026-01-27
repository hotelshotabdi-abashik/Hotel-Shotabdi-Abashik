import React, { useState } from 'react';
import { MapPin, Clock, Star, Map as MapIcon, ChevronRight } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  distance: string;
  image: string;
  tag: string;
}

const RESTAURANTS_DATA: Restaurant[] = [
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "10-15m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "12-18m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali" },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Indian/BBQ", rating: 4.6, time: "15-20m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🔥 Signature Kebab" },
  { id: 4, name: "Eatopia Restaurant", cuisine: "Multi-Cuisine", rating: 4.5, time: "20-25m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🍕 Global Flavors" },
  { id: 5, name: "Spicy Restaurant", cuisine: "Bengali/Chinese", rating: 4.4, time: "15-22m", distance: "0.4 km", image: "https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80", tag: "🥡 Fusion Hot" },
  { id: 6, name: "Royal Chef", cuisine: "Mughlai", rating: 4.7, time: "25-30m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80", tag: "👑 Shahi Biryani" },
  { id: 7, name: "Simla Restaurant", cuisine: "Bengali", rating: 4.3, time: "10-15m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80", tag: "🍲 Local Vibes" },
  { id: 8, name: "Exotic Restaurant", cuisine: "Fast Food", rating: 4.2, time: "10-12m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80", tag: "🍔 Gourmet Burgers" },
  { id: 9, name: "Handi Restaurant", cuisine: "North Indian", rating: 4.5, time: "20-30m", distance: "1.5 km", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80", tag: "🥘 Clay Pot Delicacy" },
  { id: 10, name: "Khandani Foods", cuisine: "Mughlai", rating: 4.6, time: "15-25m", distance: "0.7 km", image: "https://images.unsplash.com/photo-1545231027-63b3f162d40a?auto=format&fit=crop&q=80", tag: "🍖 Grilled Treats" },
  { id: 11, name: "Dine Out", cuisine: "Cafe", rating: 4.4, time: "12-18m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80", tag: "☕ Cozy Coffee" },
  { id: 12, name: "Green Garden", cuisine: "Vegetarian", rating: 4.5, time: "18-24m", distance: "2.0 km", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80", tag: "🥗 Fresh Greens" },
  { id: 13, name: "Tarka Restaurant", cuisine: "Indian", rating: 4.3, time: "15-20m", distance: "1.1 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🍛 Desi Tadka" },
  { id: 14, name: "Grill Station", cuisine: "Steakhouse", rating: 4.7, time: "30-40m", distance: "2.5 km", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80", tag: "🥩 Prime Steaks" },
  { id: 15, name: "Pasta House", cuisine: "Italian", rating: 4.2, time: "15-20m", distance: "1.8 km", image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80", tag: "🍝 Creamy Pasta" },
  { id: 16, name: "Sylhet Kitchen", cuisine: "Bengali", rating: 4.4, time: "10-15m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1601050638911-c32699179cc3?auto=format&fit=crop&q=80", tag: "🍽️ Home Style" },
  { id: 17, name: "Ocean Blue", cuisine: "Seafood", rating: 4.6, time: "25-35m", distance: "3.2 km", image: "https://images.unsplash.com/photo-1534080564607-ca40df17965f?auto=format&fit=crop&q=80", tag: "🐟 Fresh Catch" },
  { id: 18, name: "Pizza Hut", cuisine: "Fast Food", rating: 4.1, time: "15-20m", distance: "1.0 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80", tag: "🍕 Classic Pizza" },
  { id: 19, name: "Chili's Grill", cuisine: "Tex-Mex", rating: 4.3, time: "20-30m", distance: "2.2 km", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80", tag: "🌯 Spicy Tacos" },
  { id: 20, name: "Food Forest", cuisine: "Organic", rating: 4.5, time: "15-25m", distance: "1.6 km", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80", tag: "🌱 Healthy Bowls" },
  { id: 21, name: "Midnight Diner", cuisine: "Late Night", rating: 4.0, time: "10-15m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1550966841-3ee7adac1668?auto=format&fit=crop&q=80", tag: "🌙 Night Eats" },
  { id: 22, name: "Saffron Spices", cuisine: "Indian", rating: 4.7, time: "25-30m", distance: "1.8 km", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80", tag: "🍚 Aromatic Rice" },
  { id: 23, name: "The Baker's Den", cuisine: "Bakery", rating: 4.5, time: "5-10m", distance: "0.4 km", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80", tag: "🥐 Sweet Pastries" },
  { id: 24, name: "Riverview Cafe", cuisine: "Cafe", rating: 4.4, time: "15-20m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80", tag: "☕ Scenic Views" },
  { id: 25, name: "Hot & Spicy", cuisine: "Chinese", rating: 4.2, time: "12-18m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80", tag: "🌶️ Wok Special" },
  { id: 26, name: "Lemon Grass", cuisine: "Thai", rating: 4.6, time: "20-25m", distance: "1.4 km", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80", tag: "🍲 Tangy Soup" },
  { id: 27, name: "Kebabitlan", cuisine: "Middle Eastern", rating: 4.5, time: "15-20m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80", tag: "🥙 Hummus & Pita" },
  { id: 28, name: "Morning Star", cuisine: "Breakfast", rating: 4.3, time: "8-12m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80", tag: "🍳 Egg Masters" },
  { id: 29, name: "Veggie Delight", cuisine: "Vegetarian", rating: 4.4, time: "15-22m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80", tag: "🥕 Plant Based" },
  { id: 30, name: "Fusion Hub", cuisine: "Modern", rating: 4.6, time: "25-35m", distance: "2.1 km", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80", tag: "🧪 Culinary Arts" }
];

const NearbyRestaurants: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState(8);

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + 8, RESTAURANTS_DATA.length));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="mb-10 text-center">
        <span className="text-hotel-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">Sylheti Gastronomy</span>
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 font-black">Nearby Restaurants</h2>
        <p className="text-gray-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Discover the finest dining spots within minutes of your stay. From local favorites to international cuisines.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
        {RESTAURANTS_DATA.slice(0, visibleItems).map((res) => (
          <div 
            key={res.id} 
            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-all duration-300 h-auto md:h-44 group"
          >
            <div className="w-full md:w-2/5 relative shrink-0 h-32 md:h-full">
              <img 
                src={res.image} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={res.name} 
              />
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur shadow-sm px-2 md:px-2.5 py-1 rounded-md text-[8px] md:text-[10px] font-bold text-gray-800 whitespace-nowrap">
                {res.tag}
              </div>
            </div>

            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-1 md:mb-1.5">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 truncate leading-tight pr-1">
                    {res.name}
                  </h3>
                  <div className="flex items-center gap-0.5 text-green-600 font-bold text-[10px] md:text-xs shrink-0">
                    {res.rating} <Star size={10} fill="currentColor" className="md:w-3 md:h-3" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-1 md:gap-4 mb-3 md:mb-4">
                  <div className="flex items-center gap-1 text-[9px] md:text-[11px] text-gray-400 font-medium">
                    <Clock size={10} className="md:w-3.5 md:h-3.5 text-gray-300" />
                    {res.time}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] md:text-[11px] text-gray-400 font-medium">
                    <MapPin size={10} className="md:w-3.5 md:h-3.5 text-gray-300" />
                    {res.distance}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-hotel-primary text-white flex items-center justify-center gap-1.5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all">
                  <MapIcon size={10} className="md:w-3.5 md:h-3.5" /> Map
                </button>
                <button className="px-3 md:px-4 bg-gray-50 text-gray-400 flex items-center justify-center py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-bold hover:bg-gray-100 hover:text-gray-600 transition-all">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleItems < RESTAURANTS_DATA.length && (
        <div className="mt-12 text-center px-4">
          <button 
            onClick={loadMore}
            className="group w-full max-w-xs md:w-auto px-8 py-3.5 bg-white border border-gray-200 text-hotel-secondary font-black text-[10px] md:text-[11px] uppercase tracking-widest rounded-xl hover:bg-hotel-primary hover:text-white hover:border-hotel-primary transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            Explore More Dining <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
};

export default NearbyRestaurants;
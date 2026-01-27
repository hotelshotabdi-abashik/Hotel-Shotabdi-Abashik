
import React, { useState } from 'react';
import { MapPin, Clock, Star, Map as MapIcon, ChevronRight, Camera, RefreshCw, Trash2, Plus } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurants: Restaurant[];
  isEditMode?: boolean;
  onUpdate?: (res: Restaurant[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "5-10m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "6-12m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali" },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "8-15m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Kebab • Biryani" },
  { id: 4, name: "Eatopia", cuisine: "International", rating: 4.5, time: "10-20m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍕 Pizza • Pasta" },
  { id: 5, name: "Handi Restaurant", cuisine: "Indian", rating: 4.7, time: "12-18m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Indian • Curry" },
  { id: 6, name: "Platinum Lounge", cuisine: "Continental", rating: 4.4, time: "15-25m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🥗 Fine Dining" },
  { id: 7, name: "Panshee Restaurant", cuisine: "Bengali", rating: 4.8, time: "5-10m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1563379091339-03b21ef4a4f8?auto=format&fit=crop&q=80", tag: "🍛 Best Sellers" },
  { id: 8, name: "Rice & Spice", cuisine: "Fusion", rating: 4.3, time: "10-15m", distance: "0.7 km", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80", tag: "🍲 Healthy Bowls" },
  { id: 9, name: "KFC Sylhet", cuisine: "Fast Food", rating: 4.2, time: "8-12m", distance: "0.4 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80", tag: "🍗 Fried Chicken" },
  { id: 10, name: "Cafe 17", cuisine: "Cafe", rating: 4.6, time: "10-15m", distance: "0.9 km", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80", tag: "☕ Coffee • Snacks" },
  { id: 11, name: "Exotica Restaurant", cuisine: "Oriental", rating: 4.5, time: "15-20m", distance: "1.0 km", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80", tag: "🥢 Chinese • Thai" },
  { id: 12, name: "Spicy Grill", cuisine: "Grill", rating: 4.4, time: "12-18m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80", tag: "🔥 BBQ • Steak" },
  { id: 13, name: "Tea Garden Cafe", cuisine: "Snacks", rating: 4.7, time: "20-30m", distance: "2.5 km", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", tag: "🍃 Scenic Views" },
  { id: 14, name: "Bismillah Restora", cuisine: "Local", rating: 4.1, time: "5-8m", distance: "0.1 km", image: "https://images.unsplash.com/photo-1512058560550-42749359a60b?auto=format&fit=crop&q=80", tag: "🏠 Closest Spot" },
  { id: 15, name: "Royal Dine", cuisine: "Buffet", rating: 4.5, time: "15-25m", distance: "1.5 km", image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80", tag: "🤴 Luxury Buffet" }
];

const NearbyRestaurants: React.FC<Props> = ({ restaurants = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleItems, setVisibleItems] = useState(8);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = restaurants.length > 0 ? restaurants : DEFAULT_RESTAURANTS;

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
      tag: "🍴 New Spot"
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="mb-12 text-center flex flex-col items-center">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">Gastronomy</span>
        <h2 className="text-3xl md:text-5xl font-sans text-gray-900 mb-6 font-black tracking-tighter">Nearby Dining</h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed mb-8">
          A curated selection of the finest eateries in Sylhet, all located within a short distance of <span className="text-hotel-primary font-bold">Hotel Shotabdi</span>.
        </p>
        
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
        {displayList.slice(0, visibleItems).map((res) => (
          <div key={res.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative">
            {/* Image Section */}
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

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {isEditMode ? (
                    <input 
                      className="text-xl font-black text-gray-900 border-b-2 border-blue-600 outline-none w-full"
                      value={res.name}
                      onChange={(e) => updateRes(res.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{res.name}</h3>
                  )}
                  {isEditMode ? (
                    <input 
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 w-full outline-none"
                      value={res.cuisine}
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

              {!isEditMode && (
                <button className="mt-6 w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                  <MapIcon size={14} /> View on Map
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {visibleItems < displayList.length && (
        <div className="mt-16 text-center">
          <button 
            onClick={() => setVisibleItems(prev => prev + 6)}
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

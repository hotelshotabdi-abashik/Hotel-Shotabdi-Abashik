
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
  { 
    id: 101, 
    name: "Rutbah Hotel International", 
    cuisine: "Mid-range Hotel", 
    rating: 4.3, 
    time: "12m", 
    distance: "1.5 km", 
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80", 
    tag: "🏢 AC Rooms • Restaurant", 
    description: "An affordable, mid-range hotel with clean AC rooms, a restaurant, and helpful staff.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Rutbah+Hotel+International+Sylhet" 
  },
  { 
    id: 102, 
    name: "SAUDIA RESIDENTIAL HOTEL", 
    cuisine: "Residential Hotel", 
    rating: 4.2, 
    time: "8m", 
    distance: "0.8 km", 
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80", 
    tag: "🧹 Clean • Friendly Staff", 
    description: "Praised for its clean environment, good location, and friendly staff. Some guests noted the absence of on-site food facilities.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=SAUDIA+RESIDENTIAL+HOTEL+Sylhet" 
  },
  { 
    id: 103, 
    name: "Hotel Grand Brother's", 
    cuisine: "Budget Hotel", 
    rating: 3.5, 
    time: "10m", 
    distance: "1.2 km", 
    image: "https://images.unsplash.com/photo-1551882547-ff43c59fe4c2?auto=format&fit=crop&q=80", 
    tag: "💰 Budget Friendly", 
    description: "A budget-friendly option located close to the city center, noted for clean rooms and well-behaved staff.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Grand+Brother's+Sylhet" 
  },
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "5m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pansi+Restaurant+Sylhet", phone: "01726-100200" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "6m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pach+Bhai+Restaurant+Sylhet", phone: "01723-556677" },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "8m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Kebab • Biryani", mapUrl: "https://www.google.com/maps/search/?api=1&query=Woondaal+King+Kebab+Sylhet", phone: "01712-889900" },
  { id: 4, name: "Eatopia", cuisine: "International", rating: 4.5, time: "10m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍕 Pizza • Pasta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Eatopia+Sylhet", phone: "01715-443322" },
  { id: 5, name: "Handi Restaurant", cuisine: "Indian", rating: 4.7, time: "12m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Indian • Curry", mapUrl: "https://www.google.com/maps/search/?api=1&query=Handi+Restaurant+Sylhet", phone: "01721-332211" }
];

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

  const deleteRes = (id: number) => {
    if (window.confirm("Remove this place from the list?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addRes = () => {
    const newItem: Restaurant = {
      id: Date.now(),
      name: "New Spot",
      cuisine: "Category Type",
      rating: 4.5,
      time: "10m",
      distance: "0.5 km",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
      tag: "🍴 New Experience",
      description: "Brief description of the place and what makes it special.",
      mapUrl: "",
      phone: ""
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="restaurants" className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-12 md:pb-20 w-full animate-fade-in">
      <div className="mb-12 text-center flex flex-col items-center">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">Gastronomy & Stays</span>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed mb-10">
          A curated selection of the finest eateries and residential options in Sylhet, all located near <span className="text-hotel-primary font-bold">Hotel Shotabdi</span>.
        </p>

        <div className="w-full max-w-2xl mb-12 flex flex-col items-center gap-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 shadow-xl rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:border-blue-600 outline-none transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          </div>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addRes}
            className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-100 hover:scale-105 transition-all mb-10"
          >
            <Plus size={18} /> Add New Spot
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {filteredList.slice(0, visibleItems).map((res) => (
          <div key={res.id} className="group bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative h-full">
            <div className="h-32 md:h-48 relative overflow-hidden shrink-0">
              <img src={res.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={res.name} />
              <div className="absolute top-2 md:top-4 left-2 md:left-4">
                {isEditMode ? (
                  <input 
                    className="bg-white/95 backdrop-blur shadow-sm px-2 py-1 rounded-lg text-[7px] md:text-[9px] font-black text-gray-800 outline-none border border-blue-200"
                    value={res.tag}
                    onChange={(e) => updateRes(res.id, 'tag', e.target.value)}
                  />
                ) : (
                  <span className="bg-white/95 backdrop-blur shadow-sm px-2 py-1 rounded-lg text-[7px] md:text-[9px] font-black text-gray-800">
                    {res.tag}
                  </span>
                )}
              </div>
              
              {isEditMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 md:gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <label className="cursor-pointer bg-white p-2 md:p-3 rounded-xl md:rounded-2xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(res.id, e)} />
                      {uploadingId === res.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                   </label>
                   <button 
                    onClick={() => deleteRes(res.id)}
                    className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4 gap-1 md:gap-2">
                <div className="flex-1 min-w-0">
                  {isEditMode ? (
                    <input 
                      className="text-sm md:text-xl font-black text-gray-900 border-b border-blue-600 outline-none w-full"
                      value={res.name}
                      placeholder="Name"
                      onChange={(e) => updateRes(res.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-sm md:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{res.name}</h3>
                  )}
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 md:mt-1 truncate">{res.cuisine}</p>
                </div>
                <div className="flex items-center gap-0.5 bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md shrink-0">
                  <span className="text-[10px] md:text-xs font-black">{res.rating}</span>
                  <Star size={8} fill="currentColor" />
                </div>
              </div>

              {(res.description || isEditMode) && (
                <div className="mb-4">
                  {isEditMode ? (
                    <textarea 
                      className="w-full bg-gray-50 rounded-lg p-2 text-[10px] font-medium outline-none border border-gray-100 h-16 resize-none"
                      value={res.description || ''}
                      placeholder="Place description..."
                      onChange={(e) => updateRes(res.id, 'description', e.target.value)}
                    />
                  ) : (
                    <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed line-clamp-2 italic">
                      {res.description}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[9px] md:text-[11px] font-black text-gray-700">
                  <Clock size={10} className="text-blue-600" />
                  <span>{res.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] md:text-[11px] font-black text-gray-700">
                  <MapPin size={10} className="text-blue-600" />
                  <span>{res.distance}</span>
                </div>
              </div>

              <div className="mt-4 md:mt-6">
                <a 
                  href={res.mapUrl || generateMapUrl(res.name)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest py-2 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-1.5 group/map"
                >
                  <MapIcon size={12} className="group-hover/map:text-white transition-colors" /> Location
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleItems < filteredList.length && (
        <div className="mt-12 md:mt-16 text-center">
          <button 
            onClick={() => setVisibleItems(prev => prev + 9)}
            className="group px-6 md:px-10 py-3 md:py-5 bg-white border-2 border-gray-100 text-gray-900 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] rounded-xl md:rounded-[2rem] hover:border-blue-600 hover:text-blue-600 transition-all shadow-xl shadow-gray-100/50"
          >
            Show More <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
};

export default NearbyRestaurants;
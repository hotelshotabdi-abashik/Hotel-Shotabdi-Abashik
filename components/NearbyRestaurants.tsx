
import React, { useState } from 'react';
import { MapPin, Clock, Star, Map as MapIcon, ChevronRight, Camera, RefreshCw, Trash2, Plus, Globe, ExternalLink, Wand2, CheckSquare } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurants: Restaurant[];
  isEditMode?: boolean;
  onUpdate?: (res: Restaurant[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "5-10m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pansi+Restaurant+Sylhet" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "6-12m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pach+Bhai+Restaurant+Sylhet" },
  { id: 3, name: "Woondaal King Kebab", cuisine: "Mughlai", rating: 4.6, time: "8-15m", distance: "0.5 km", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80", tag: "🍢 Kebab • Biryani", mapUrl: "https://www.google.com/maps/search/?api=1&query=Woondaal+King+Kebab+Sylhet" },
  { id: 4, name: "Eatopia", cuisine: "International", rating: 4.5, time: "10-20m", distance: "0.8 km", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80", tag: "🍕 Pizza • Pasta", mapUrl: "https://www.google.com/maps/search/?api=1&query=Eatopia+Sylhet" },
  { id: 5, name: "Handi Restaurant", cuisine: "Indian", rating: 4.7, time: "12-18m", distance: "0.6 km", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", tag: "🥘 Indian • Curry", mapUrl: "https://www.google.com/maps/search/?api=1&query=Handi+Restaurant+Sylhet" },
  { id: 6, name: "Platinum Lounge", cuisine: "Continental", rating: 4.4, time: "15-25m", distance: "1.2 km", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", tag: "🥗 Fine Dining", mapUrl: "https://www.google.com/maps/search/?api=1&query=Platinum+Lounge+Sylhet" }
];

const NearbyRestaurants: React.FC<Props> = ({ restaurants = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleItems, setVisibleItems] = useState(8);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = restaurants.length > 0 ? restaurants : DEFAULT_RESTAURANTS;

  const generateMapUrl = (name: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Sylhet')}`;
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
      mapUrl: ""
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="restaurants" className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
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

              <div className="mt-6">
                {isEditMode ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Map Link (URL)</label>
                       <div className="flex gap-2">
                         <button 
                            onClick={() => syncMapLink(res.id)}
                            className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            title="Generate link based on name"
                          >
                            <Wand2 size={10} /> Sync
                          </button>
                          {res.mapUrl && (
                            <a 
                              href={res.mapUrl} 
                              target="_blank" 
                              className="text-[8px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              <CheckSquare size={10} /> Verify
                            </a>
                          )}
                       </div>
                    </div>
                    <div className="relative">
                      <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                      <input 
                        className="w-full bg-gray-50 rounded-xl py-3 pl-8 pr-4 text-[10px] font-medium outline-none border border-gray-100 focus:border-blue-600"
                        placeholder="https://maps.google.com/..."
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
                    <MapIcon size={14} className="group-hover/map:text-white transition-colors" /> View on Map
                  </a>
                )}
              </div>
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

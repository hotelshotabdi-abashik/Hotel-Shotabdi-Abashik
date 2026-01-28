
import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Star, Map as MapIcon, ChevronRight, Camera, RefreshCw, Trash2, Plus, Globe, Search, Wand2, CheckSquare, Phone, AlertCircle } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurants: Restaurant[];
  isEditMode?: boolean;
  onUpdate?: (res: Restaurant[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const NearbyRestaurants: React.FC<Props> = ({ restaurants = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleItems, setVisibleItems] = useState(12);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // No hardcoded hotel defaults anymore
  const displayList = restaurants;

  // Filtered and sorted list: recommended first
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q 
      ? displayList.filter(res => 
          res.name.toLowerCase().includes(q) || 
          res.cuisine.toLowerCase().includes(q) || 
          (res.tag && res.tag.toLowerCase().includes(q))
        )
      : displayList;
    
    return [...filtered].sort((a, b) => {
      if (a.isRecommended === b.isRecommended) return 0;
      return a.isRecommended ? -1 : 1;
    });
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
      name: "New Restaurant",
      cuisine: "Cuisine Type",
      rating: 4.5,
      time: "10m",
      distance: "0.5 km",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
      tag: "🍴 New Experience",
      description: "Brief description of the place and what makes it special.",
      mapUrl: "",
      phone: "",
      isRecommended: false
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="restaurants" className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-12 md:pb-20 w-full animate-fade-in">
      <div className="mb-12 text-center flex flex-col items-center">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">Gastronomy</span>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed mb-10">
          A curated selection of the finest eateries in Sylhet, ranging from local favorites to international cuisines, all near <span className="text-hotel-primary font-bold">Hotel Shotabdi</span>.
        </p>

        <div className="w-full max-w-2xl mb-12 flex flex-col items-center gap-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search by restaurant name or cuisine..."
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
            <Plus size={18} /> Add New Restaurant
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {filteredList.slice(0, visibleItems).map((res) => (
          <div key={res.id} className="group bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative h-full">
            <div className="h-32 md:h-48 relative overflow-hidden shrink-0">
              <img src={res.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={res.name} />
              
              <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1.5">
                {res.isRecommended && (
                  <span className="bg-amber-400 text-gray-900 px-2 py-1 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 border border-white/50">
                    <Star size={10} fill="currentColor" /> Highly Recommended
                  </span>
                )}
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
                      onClick={() => updateRes(res.id, 'isRecommended', !res.isRecommended)} 
                      className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${res.isRecommended ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-400'}`}
                    >
                      <Star size={14} fill={res.isRecommended ? "currentColor" : "none"} />
                    </button>
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
                      placeholder="Restaurant Name"
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
                      placeholder="Restaurant description..."
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

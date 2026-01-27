
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
  { id: 1, name: "Pansi Restaurant", cuisine: "Bengali", rating: 4.8, time: "10-15m", distance: "0.2 km", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", tag: "🥘 Bengali • Bhorta" },
  { id: 2, name: "Pach Bhai Restaurant", cuisine: "Bengali", rating: 4.7, time: "12-18m", distance: "0.3 km", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80", tag: "🍛 Traditional Thali" }
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
    if (window.confirm("Remove this restaurant?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addRes = () => {
    const newItem: Restaurant = {
      id: Date.now(),
      name: "New Restaurant",
      cuisine: "Cuisine Type",
      rating: 4.5,
      time: "15-20m",
      distance: "1.0 km",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
      tag: "🍴 Cuisine Info"
    };
    onUpdate?.([...displayList, newItem]);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="mb-10 text-center flex flex-col items-center">
        <span className="text-hotel-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">Nearby Dining</span>
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 font-black">Food & Drinks</h2>
        <p className="text-gray-500 text-sm max-w-xl mx-auto font-light leading-relaxed mb-6">
          Great places to eat just minutes away from your room.
        </p>
        {isEditMode && (
          <button onClick={addRes} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
            <Plus size={14} /> Add Place
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
        {displayList.slice(0, visibleItems).map((res) => (
          <div key={res.id} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-all duration-300 h-auto md:h-44 group relative">
            <div className="w-full md:w-2/5 relative shrink-0 h-32 md:h-full overflow-hidden">
              <img src={res.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={res.name} />
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur shadow-sm px-2 md:px-2.5 py-1 rounded-md text-[8px] md:text-[10px] font-bold text-gray-800">
                {isEditMode ? (
                  <input className="bg-transparent border-none outline-none w-20" value={res.tag} onChange={(e) => updateRes(res.id, 'tag', e.target.value)} />
                ) : res.tag}
              </div>
              {isEditMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <label className="cursor-pointer bg-white p-2 rounded-full text-hotel-primary">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(res.id, e)} />
                      {uploadingId === res.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                   </label>
                   <button onClick={() => deleteRes(res.id)} className="bg-white p-2 rounded-full text-hotel-primary hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  {isEditMode ? (
                    <input className="text-sm md:text-xl font-bold text-gray-900 border-b border-hotel-primary outline-none flex-1" value={res.name} onChange={(e) => updateRes(res.id, 'name', e.target.value)} />
                  ) : (
                    <h3 className="text-sm md:text-xl font-bold text-gray-900 truncate leading-tight pr-1">{res.name}</h3>
                  )}
                  <div className="flex items-center gap-0.5 text-green-600 font-bold text-[10px] md:text-xs">
                    {res.rating} <Star size={10} fill="currentColor" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-1 md:gap-4 mb-3">
                  <div className="flex items-center gap-1 text-[9px] md:text-[11px] text-gray-400 font-medium">
                    <Clock size={10} />
                    {isEditMode ? (
                      <input className="bg-transparent border-none outline-none w-12" value={res.time} onChange={(e) => updateRes(res.id, 'time', e.target.value)} />
                    ) : res.time}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] md:text-[11px] text-gray-400 font-medium">
                    <MapPin size={10} />
                    {isEditMode ? (
                      <input className="bg-transparent border-none outline-none w-12" value={res.distance} onChange={(e) => updateRes(res.id, 'distance', e.target.value)} />
                    ) : res.distance}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-hotel-primary text-white flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-bold">
                  <MapIcon size={12} /> Map
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleItems < displayList.length && (
        <div className="mt-12 text-center">
          <button onClick={() => setVisibleItems(prev => prev + 8)} className="group px-8 py-3.5 bg-white border border-gray-200 text-hotel-secondary font-black text-[10px] md:text-[11px] uppercase tracking-widest rounded-xl hover:bg-hotel-primary hover:text-white transition-all shadow-sm">
            See More Places <ChevronRight size={14} className="inline ml-2" />
          </button>
        </div>
      )}
    </section>
  );
};

export default NearbyRestaurants;

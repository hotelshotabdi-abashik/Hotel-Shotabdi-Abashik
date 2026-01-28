
import React, { useState, useMemo } from 'react';
import { Compass, ArrowRight, MapPin, Search, Camera, RefreshCw, Trash2, Plus, Globe, ExternalLink, Wand2, CheckSquare, Map as MapIcon, Phone, Star } from 'lucide-react';
import { Attraction } from '../types';
import { SYLHET_ATTRACTIONS } from '../constants';

interface Props {
  touristGuides: Attraction[];
  isEditMode?: boolean;
  onUpdate?: (tg: Attraction[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const TouristGuide: React.FC<Props> = ({ touristGuides = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = touristGuides.length > 0 ? touristGuides : SYLHET_ATTRACTIONS;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = displayList.filter(spot => 
      spot.name.toLowerCase().includes(q) ||
      spot.subtitle.toLowerCase().includes(q)
    );
    // Sort: recommended first
    return [...list].sort((a, b) => {
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

  const updateSpot = (id: number, field: keyof Attraction, value: any) => {
    const updated = displayList.map(r => r.id === id ? { ...r, [field]: value } : r);
    onUpdate?.(updated);
  };

  const deleteSpot = (id: number) => {
    if (window.confirm("Delete this attraction permanently?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addSpot = () => {
    const newItem: Attraction = {
      id: Date.now(),
      name: "New Attraction",
      subtitle: "Category",
      distance: "5.0 km",
      description: "A short but engaging description of this local treasure.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
      mapUrl: "",
      phone: "",
      isRecommended: false
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="guide" className="bg-gray-50/50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 mb-4 md:mb-6 shadow-sm">
              <Compass size={24} />
            </div>
            <p className="text-gray-500 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-8 md:mb-10 px-4">
               Explore shrines, nature, and culture. Distances from <span className="text-hotel-primary font-black">Hotel Shotabdi</span>.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl px-4 md:px-0">
              <div className="relative flex-1 w-full">
                  <input 
                      type="text" 
                      placeholder="Search landmarks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-100 shadow-xl rounded-xl md:rounded-[1.5rem] py-3 md:py-5 pl-10 md:pl-14 pr-4 text-xs md:text-sm focus:border-blue-600 outline-none transition-all"
                  />
                  <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
              
              {isEditMode && (
                <button 
                  onClick={addSpot}
                  className="bg-green-600 text-white px-6 md:px-8 py-3 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 md:gap-3 shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all w-full md:w-auto shrink-0"
                >
                  <Plus size={16} /> Add Place
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {filtered.slice(0, visibleCount).map((spot) => (
            <div key={spot.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full relative hover:shadow-2xl transition-all duration-700">
              <div className="relative h-32 md:h-52 overflow-hidden shrink-0">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col items-end gap-1.5">
                   {spot.isRecommended && (
                      <span className="bg-amber-400 text-gray-900 px-2 py-1 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1 border border-white/50">
                        <Star size={10} fill="currentColor" /> Top Destination
                      </span>
                   )}
                   <div className="bg-white/95 backdrop-blur shadow-xl text-blue-600 text-[7px] md:text-[9px] font-black px-2 py-1 rounded-lg md:rounded-xl border border-blue-50">
                    <span className="flex items-center gap-1"><MapPin size={8} /> {spot.distance}</span>
                   </div>
                </div>

                {isEditMode && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer bg-white p-2 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <input type="file" className="hidden" onChange={(e) => handleImageChange(spot.id, e)} />
                        {uploadingId === spot.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                     </label>
                     <button 
                        onClick={() => updateSpot(spot.id, 'isRecommended', !spot.isRecommended)} 
                        className={`p-2 rounded-xl transition-all ${spot.isRecommended ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-400'}`}
                      >
                        <Star size={14} fill={spot.isRecommended ? "currentColor" : "none"} />
                      </button>
                     <button 
                      onClick={() => deleteSpot(spot.id)}
                      className="bg-white p-2 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                )}
              </div>

              <div className="p-3 md:p-6 flex-1 flex flex-col">
                <div className="mb-2 md:mb-4">
                  {isEditMode ? (
                    <input 
                      className="text-sm md:text-lg font-black text-gray-900 border-b border-blue-600 outline-none w-full mb-1"
                      value={spot.name}
                      placeholder="Name"
                      onChange={(e) => updateSpot(spot.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-[12px] md:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{spot.name}</h3>
                  )}
                  <span className="text-[7px] md:text-[9px] font-black text-blue-600 tracking-wider uppercase block mt-0.5">{spot.subtitle}</span>
                </div>

                <div className="mb-2 md:mb-4">
                  {spot.phone && (
                    <a href={`tel:${spot.phone}`} className="flex items-center gap-1 text-[8px] md:text-[10px] font-black text-blue-600 hover:underline">
                      <Phone size={8} /> {spot.phone}
                    </a>
                  )}
                </div>
                
                {isEditMode ? (
                  <textarea 
                    className="text-[9px] md:text-[11px] text-gray-500 bg-gray-50 rounded-lg p-2 h-16 w-full outline-none leading-relaxed font-medium"
                    value={spot.description}
                    onChange={(e) => updateSpot(spot.id, 'description', e.target.value)}
                  />
                ) : (
                  <p className="text-[9px] md:text-[11px] text-gray-500 leading-relaxed mb-3 md:mb-6 flex-grow line-clamp-2 md:line-clamp-3 italic">
                    {spot.description}
                  </p>
                )}

                <div className="mt-auto pt-3 md:pt-6 border-t border-gray-50">
                  <a 
                    href={spot.mapUrl.startsWith('http') ? spot.mapUrl : generateMapUrl(spot.mapUrl || spot.name)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-500 font-black text-[8px] md:text-[10px] uppercase tracking-widest py-2 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-1.5 group/btn"
                  >
                    <MapIcon size={12} className="group-hover/btn:text-white transition-colors" /> Location
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-12 md:mt-20 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 md:px-10 py-3 md:py-5 bg-blue-600 text-white font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-[2rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Load More Places
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TouristGuide;

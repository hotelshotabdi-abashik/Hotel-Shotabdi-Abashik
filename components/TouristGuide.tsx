
import React, { useState } from 'react';
import { Compass, ArrowRight, MapPin, Search, Camera, RefreshCw, Trash2, Plus } from 'lucide-react';
import { Attraction } from '../types';

interface Props {
  touristGuides: Attraction[];
  isEditMode?: boolean;
  onUpdate?: (tg: Attraction[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_ATTRACTIONS: Attraction[] = [
  { id: 1, name: "Keane Bridge", subtitle: "Historic Landmark", distance: "0.8 km", description: "The 'Gateway to Sylhet'. Iconic Surma river views.", image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 2, name: "Shah Jalal Dargah", subtitle: "Spiritual Center", distance: "1.5 km", description: "Sacred spiritual site housing the tomb of Hazrat Shah Jalal.", image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80", mapUrl: "#" }
];

const TouristGuide: React.FC<Props> = ({ touristGuides = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = touristGuides.length > 0 ? touristGuides : DEFAULT_ATTRACTIONS;

  const filtered = displayList.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (window.confirm("Remove this attraction?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addSpot = () => {
    const newItem: Attraction = {
      id: Date.now(),
      name: "New Place",
      subtitle: "Category Name",
      distance: "5.0 km",
      description: "Brief description of the place.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
      mapUrl: "#"
    };
    onUpdate?.([...displayList, newItem]);
  };

  return (
    <section className="bg-hotel-accent min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-8 md:pb-10">
        <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-2 bg-hotel-primary/10 rounded-full mb-4">
              <Compass className="text-hotel-primary" size={20} />
            </div>
            <h2 className="text-2xl md:text-5xl font-serif text-gray-900 mb-4 font-black">Local Guide</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light mb-8">
               Explore the best of Sylhet. Tea gardens, sacred sites, and hidden gems.
            </p>
            {isEditMode && (
              <button onClick={addSpot} className="mb-10 bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                <Plus size={18} /> Add Attraction
              </button>
            )}
        </div>

        <div className="max-w-xl mx-auto mb-10 relative">
            <input 
                type="text" 
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-3.5 md:py-4 pl-12 pr-6 text-sm focus:border-hotel-primary outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.slice(0, visibleCount).map((spot) => (
            <div key={spot.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full relative">
              <div className="relative h-44 md:h-48 overflow-hidden">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-3 right-3 bg-white/90 shadow-sm text-hotel-secondary text-[9px] font-black px-2 py-1 rounded-lg">
                  {isEditMode ? (
                    <input className="bg-transparent border-none outline-none w-12" value={spot.distance} onChange={(e) => updateSpot(spot.id, 'distance', e.target.value)} />
                  ) : spot.distance}
                </div>
                {isEditMode && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer bg-white p-2 rounded-full text-hotel-primary">
                        <input type="file" className="hidden" onChange={(e) => handleImageChange(spot.id, e)} />
                        {uploadingId === spot.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                     </label>
                     <button onClick={() => deleteSpot(spot.id)} className="bg-white p-2 rounded-full text-hotel-primary hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="mb-2">
                  {isEditMode ? (
                    <input className="text-base font-bold text-gray-900 border-b border-hotel-primary outline-none w-full" value={spot.name} onChange={(e) => updateSpot(spot.id, 'name', e.target.value)} />
                  ) : (
                    <h3 className="text-base font-bold text-gray-900">{spot.name}</h3>
                  )}
                  {isEditMode ? (
                    <input className="text-[9px] font-black text-hotel-primary uppercase tracking-widest mt-1 w-full bg-gray-50 rounded" value={spot.subtitle} onChange={(e) => updateSpot(spot.id, 'subtitle', e.target.value)} />
                  ) : (
                    <span className="text-[9px] font-black text-hotel-primary tracking-widest uppercase block mt-1">{spot.subtitle}</span>
                  )}
                </div>
                
                {isEditMode ? (
                  <textarea className="text-[10px] text-gray-400 bg-gray-50 rounded p-1 h-16 w-full outline-none mt-2" value={spot.description} onChange={(e) => updateSpot(spot.id, 'description', e.target.value)} />
                ) : (
                  <p className="text-[10px] text-gray-400 leading-relaxed mb-6 flex-grow">{spot.description}</p>
                )}

                {!isEditMode && (
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <a href={spot.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-hotel-secondary font-black text-[9px] uppercase hover:text-hotel-primary">
                      Directions <ArrowRight size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-12 text-center">
            <button onClick={() => setVisibleCount(prev => prev + 8)} className="px-8 py-3.5 bg-hotel-secondary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-hotel-primary transition-all">
              See More Attractions
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TouristGuide;

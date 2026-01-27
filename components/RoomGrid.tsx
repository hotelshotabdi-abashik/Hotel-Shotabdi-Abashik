
import React, { useState } from 'react';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, Star, ShieldCheck, Sparkles, BedDouble } from 'lucide-react';
import { Room } from '../types';

interface RoomGridProps {
  rooms: Room[];
  isEditMode?: boolean;
  onUpdate?: (rooms: Room[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, isEditMode, onUpdate, onImageUpload }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const calculateDiscount = (price: string) => {
    const numericPrice = parseInt(price.replace(/,/g, ''), 10);
    if (isNaN(numericPrice)) return { original: price, discounted: price };
    const discountedValue = Math.round(numericPrice * 0.75);
    return {
      original: numericPrice.toLocaleString(),
      discounted: discountedValue.toLocaleString()
    };
  };

  const handleImageChange = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setUploadingId(roomId);
      try {
        const url = await onImageUpload(file);
        const updated = rooms.map(r => r.id === roomId ? { ...r, image: url } : r);
        onUpdate?.(updated);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const updateRoom = (id: string, field: keyof Room, value: any) => {
    const updated = rooms.map(r => r.id === id ? { ...r, [field]: value } : r);
    onUpdate?.(updated);
  };

  const deleteRoom = (id: string) => {
    if (window.confirm("Delete this room category?")) {
      onUpdate?.(rooms.filter(r => r.id !== id));
    }
  };

  const addNewRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      title: "New Room Type",
      price: "1,500",
      tag: "NEW",
      desc: "Clean and comfortable room for your stay.",
      features: ["Wi-Fi", "AC", "TV"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      capacity: 2
    };
    onUpdate?.([...rooms, newRoom]);
  };

  return (
    <section id="rooms" className="max-w-7xl mx-auto pt-16 md:pt-24 pb-24 px-4 md:px-6 bg-white w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotel-primary/10 text-hotel-primary text-[9px] font-black uppercase tracking-[0.3em] mb-4">
            <Sparkles size={12} fill="currentColor" /> Limited Availability
          </div>
          <h2 className="text-3xl md:text-6xl font-sans text-gray-900 mb-4 font-black tracking-tighter">
            Curated Stays
          </h2>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-light">
            Luxury defined by comfort. Enjoy a <span className="text-hotel-primary font-bold">25% discount</span> on all selections.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-hotel-primary transition-all active:scale-95 shadow-xl"
          >
            <Plus size={16} /> New Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {rooms.map((room) => {
          const pricing = calculateDiscount(room.price);
          return (
            <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 group transition-all duration-500 flex flex-col h-full relative hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
              
              {/* Image Section - Shorter & More Modern */}
              <div className="h-56 relative overflow-hidden shrink-0">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                  alt={room.title} 
                />
                
                {/* Modern Overlaid Pricing */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="glass-badge px-3 py-2 rounded-xl border border-white/20 flex flex-col backdrop-blur-md">
                    <span className="text-[8px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">From</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-white">৳{pricing.discounted}</span>
                      <span className="text-[10px] font-bold text-white/50 line-through">৳{pricing.original}</span>
                    </div>
                  </div>
                </div>

                {/* 25% OFF Integrated Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-hotel-primary text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Zap size={10} fill="currentColor" /> 25% OFF
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[8px] font-black text-gray-800 uppercase tracking-widest border border-white/20 flex items-center gap-1.5">
                    <Users size={10} /> {room.capacity} Guests
                  </div>
                </div>

                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 gap-3">
                    <label className="cursor-pointer bg-white p-3 rounded-xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={18} className="animate-spin" /> : <Camera size={18} />}
                    </label>
                    <button 
                      onClick={() => deleteRoom(room.id)}
                      className="bg-white p-3 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  {isEditMode ? (
                    <input 
                      className="text-lg font-sans text-gray-900 font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1 mb-1"
                      value={room.title}
                      onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-lg font-sans text-gray-900 font-black leading-tight group-hover:text-hotel-primary transition-colors mb-1">
                      {room.title}
                    </h3>
                  )}
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{room.tag}</p>
                </div>

                {/* Shorter Features Layout */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 opacity-70">
                   {room.features.map((feat, idx) => (
                     <React.Fragment key={idx}>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                          {feat}
                       </span>
                       {idx < room.features.length - 1 && <span className="w-1 h-1 bg-gray-200 rounded-full"></span>}
                     </React.Fragment>
                   ))}
                </div>

                {isEditMode ? (
                  <textarea 
                    className="text-[11px] text-gray-400 mb-6 w-full bg-gray-50 outline-none p-4 rounded-xl h-20 border border-gray-100 font-medium"
                    value={room.desc}
                    onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                  />
                ) : (
                  <p className="text-[11px] text-gray-400 mb-6 leading-relaxed line-clamp-2 font-medium">
                    {room.desc}
                  </p>
                )}

                <div className="mt-auto">
                  <button className="w-full group/btn flex items-center justify-between py-4 px-6 bg-gray-50 hover:bg-hotel-primary rounded-2xl transition-all duration-300">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover/btn:text-white transition-colors">Book Stay</span>
                    <ChevronRight size={16} className="text-hotel-primary group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoomGrid;

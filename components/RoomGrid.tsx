import React, { useState } from 'react';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, Star, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-hotel-primary/5 text-hotel-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={12} fill="currentColor" /> Live Deals
          </div>
          <h2 className="text-4xl md:text-6xl font-sans text-gray-900 mb-4 font-black tracking-tighter">
            Our Rooms
          </h2>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-light">
            Luxury spaces designed for comfort. Reserve today and enjoy an automatic <span className="text-hotel-primary font-bold">25% discount</span>.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-hotel-primary transition-all active:scale-95 shadow-xl"
          >
            <Plus size={18} /> Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {rooms.map((room) => {
          const pricing = calculateDiscount(room.price);
          return (
            <div key={room.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 group transition-all duration-500 flex flex-col h-full relative shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)]">
              
              {/* Image Header */}
              <div className="h-64 relative overflow-hidden shrink-0">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" 
                  alt={room.title} 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Status Tag */}
                <div className="absolute top-5 left-6 z-10">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                    {room.tag}
                  </span>
                </div>

                {/* Overlaid Price (Screenshot Style) */}
                <div className="absolute bottom-6 left-6 z-10 text-white">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Starting From</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-black tracking-tighter">৳{pricing.discounted}</span>
                    <span className="text-[11px] font-bold opacity-70">/night</span>
                  </div>
                </div>

                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 gap-3">
                    <label className="cursor-pointer bg-white p-3 rounded-2xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={18} className="animate-spin" /> : <Camera size={18} />}
                    </label>
                    <button 
                      onClick={() => deleteRoom(room.id)}
                      className="bg-white p-3 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  {isEditMode ? (
                    <input 
                      className="text-xl font-sans text-hotel-primary font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1 mb-2"
                      value={room.title}
                      onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-xl md:text-2xl font-sans text-hotel-primary font-black leading-tight mb-2">
                      {room.title}
                    </h3>
                  )}
                  
                  {/* Pricing Line with 25% Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-300 line-through">৳{pricing.original}</span>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                      Save 25%
                    </span>
                  </div>
                </div>

                {isEditMode ? (
                  <textarea 
                    className="text-[12px] text-gray-500 mb-8 w-full bg-gray-50 outline-none p-4 rounded-2xl h-24 border border-gray-100 font-medium leading-relaxed"
                    value={room.desc}
                    onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                  />
                ) : (
                  <p className="text-[12px] text-gray-500 mb-8 leading-relaxed font-light line-clamp-2">
                    {room.desc}
                  </p>
                )}

                {/* Features Section */}
                <div className="mb-10">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Room Features</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {room.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <CheckCircle2 size={14} className="text-hotel-primary shrink-0" />
                        <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <div className="mt-auto">
                  <button className="w-full bg-[#9B1C1C] hover:bg-hotel-primary text-white py-6 rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.25em] shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group/btn">
                    Book Now <ChevronRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform" />
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
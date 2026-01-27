
import React, { useState } from 'react';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, Star, ShieldCheck, Waves } from 'lucide-react';
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
    const discounted = Math.round(numericPrice * 0.75);
    return {
      original: numericPrice.toLocaleString(),
      discounted: discounted.toLocaleString()
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
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-hotel-primary text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-red-100 animate-pulse">
            <Zap size={14} fill="currentColor" /> Limited Season Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-sans text-gray-900 mb-6 leading-tight font-black tracking-tighter">
            Our Luxury Rooms
          </h2>
          <p className="text-gray-500 text-base md:text-xl leading-relaxed font-light max-w-xl">
            Experience unparalleled comfort in Sylhet. Enjoy a <span className="text-hotel-primary font-black">flat 25% discount</span> on all bookings this month.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-green-100 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} /> Add New Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {rooms.map((room) => {
          const pricing = calculateDiscount(room.price);
          return (
            <div key={room.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 flex flex-col h-full relative">
              
              {/* Image & Badges Container */}
              <div className="h-64 md:h-72 relative overflow-hidden shrink-0">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                  alt={room.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Promo Badge */}
                <div className="absolute top-5 right-5 z-10">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/20">
                    <Star size={12} fill="currentColor" /> 25% OFF
                  </div>
                </div>

                {/* Tag Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="bg-white/90 backdrop-blur-md shadow-xl px-4 py-2 rounded-2xl text-[9px] font-black text-gray-900 tracking-widest uppercase border border-white/50">
                    {room.tag}
                  </span>
                </div>

                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <label className="cursor-pointer bg-white p-4 rounded-3xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={24} className="animate-spin" /> : <Camera size={24} />}
                    </label>
                    <button 
                      onClick={() => deleteRoom(room.id)}
                      className="ml-4 bg-white p-4 rounded-3xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Content Container */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 overflow-hidden pr-4">
                    {isEditMode ? (
                      <input 
                        className="text-xl md:text-2xl font-sans text-gray-900 font-black w-full bg-gray-50 border-b-2 border-hotel-primary outline-none py-1"
                        value={room.title}
                        onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                      />
                    ) : (
                      <h3 className="text-xl md:text-2xl font-sans text-gray-900 font-black leading-tight group-hover:text-hotel-primary transition-colors truncate">
                        {room.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                        <Users size={12} className="text-hotel-primary" /> {room.capacity} Guests
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                   {room.features.slice(0, 3).map((feat, idx) => (
                     <span key={idx} className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        {feat}
                     </span>
                   ))}
                </div>

                {isEditMode ? (
                  <textarea 
                    className="text-[12px] text-gray-500 mb-8 w-full bg-gray-50 outline-none p-4 rounded-[1.5rem] h-24 border border-gray-100"
                    value={room.desc}
                    onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                  />
                ) : (
                  <p className="text-[12px] text-gray-500 mb-8 leading-relaxed line-clamp-2 italic font-light">
                    "{room.desc}"
                  </p>
                )}

                {/* Pricing & CTA */}
                <div className="mt-auto space-y-6">
                  <div className="flex items-baseline gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-hotel-primary">৳{pricing.discounted}</span>
                      <span className="text-[10px] font-bold text-hotel-primary/60 uppercase">/Night</span>
                    </div>
                    <span className="text-sm font-bold text-gray-300 line-through">৳{pricing.original}</span>
                    {isEditMode && (
                      <input 
                        className="w-16 text-[10px] border-b border-gray-200 outline-none ml-auto"
                        value={room.price}
                        placeholder="Base"
                        onChange={(e) => updateRoom(room.id, 'price', e.target.value)}
                      />
                    )}
                  </div>

                  <button className="w-full bg-hotel-primary text-white py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_15px_30px_rgba(229,57,53,0.2)] hover:bg-hotel-secondary hover:shadow-[0_20px_40px_rgba(229,57,53,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 group/btn overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    Reserve Your Stay <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 opacity-40">
                    <ShieldCheck size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Instant Confirmation</span>
                  </div>
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

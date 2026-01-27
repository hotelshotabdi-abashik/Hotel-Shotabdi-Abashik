import React, { useState } from 'react';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, Star, ShieldCheck, Sparkles } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 md:mb-20 gap-8">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-hotel-primary/5 text-hotel-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={12} fill="currentColor" /> Seasonal Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4 font-black tracking-tight">
            Our Rooms
          </h2>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-light max-w-lg mx-auto md:mx-0">
            A selection of refined spaces designed for the discerning traveler. 
            Enjoy <span className="text-hotel-primary font-bold">25% off</span> this month.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-hotel-primary transition-all active:scale-95 shadow-xl shadow-gray-200"
          >
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {rooms.map((room) => {
          const pricing = calculateDiscount(room.price);
          return (
            <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 group transition-all duration-700 flex flex-col h-full relative hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2">
              
              {/* Image Section */}
              <div className="h-60 relative overflow-hidden shrink-0">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                  alt={room.title} 
                />
                
                {/* Modern Price Overlay */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Nightly</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-gray-900">৳{pricing.discounted}</span>
                      <span className="text-[10px] font-bold text-gray-300 line-through">৳{pricing.original}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-hotel-primary text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Sparkles size={10} fill="currentColor" /> 25% OFF
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-black text-gray-800 uppercase tracking-widest border border-white/40 flex items-center gap-1.5">
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
              
              <div className="p-7 md:p-8 flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    {isEditMode ? (
                      <input 
                        className="text-xl font-serif text-gray-900 font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1"
                        value={room.title}
                        onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                      />
                    ) : (
                      <h3 className="text-xl md:text-2xl font-serif text-gray-900 font-black leading-tight group-hover:text-hotel-primary transition-colors">
                        {room.title}
                      </h3>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">{room.tag}</span>
                </div>

                {/* Elegant Dot-Separated Features */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-6">
                   {room.features.map((feat, idx) => (
                     <React.Fragment key={idx}>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{feat}</span>
                       {idx < room.features.length - 1 && <span className="w-1 h-1 bg-gray-200 rounded-full"></span>}
                     </React.Fragment>
                   ))}
                </div>

                {isEditMode ? (
                  <textarea 
                    className="text-[11px] text-gray-400 mb-8 w-full bg-gray-50 outline-none p-4 rounded-xl h-24 border border-gray-100 font-medium leading-relaxed"
                    value={room.desc}
                    onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                  />
                ) : (
                  <p className="text-[11px] text-gray-400 mb-8 leading-relaxed line-clamp-2 font-medium">
                    {room.desc}
                  </p>
                )}

                <div className="mt-auto">
                  <button className="w-full group/btn flex items-center justify-center gap-3 py-4.5 bg-gray-50 hover:bg-hotel-primary rounded-2xl transition-all duration-300 border border-gray-100 hover:border-hotel-primary">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 group-hover/btn:text-white transition-colors">Select Room</span>
                    <ChevronRight size={14} className="text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                  </button>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 opacity-20">
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
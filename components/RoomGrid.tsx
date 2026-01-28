
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Tag, Sparkles, ShieldAlert } from 'lucide-react';
import { Room } from '../types';

interface RoomGridProps {
  rooms: Room[];
  activeDiscount?: number;
  isBookingDisabled?: boolean;
  isEditMode?: boolean;
  onBook?: (room: Room) => void;
  onUpdate?: (rooms: Room[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const RoomDescription: React.FC<{ text: string }> = ({ text = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 45; // Reduced limit for even shorter cards
  const safeText = text || "";
  const isLong = safeText.length > limit;

  return (
    <div className="mb-2 md:mb-4">
      <p className="text-[9px] md:text-[11px] text-gray-500 leading-snug font-light">
        {isExpanded || !isLong ? safeText : `${safeText.substring(0, limit)}...`}
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 text-hotel-primary font-bold hover:underline inline-flex items-center gap-0.5"
          >
            {isExpanded ? 'less' : 'more'}
            {isExpanded ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
          </button>
        )}
      </p>
    </div>
  );
};

const RoomGrid: React.FC<RoomGridProps> = ({ rooms = [], activeDiscount = 0, isBookingDisabled = false, isEditMode, onBook, onUpdate, onImageUpload }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setHighlightedId(category);
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  const parseNumeric = (str: string) => {
    const numeric = parseFloat((str || "").replace(/[^0-9.]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
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
      price: "2000",
      discountPrice: "1500",
      tag: "NEW",
      desc: "Clean and comfortable room for your stay.",
      features: ["Wi-Fi", "AC", "TV"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      capacity: 2
    };
    onUpdate?.([...rooms, newRoom]);
  };

  return (
    <section id="rooms" className="max-w-7xl mx-auto pt-12 md:pt-20 pb-20 md:pb-28 px-4 md:px-6 bg-white w-full scroll-mt-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6 md:gap-8">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-1.5 rounded-full bg-hotel-primary/5 text-hotel-primary text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            <Zap size={10} fill="currentColor" /> Premier Collection
          </div>
          <h2 className="text-3xl md:text-6xl font-sans text-gray-900 mb-3 md:mb-5 font-black tracking-tighter leading-tight">
            Our Luxury Suites
          </h2>
          <p className="text-gray-400 text-xs md:text-lg leading-relaxed font-light px-4 md:px-0">
            Compact luxury designed for <span className="text-hotel-primary font-black underline decoration-1 underline-offset-4">pure comfort</span>.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-hotel-primary transition-all active:scale-95 shadow-lg mx-auto md:mx-0"
          >
            <Plus size={16} /> Add Unit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {rooms.map((room) => {
          const isHighlighted = highlightedId === room.id;
          const numericBase = parseNumeric(room.price);
          const numericDiscounted = parseNumeric(room.discountPrice);
          const calculatedPercent = numericBase > 0 ? Math.round(((numericBase - numericDiscounted) / numericBase) * 100) : 0;

          return (
            <div 
              id={room.id}
              key={room.id} 
              className={`bg-white rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border transition-all duration-700 flex flex-col h-full relative shadow-[0_5px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${
                isHighlighted ? 'border-hotel-primary ring-4 md:ring-8 ring-hotel-primary/5 scale-[1.02] md:scale-[1.03]' : 'border-gray-100'
              }`}
            >
              <div className="h-28 md:h-52 relative overflow-hidden shrink-0">
                <img src={room.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={room.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1">
                  {isEditMode ? (
                    <input className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[6px] md:text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm outline-none border border-hotel-primary/20" value={room.tag || ""} onChange={(e) => updateRoom(room.id, 'tag', e.target.value)} />
                  ) : (
                    <span className="bg-white/95 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[6px] md:text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{room.tag}</span>
                  )}
                  {activeDiscount > 25 && (
                    <span className="bg-[#B22222] text-white px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 animate-bounce">
                      <Sparkles size={7} /> VIP
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 gap-2">
                    <label className="cursor-pointer bg-white p-2 rounded-lg text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={12} className="animate-spin" /> : <Camera size={12} />}
                    </label>
                    <button onClick={() => deleteRoom(room.id)} className="bg-white p-2 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"><Trash2 size={12} /></button>
                  </div>
                )}
              </div>
              
              <div className="p-3 md:p-5 flex flex-col flex-1">
                <div className="mb-2 md:mb-4">
                  {isEditMode ? (
                    <input className="text-xs md:text-lg font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1 mb-1" value={room.title || ""} placeholder="Name" onChange={(e) => updateRoom(room.id, 'title', e.target.value)} />
                  ) : (
                    <div className="flex flex-col gap-0.5 mb-1 md:mb-2">
                      <h3 className="text-[12px] md:text-xl font-black text-gray-900 leading-tight truncate">{room.title}</h3>
                      {calculatedPercent > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="bg-red-600 text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-[0.1em]">{calculatedPercent}% OFF</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-baseline gap-1 md:gap-2">
                    {isEditMode ? (
                      <div className="space-y-1 w-full">
                        <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-0.5 rounded-md">
                           <span className="text-[8px] font-bold text-gray-400">৳</span>
                           <input className="text-[9px] font-bold text-gray-600 bg-transparent outline-none w-full" value={room.discountPrice || ""} placeholder="Price" onChange={(e) => updateRoom(room.id, 'discountPrice', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-[9px] md:text-[11px] font-bold text-gray-300 line-through">৳{room.price}</span>
                        <div className="flex items-baseline gap-0.5">
                           <span className="text-lg md:text-3xl font-serif font-black text-gray-900 tracking-tight">৳{room.discountPrice}</span>
                           <span className="text-[7px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">/ nt</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditMode ? (
                  <textarea className="text-[9px] md:text-[11px] text-gray-500 mb-2 w-full bg-gray-50 outline-none p-2 rounded-lg h-16 border border-gray-100 font-medium leading-relaxed resize-none" value={room.desc || ""} placeholder="Desc..." onChange={(e) => updateRoom(room.id, 'desc', e.target.value)} />
                ) : (
                  <RoomDescription text={room.desc} />
                )}

                <div className="mb-3 md:mb-5 hidden md:block">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-3 px-1">Highlights</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                    {(room.features || []).slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-hotel-primary shrink-0 opacity-80" />
                        <span className="text-[9px] font-bold text-gray-600 truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    disabled={isBookingDisabled && !isEditMode}
                    onClick={() => onBook?.(room)}
                    className={`w-full py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] group/btn ${
                      isBookingDisabled && !isEditMode 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#9B1C1C] hover:bg-[#B22222] text-white'
                    }`}
                  >
                    {isBookingDisabled && !isEditMode ? (
                      <><ShieldAlert size={12} /> Pending</>
                    ) : (
                      <>Book Now <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" /></>
                    )}
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

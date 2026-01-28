
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
  const limit = 60; // Reduced limit for 2-column mobile view
  const safeText = text || "";
  const isLong = safeText.length > limit;

  return (
    <div className="mb-4 md:mb-8">
      <p className="text-[10px] md:text-[12px] text-gray-500 leading-relaxed font-light">
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
      desc: "Clean and comfortable room for your stay. Features high-quality bedding and modern amenities for a relaxing experience.",
      features: ["Wi-Fi", "AC", "TV"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      capacity: 2
    };
    onUpdate?.([...rooms, newRoom]);
  };

  return (
    <section id="rooms" className="max-w-7xl mx-auto pt-12 md:pt-24 pb-20 md:pb-32 px-4 md:px-6 bg-white w-full scroll-mt-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6 md:gap-8">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-hotel-primary/5 text-hotel-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 md:mb-6">
            <Zap size={10} fill="currentColor" /> Premier Collection
          </div>
          <h2 className="text-3xl md:text-7xl font-sans text-gray-900 mb-4 md:mb-6 font-black tracking-tighter leading-tight">
            Our Luxury Suites
          </h2>
          <p className="text-gray-400 text-xs md:text-xl leading-relaxed font-light px-4 md:px-0">
            Crafted for pure comfort. Reserve now to enjoy our <span className="text-hotel-primary font-black underline decoration-2 underline-offset-4">handpicked residential rates</span>.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3 hover:bg-hotel-primary transition-all active:scale-95 shadow-2xl mx-auto md:mx-0"
          >
            <Plus size={16} /> Register Unit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        {rooms.map((room) => {
          const isHighlighted = highlightedId === room.id;
          const numericBase = parseNumeric(room.price);
          const numericDiscounted = parseNumeric(room.discountPrice);
          const calculatedPercent = numericBase > 0 ? Math.round(((numericBase - numericDiscounted) / numericBase) * 100) : 0;

          return (
            <div 
              id={room.id}
              key={room.id} 
              className={`bg-white rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border transition-all duration-700 flex flex-col h-full relative shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] ${
                isHighlighted ? 'border-hotel-primary ring-4 md:ring-8 ring-hotel-primary/5 scale-[1.02] md:scale-[1.03]' : 'border-gray-100'
              }`}
            >
              <div className="h-32 md:h-72 relative overflow-hidden shrink-0">
                <img src={room.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={room.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute top-2 md:top-6 left-2 md:left-6 z-10 flex flex-col gap-1 md:gap-2">
                  {isEditMode ? (
                    <input className="bg-white/95 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black text-gray-900 uppercase tracking-widest shadow-sm outline-none border border-hotel-primary/20" value={room.tag || ""} onChange={(e) => updateRoom(room.id, 'tag', e.target.value)} />
                  ) : (
                    <span className="bg-white/95 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{room.tag}</span>
                  )}
                  {activeDiscount > 25 && (
                    <span className="bg-[#B22222] text-white px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-2 animate-bounce">
                      <Sparkles size={8} /> Claimed
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 gap-2 md:gap-3">
                    <label className="cursor-pointer bg-white p-2 md:p-4 rounded-xl md:rounded-3xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                    </label>
                    <button onClick={() => deleteRoom(room.id)} className="bg-white p-2 md:p-4 rounded-xl md:rounded-3xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:p-10 flex flex-col flex-1">
                <div className="mb-4 md:mb-8">
                  {isEditMode ? (
                    <input className="text-sm md:text-2xl font-sans text-hotel-primary font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1 md:py-2 mb-2 md:mb-3" value={room.title || ""} placeholder="Room Name" onChange={(e) => updateRoom(room.id, 'title', e.target.value)} />
                  ) : (
                    <div className="flex flex-col gap-0.5 md:gap-1 mb-2 md:mb-3">
                      <h3 className="text-sm md:text-3xl font-sans text-gray-900 font-black leading-tight">{room.title}</h3>
                      {calculatedPercent > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="bg-red-600 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-full shadow-lg shadow-red-100 uppercase tracking-[0.1em] md:tracking-[0.2em]">{calculatedPercent}% OFF</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-baseline gap-1 md:gap-3">
                    {isEditMode ? (
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1 rounded-lg">
                           <span className="text-[9px] font-bold text-gray-400">৳</span>
                           <input className="text-[10px] font-bold text-gray-600 bg-transparent outline-none py-0.5 w-full" value={room.discountPrice || ""} placeholder="Price" onChange={(e) => updateRoom(room.id, 'discountPrice', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <span className="text-[10px] md:text-sm font-bold text-gray-300 line-through">৳{room.price}</span>
                        <div className="flex items-baseline gap-0.5">
                           <span className="text-lg md:text-3xl font-sans font-normal text-gray-900">৳{room.discountPrice}</span>
                           <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ nt</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditMode ? (
                  <textarea className="text-[10px] md:text-[13px] text-gray-500 mb-4 md:mb-8 w-full bg-gray-50 outline-none p-3 md:p-5 rounded-xl md:rounded-3xl h-20 md:h-32 border border-gray-100 font-medium leading-relaxed resize-none" value={room.desc || ""} placeholder="Description..." onChange={(e) => updateRoom(room.id, 'desc', e.target.value)} />
                ) : (
                  <RoomDescription text={room.desc} />
                )}

                <div className="mb-6 md:mb-10 hidden md:block">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-5 px-1">Exclusive Assets</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    {(room.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-hotel-primary shrink-0 opacity-80" />
                        <span className="text-[11px] font-bold text-gray-600 truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    disabled={isBookingDisabled && !isEditMode}
                    onClick={() => onBook?.(room)}
                    className={`w-full py-3 md:py-7 rounded-xl md:rounded-[2.5rem] font-black text-[9px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl md:shadow-2xl flex items-center justify-center gap-2 md:gap-4 transition-all active:scale-[0.98] group/btn ${
                      isBookingDisabled && !isEditMode 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#9B1C1C] hover:bg-[#B22222] text-white shadow-red-100'
                    }`}
                  >
                    {isBookingDisabled && !isEditMode ? (
                      <><ShieldAlert size={14} /> Reviewing</>
                    ) : (
                      <>Book <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>
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

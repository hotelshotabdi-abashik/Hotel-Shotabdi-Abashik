
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Tag, Sparkles, ShieldAlert, Star } from 'lucide-react';
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
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const safeText = text || "";

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isCurrentlyOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
        setIsOverflowing(isCurrentlyOverflowing);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [safeText]);

  return (
    <div className="mb-3 md:mb-4">
      <div 
        ref={textRef}
        className={`text-[10px] md:text-[11px] text-gray-500 leading-relaxed font-light transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}
      >
        {safeText}
      </div>
      
      {(isOverflowing || isExpanded) && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-hotel-primary font-black text-[9px] uppercase tracking-widest hover:underline inline-flex items-center gap-0.5"
        >
          {isExpanded ? '...less' : '...more'}
        </button>
      )}
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

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.isRecommended === b.isRecommended) return 0;
      return a.isRecommended ? -1 : 1;
    });
  }, [rooms]);

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
      price: "1333",
      discountPrice: "1000", 
      tag: "NEW",
      desc: "Clean and comfortable room for your stay.",
      features: ["Wi-Fi", "AC", "TV"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      capacity: 2,
      isRecommended: false
    };
    onUpdate?.([...rooms, newRoom]);
  };

  return (
    <section id="rooms" className="max-w-7xl mx-auto pt-10 md:pt-20 pb-20 md:pb-28 px-4 md:px-6 bg-white w-full scroll-mt-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotel-primary/5 text-hotel-primary text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-3">
            <Zap size={10} fill="currentColor" /> Premier Units
          </div>
          <p className="text-gray-400 text-xs md:text-lg leading-relaxed font-light px-2 md:px-0">
            Handpicked residential comfort at <span className="text-hotel-primary font-black underline decoration-1 underline-offset-4">exclusive manual rates</span>.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-hotel-primary transition-all active:scale-95 shadow-md mx-auto md:mx-0"
          >
            <Plus size={16} /> Add New Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {sortedRooms.map((room) => {
          const isHighlighted = highlightedId === room.id;

          return (
            <div 
              id={room.id}
              key={room.id} 
              className={`bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border transition-all duration-700 flex flex-col h-full relative shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] ${
                isHighlighted ? 'border-hotel-primary ring-4 md:ring-8 ring-hotel-primary/5 scale-[1.02] md:scale-[1.03]' : 'border-gray-100'
              }`}
            >
              <div className="h-44 md:h-56 relative overflow-hidden shrink-0">
                <img src={room.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={room.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {room.isRecommended && (
                    <span className="bg-amber-400 text-gray-900 px-2.5 py-1 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 border border-white/50">
                      <Star size={10} fill="currentColor" /> Recommended
                    </span>
                  )}
                  <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[7px] md:text-[9px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{room.tag}</span>
                  {activeDiscount > 25 && (
                    <span className="bg-[#B22222] text-white px-2 py-0.5 rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 animate-bounce">
                      <Sparkles size={8} /> VIP
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 gap-3">
                    <label className="cursor-pointer bg-white p-2.5 rounded-xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                    </label>
                    <button 
                      onClick={() => updateRoom(room.id, 'isRecommended', !room.isRecommended)} 
                      className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${room.isRecommended ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-400'}`}
                    >
                      <Star size={14} fill={room.isRecommended ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => deleteRoom(room.id)} className="bg-white p-2.5 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:p-8 flex flex-col flex-1">
                <div className="mb-4">
                   <div className="flex flex-col gap-1 mb-2">
                      <h3 className="text-[13px] md:text-2xl font-black text-gray-900 leading-tight truncate tracking-tight">{room.title}</h3>
                    </div>
                  
                  <div className="flex flex-wrap items-baseline gap-2">
                    {isEditMode ? (
                      <div className="flex flex-col gap-2 w-full">
                         <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-1.5 rounded-xl w-full">
                            <span className="text-[9px] font-bold text-gray-400">Regular ৳</span>
                            <input className="text-[10px] font-bold text-gray-600 bg-transparent outline-none w-full" value={room.price || ""} placeholder="Old Price" onChange={(e) => updateRoom(room.id, 'price', e.target.value)} />
                         </div>
                         <div className="flex items-center gap-1 border-b border-gray-100 bg-red-50 px-3 py-1.5 rounded-xl w-full">
                            <span className="text-[9px] font-bold text-[#B22222]">Special ৳</span>
                            <input className="text-[10px] font-bold text-[#B22222] bg-transparent outline-none w-full" value={room.discountPrice || ""} placeholder="Manual Discount Price" onChange={(e) => updateRoom(room.id, 'discountPrice', e.target.value)} />
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-sm font-bold text-gray-300 line-through">৳{room.price}</span>
                        <div className="flex items-baseline gap-0.5">
                           <span className="text-xl md:text-4xl font-serif font-black text-gray-900 tracking-tight">৳{room.discountPrice}</span>
                           <span className="text-[7px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ nt</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <RoomDescription text={room.desc} />

                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 md:gap-y-3">
                    {(room.features || []).slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 size={10} className="text-hotel-primary shrink-0 opacity-70" />
                        <span className="text-[8px] md:text-[11px] font-bold text-gray-400 truncate tracking-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    disabled={isBookingDisabled && !isEditMode}
                    onClick={() => onBook?.(room)}
                    className={`w-full py-3.5 md:py-6 rounded-[1rem] md:rounded-[2rem] font-black text-[9px] md:text-[13px] uppercase tracking-[0.2em] shadow-md hover:shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      isBookingDisabled && !isEditMode 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#9B1C1C] hover:bg-[#B22222] text-white'
                    }`}
                  >
                    {isBookingDisabled && !isEditMode ? 'Pending' : 'Book Now'}
                    {!isBookingDisabled && <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />}
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

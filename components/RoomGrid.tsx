
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
  const limit = 100;
  const safeText = text || "";
  const isLong = safeText.length > limit;

  return (
    <div className="mb-8">
      <p className="text-[12px] text-gray-500 leading-relaxed font-light">
        {isExpanded || !isLong ? safeText : `${safeText.substring(0, limit)}...`}
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 text-hotel-primary font-bold hover:underline inline-flex items-center gap-0.5"
          >
            {isExpanded ? 'less' : 'more'}
            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
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

  const formatter = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  });

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
    <section id="rooms" className="max-w-7xl mx-auto pt-24 pb-32 px-4 md:px-6 bg-white w-full scroll-mt-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-3xl text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-hotel-primary/5 text-hotel-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6">
            <Zap size={12} fill="currentColor" /> Premier Collection
          </div>
          <h2 className="text-4xl md:text-7xl font-sans text-gray-900 mb-6 font-black tracking-tighter leading-tight">
            Our Luxury Suites
          </h2>
          <p className="text-gray-400 text-sm md:text-xl leading-relaxed font-light">
            Crafted for pure comfort. Reserve now to enjoy our <span className="text-hotel-primary font-black underline decoration-2 underline-offset-4">handpicked residential rates</span>.
          </p>
        </div>
        
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-hotel-primary transition-all active:scale-95 shadow-2xl"
          >
            <Plus size={20} /> Register Unit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {rooms.map((room) => {
          const isHighlighted = highlightedId === room.id;
          const numericBase = parseNumeric(room.price);
          const numericDiscounted = parseNumeric(room.discountPrice);
          const calculatedPercent = numericBase > 0 ? Math.round(((numericBase - numericDiscounted) / numericBase) * 100) : 0;

          return (
            <div 
              id={room.id}
              key={room.id} 
              className={`bg-white rounded-[3rem] overflow-hidden border transition-all duration-700 flex flex-col h-full relative shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] ${
                isHighlighted ? 'border-hotel-primary ring-8 ring-hotel-primary/5 scale-[1.03]' : 'border-gray-100'
              }`}
            >
              <div className="h-72 relative overflow-hidden shrink-0">
                <img src={room.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={room.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                  {isEditMode ? (
                    <input className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-gray-900 uppercase tracking-widest shadow-sm outline-none border border-hotel-primary/20" value={room.tag || ""} onChange={(e) => updateRoom(room.id, 'tag', e.target.value)} />
                  ) : (
                    <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-gray-900 uppercase tracking-widest shadow-sm">{room.tag}</span>
                  )}
                  {activeDiscount > 25 && (
                    <span className="bg-[#B22222] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce">
                      <Sparkles size={10} /> Exclusive Claim
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 gap-3">
                    <label className="cursor-pointer bg-white p-4 rounded-3xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all transform hover:scale-110">
                      <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                      {uploadingId === room.id ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                    </label>
                    <button onClick={() => deleteRoom(room.id)} className="bg-white p-4 rounded-3xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"><Trash2 size={20} /></button>
                  </div>
                )}
              </div>
              
              <div className="p-10 flex flex-col flex-1">
                <div className="mb-8">
                  {isEditMode ? (
                    <input className="text-2xl font-sans text-hotel-primary font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-2 mb-3" value={room.title || ""} placeholder="Room Category Name" onChange={(e) => updateRoom(room.id, 'title', e.target.value)} />
                  ) : (
                    <div className="flex flex-col gap-1 mb-3">
                      <h3 className="text-2xl md:text-3xl font-sans text-gray-900 font-black leading-none">{room.title}</h3>
                      {calculatedPercent > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-100 uppercase tracking-[0.2em]">{calculatedPercent}% OFF</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-baseline gap-3">
                    {isEditMode ? (
                      <div className="space-y-4 w-full">
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-gray-400 uppercase w-24">Base Price</span>
                           <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-1 rounded-xl flex-1">
                              <span className="text-[11px] font-bold text-gray-400">৳</span>
                              <input className="text-[13px] font-bold text-gray-600 bg-transparent outline-none py-1 w-full" value={room.price || ""} placeholder="e.g. 1300" onChange={(e) => updateRoom(room.id, 'price', e.target.value)} />
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-hotel-primary uppercase w-24">Final Total</span>
                           <div className="flex items-center gap-1 border-b border-hotel-primary/20 bg-hotel-primary/5 px-3 py-1 rounded-xl flex-1">
                              <span className="text-[11px] font-bold text-hotel-primary">৳</span>
                              <input className="text-[13px] font-bold text-hotel-primary bg-transparent outline-none py-1 w-full" value={room.discountPrice || ""} placeholder="e.g. 1000" onChange={(e) => updateRoom(room.id, 'discountPrice', e.target.value)} />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-300 line-through">৳{room.price}</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-3xl font-sans font-normal text-gray-900">৳{room.discountPrice}</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ Night</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditMode ? (
                  <textarea className="text-[13px] text-gray-500 mb-8 w-full bg-gray-50 outline-none p-5 rounded-3xl h-32 border border-gray-100 font-medium leading-relaxed resize-none" value={room.desc || ""} placeholder="Brief architectural and facility description..." onChange={(e) => updateRoom(room.id, 'desc', e.target.value)} />
                ) : (
                  <RoomDescription text={room.desc} />
                )}

                <div className="mb-10">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-5 px-1">Exclusive Assets</p>
                  {isEditMode ? (
                    <textarea className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[11px] font-bold text-gray-600 outline-none focus:border-hotel-primary min-h-[100px] resize-none" value={(room.features || []).join(', ')} placeholder="Features List (Separated by commas)" onChange={(e) => updateRoom(room.id, 'features', e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ""))} />
                  ) : (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      {(room.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-hotel-primary shrink-0 opacity-80" />
                          <span className="text-[11px] font-bold text-gray-600 truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <button 
                    disabled={isBookingDisabled && !isEditMode}
                    onClick={() => onBook?.(room)}
                    className={`w-full py-7 rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group/btn ${
                      isBookingDisabled && !isEditMode 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#9B1C1C] hover:bg-[#B22222] text-white shadow-red-100'
                    }`}
                  >
                    {isBookingDisabled && !isEditMode ? (
                      <><ShieldAlert size={20} /> Request Pending</>
                    ) : (
                      <>Reserve Now <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform" /></>
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

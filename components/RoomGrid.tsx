import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Room } from '../types';

interface RoomGridProps {
  rooms: Room[];
  isEditMode?: boolean;
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

const RoomGrid: React.FC<RoomGridProps> = ({ rooms = [], isEditMode, onUpdate, onImageUpload }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();

  // Modern currency formatter for BDT (৳)
  const formatter = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  });

  // Handle auto-selection highlight from URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setHighlightedId(category);
      // Remove highlight after a few seconds
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  const formatPriceString = (price: string) => {
    const safePrice = price || "";
    const numeric = parseFloat(safePrice.replace(/[^0-9.]/g, ''));
    return isNaN(numeric) ? safePrice : formatter.format(numeric);
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
    <section id="rooms" className="max-w-7xl mx-auto pt-8 md:pt-12 pb-24 px-4 md:px-6 bg-white w-full scroll-mt-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-hotel-primary/5 text-hotel-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={12} fill="currentColor" /> Exclusive Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-sans text-gray-900 mb-4 font-black tracking-tighter">
            Our Rooms
          </h2>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-light">
            Luxury spaces designed for comfort. Reserve today and enjoy an automatic <span className="text-hotel-primary font-bold">25% discount</span> on all bookings.
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
          const isHighlighted = highlightedId === room.id;
          return (
            <div 
              id={room.id}
              key={room.id} 
              className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-full relative shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] ${
                isHighlighted ? 'border-hotel-primary ring-4 ring-hotel-primary/10 scale-[1.02]' : 'border-gray-100'
              }`}
            >
              
              <div className="h-64 relative overflow-hidden shrink-0">
                <img 
                  src={room.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" 
                  alt={room.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-5 left-6 z-10">
                  {isEditMode ? (
                    <input 
                      className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm outline-none border border-hotel-primary/20"
                      value={room.tag || ""}
                      onChange={(e) => updateRoom(room.id, 'tag', e.target.value)}
                    />
                  ) : (
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                      {room.tag}
                    </span>
                  )}
                </div>

                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 gap-3">
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
              
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  {isEditMode ? (
                    <input 
                      className="text-xl font-sans text-hotel-primary font-black w-full bg-gray-50 border-b border-gray-200 outline-none py-1 mb-2"
                      value={room.title || ""}
                      placeholder="Room Title"
                      onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                    />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-sans text-hotel-primary font-black leading-tight">
                        {room.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-red-100 uppercase tracking-widest">
                        <Tag size={10} fill="currentColor" /> 25% OFF
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {isEditMode ? (
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-gray-400 uppercase w-20">Regular Price:</span>
                           <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 rounded flex-1">
                              <span className="text-[10px] font-bold text-gray-400">৳</span>
                              <input 
                                className="text-[12px] font-bold text-gray-500 bg-transparent outline-none py-1 w-full"
                                value={room.price || ""}
                                placeholder="Reg. Price"
                                onChange={(e) => updateRoom(room.id, 'price', e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-hotel-primary uppercase w-20">Offer Price:</span>
                           <div className="flex items-center gap-1 border-b border-hotel-primary/20 bg-hotel-primary/5 px-2 rounded flex-1">
                              <span className="text-[10px] font-bold text-hotel-primary">৳</span>
                              <input 
                                className="text-[12px] font-black text-hotel-primary bg-transparent outline-none py-1 w-full"
                                value={room.discountPrice || ""}
                                placeholder="Offer Price"
                                onChange={(e) => updateRoom(room.id, 'discountPrice', e.target.value)}
                              />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-gray-300 line-through">৳{formatPriceString(room.price)}</span>
                        <span className="text-2xl font-serif font-black text-gray-900">৳{formatPriceString(room.discountPrice)}</span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">/night</span>
                      </div>
                    )}
                    {!isEditMode && (
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                        Special Offer
                      </span>
                    )}
                  </div>
                </div>

                {isEditMode ? (
                  <textarea 
                    className="text-[12px] text-gray-500 mb-8 w-full bg-gray-50 outline-none p-4 rounded-2xl h-24 border border-gray-100 font-medium leading-relaxed resize-none"
                    value={room.desc || ""}
                    placeholder="Room description..."
                    onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                  />
                ) : (
                  <RoomDescription text={room.desc} />
                )}

                <div className="mb-10">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Room Features</p>
                  {isEditMode ? (
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[11px] font-bold text-gray-600 outline-none focus:border-hotel-primary min-h-[80px] resize-none"
                      value={(room.features || []).join(', ')}
                      placeholder="Features (comma separated)"
                      onChange={(e) => updateRoom(room.id, 'features', e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ""))}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {(room.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <CheckCircle2 size={14} className="text-hotel-primary shrink-0" />
                          <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
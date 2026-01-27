
import React, { useState } from 'react';
import { Users, ChevronRight, Zap, Camera, Trash2, Plus, RefreshCw } from 'lucide-react';
import { Room } from '../types';

interface RoomGridProps {
  rooms: Room[];
  isEditMode?: boolean;
  onUpdate?: (rooms: Room[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, isEditMode, onUpdate, onImageUpload }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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
    if (window.confirm("Delete this room category permanently?")) {
      onUpdate?.(rooms.filter(r => r.id !== id));
    }
  };

  const addNewRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      title: "New Category",
      price: "1,500",
      tag: "NEW",
      desc: "Freshly added luxury accommodation.",
      features: ["Wi-Fi"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      capacity: 2
    };
    onUpdate?.([...rooms, newRoom]);
  };

  return (
    <section className="max-w-7xl mx-auto pt-16 md:pt-24 pb-20 px-4 md:px-6 bg-white w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotel-primary text-white text-[10px] font-black uppercase tracking-widest mb-5 shadow-lg shadow-red-100 animate-pulse">
            <Zap size={12} fill="currentColor" /> Exclusive Red Offer
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-hotel-primary mb-4 leading-tight font-black">Curated Sanctuary</h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed font-light">
            Luxury meets legacy. Experience the red-carpet treatment with our 25% seasonal promotion.
          </p>
        </div>
        {isEditMode && (
          <button 
            onClick={addNewRoom}
            className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={18} /> Add Room Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-hotel-muted group hover:shadow-[0_40px_80px_rgba(229,57,53,0.12)] transition-all duration-700 flex flex-col h-full relative">
            
            <div className="h-56 md:h-64 relative overflow-hidden">
              <img 
                src={room.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={room.title} 
              />
              
              {isEditMode && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="file" className="hidden" onChange={(e) => handleImageChange(room.id, e)} />
                  <div className="bg-white p-3 rounded-full text-hotel-primary shadow-2xl">
                    {uploadingId === room.id ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                  </div>
                </label>
              )}

              <div className="absolute top-5 left-5">
                {isEditMode ? (
                  <input 
                    className="bg-white/95 backdrop-blur shadow-xl px-2 py-1 rounded-xl text-[9px] font-black text-hotel-primary tracking-widest uppercase border border-hotel-primary outline-none"
                    value={room.tag}
                    onChange={(e) => updateRoom(room.id, 'tag', e.target.value)}
                  />
                ) : (
                  <span className="bg-white/95 backdrop-blur shadow-xl px-4 py-1.5 rounded-xl text-[9px] font-black text-hotel-primary tracking-widest uppercase border border-hotel-primary/10">
                    {room.tag}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 md:p-7 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 overflow-hidden pr-2">
                  {isEditMode ? (
                    <input 
                      className="text-lg md:text-xl font-serif text-hotel-text font-black leading-tight w-full bg-gray-50 border-b border-hotel-primary outline-none"
                      value={room.title}
                      onChange={(e) => updateRoom(room.id, 'title', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-lg md:text-xl font-serif text-hotel-text font-black leading-tight group-hover:text-hotel-primary transition-colors truncate">{room.title}</h3>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <Users size={12} className="text-hotel-primary" /> 
                      {isEditMode ? (
                        <input 
                          type="number"
                          className="w-10 bg-transparent outline-none border-b border-gray-200"
                          value={room.capacity}
                          onChange={(e) => updateRoom(room.id, 'capacity', parseInt(e.target.value))}
                        />
                      ) : room.capacity} Guests
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                   <div className="flex items-center gap-1 justify-end">
                    <span className="text-xl md:text-2xl font-black text-hotel-primary leading-none">৳</span>
                    {isEditMode ? (
                      <input 
                        className="text-xl md:text-2xl font-black text-hotel-primary leading-none w-20 bg-gray-50 outline-none text-right"
                        value={room.price}
                        onChange={(e) => updateRoom(room.id, 'price', e.target.value)}
                      />
                    ) : (
                      <p className="text-xl md:text-2xl font-black text-hotel-primary leading-none">{room.price}</p>
                    )}
                   </div>
                </div>
              </div>

              {isEditMode ? (
                <textarea 
                  className="text-[11px] md:text-[12px] text-gray-500 mb-6 leading-relaxed font-light w-full bg-gray-50 outline-none p-2 rounded-xl h-20"
                  value={room.desc}
                  onChange={(e) => updateRoom(room.id, 'desc', e.target.value)}
                />
              ) : (
                <p className="text-[11px] md:text-[12px] text-gray-500 mb-6 md:mb-8 leading-relaxed font-light line-clamp-2">
                  {room.desc}
                </p>
              )}

              <div className="mt-auto flex gap-2">
                <button className="flex-1 bg-hotel-primary text-white py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-50 group-hover:bg-hotel-secondary transition-all active:scale-[0.97] flex items-center justify-center gap-3">
                  Book Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {isEditMode && (
                  <button 
                    onClick={() => deleteRoom(room.id)}
                    className="p-4 bg-red-50 text-hotel-primary rounded-2xl hover:bg-hotel-primary hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomGrid;

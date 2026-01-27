import React from 'react';
import { Users, Star, Percent, ChevronRight, Zap } from 'lucide-react';
import { ROOMS_DATA } from '../constants';

const RoomGrid: React.FC = () => {
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
        <div className="hidden md:block">
          <div className="bg-hotel-muted px-10 py-6 rounded-[2.5rem] border-2 border-dashed border-hotel-primary/20 text-right">
            <p className="text-3xl font-black text-hotel-primary">25% OFF</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automatic Discount</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {ROOMS_DATA.map((room) => (
          <div key={room.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-hotel-muted group hover:shadow-[0_40px_80px_rgba(229,57,53,0.12)] transition-all duration-700 flex flex-col h-full">
            <div className="h-56 md:h-64 relative overflow-hidden">
              <img 
                src={room.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={room.title} 
              />
              
              <div className="absolute top-5 left-5">
                <span className="bg-white/95 backdrop-blur shadow-xl px-4 py-1.5 rounded-xl text-[9px] font-black text-hotel-primary tracking-widest uppercase border border-hotel-primary/10">
                  {room.tag}
                </span>
              </div>
              
              <div className="absolute top-5 right-5 bg-hotel-primary text-white w-10 h-10 md:w-12 md:h-12 rounded-full shadow-2xl flex flex-col items-center justify-center ring-4 ring-white/30">
                <span className="text-[10px] md:text-[11px] font-black leading-none">25%</span>
                <span className="text-[6px] md:text-[7px] font-bold uppercase">OFF</span>
              </div>

              <div className="absolute bottom-4 left-5">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-hotel-primary/10 flex items-center gap-1.5 text-hotel-primary shadow-lg">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[11px] font-black">4.9</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-7 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg md:text-xl font-serif text-hotel-text font-black leading-tight group-hover:text-hotel-primary transition-colors truncate">{room.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <Users size={12} className="text-hotel-primary" /> {room.capacity} Guests
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[9px] text-gray-300 font-bold line-through">৳{(parseInt(room.price.replace(/,/g, '')) * 1.33).toLocaleString()}</p>
                   <p className="text-xl md:text-2xl font-black text-hotel-primary leading-none">৳{room.price}</p>
                </div>
              </div>

              <p className="text-[11px] md:text-[12px] text-gray-500 mb-6 md:mb-8 leading-relaxed font-light line-clamp-2">
                {room.desc}
              </p>

              <div className="mt-auto">
                <button className="w-full bg-hotel-primary text-white py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-50 group-hover:bg-hotel-secondary transition-all active:scale-[0.97] flex items-center justify-center gap-3">
                  Book Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomGrid;
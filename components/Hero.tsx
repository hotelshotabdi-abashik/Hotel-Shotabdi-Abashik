import React from 'react';
import { Search, Calendar, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-white overflow-visible px-6 bg-white">
      {/* MASONRY BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 p-2 brightness-[0.4] rounded-b-[3rem] md:rounded-b-[5rem]">
        <div className="col-span-2 row-span-2 relative">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            alt="Main Lobby"
          />
        </div>
        <div className="col-start-3 row-start-1 relative">
          <img 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            alt="Exterior"
          />
        </div>
        <div className="col-start-4 row-span-2 relative">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            alt="Hotel Hallway"
          />
        </div>
        <div className="col-start-3 row-start-2 relative">
          <img 
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            alt="Fine Dining"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl pt-12 pb-24">
        <span className="inline-block px-5 py-2 rounded-full bg-hotel-primary/90 text-white text-[10px] md:text-xs font-black tracking-[0.4em] uppercase mb-8 shadow-xl border border-white/20 animate-fade-in">
          Premium Residential Hotel
        </span>
        <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight tracking-tight">
          <span className="text-6xl md:text-9xl block mb-2 text-hotel-primary drop-shadow-2xl font-black">Hotel</span>
          <span className="text-white drop-shadow-lg">Shotabdi Residential</span>
        </h2>
        <p className="text-base md:text-xl max-w-2xl mx-auto text-white opacity-95 font-light leading-relaxed mb-12">
          Experience unmatched hospitality and vibrant comfort at the heart of Sylhet's scenic beauty.
        </p>
      </div>

      <div className="w-full max-w-5xl absolute -bottom-14 md:-bottom-20 left-1/2 -translate-x-1/2 z-20 px-4">
        <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_100px_rgba(229,57,53,0.15)] grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-hotel-text border border-hotel-muted">
          <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-hotel-primary uppercase tracking-[0.2em]">
              <Calendar size={12} /> Check-in
            </label>
            <input type="date" className="bg-transparent font-bold text-sm outline-none w-full text-hotel-text cursor-pointer" defaultValue="2024-05-20" />
          </div>
          <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-hotel-primary uppercase tracking-[0.2em]">
              <Calendar size={12} /> Check-out
            </label>
            <input type="date" className="bg-transparent font-bold text-sm outline-none w-full text-hotel-text cursor-pointer" defaultValue="2024-05-22" />
          </div>
          <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-hotel-primary uppercase tracking-[0.2em]">
              <Users size={12} /> Guests
            </label>
            <select className="bg-transparent font-bold text-sm outline-none w-full appearance-none cursor-pointer text-hotel-text">
              <option>2 Adults, 0 Child</option>
              <option>1 Adult</option>
              <option>4 Adults, 2 Child</option>
            </select>
          </div>
          <div className="pt-2 md:pt-0">
            <button className="w-full bg-hotel-primary hover:bg-hotel-secondary text-white font-black py-5 rounded-[1.5rem] transition-all hover:shadow-[0_20px_40px_rgba(229,57,53,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 text-sm tracking-[0.1em] uppercase">
              <Search size={18} />
              Availability
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
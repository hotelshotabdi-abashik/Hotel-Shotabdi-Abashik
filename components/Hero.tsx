import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Loader2, Search, Bed, Utensils, Map as MapIcon, 
  Calendar, Users, ChevronDown, Moon, ShieldCheck, Key
} from 'lucide-react';
import { HeroConfig } from '../types';

interface HeroProps {
  config: HeroConfig;
  isEditMode?: boolean;
  onUpdate?: (config: Partial<HeroConfig>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const Hero: React.FC<HeroProps> = ({ config, isEditMode, onUpdate, onImageUpload }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('hotel');
  const [stayCategory, setStayCategory] = useState('vacation');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        onUpdate?.({ backgroundImage: url });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const tabs = [
    { id: 'hotel', label: 'Book Stay', icon: <Bed size={18} />, path: '/rooms' },
    { id: 'dining', label: 'Local Dining', icon: <Utensils size={18} />, path: '/restaurants' },
    { id: 'guide', label: 'Tourist Guide', icon: <MapIcon size={18} />, path: '/guide' }
  ];

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-8 md:pt-12 pb-24 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-40 scale-105" 
          alt="Hotel Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/40 via-transparent to-[#0A192F]/90"></div>
      </div>
      
      {isEditMode && (
        <div className="absolute top-24 right-10 z-20">
          <label className="flex items-center gap-3 bg-white/95 backdrop-blur px-5 py-2.5 rounded-2xl shadow-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all transform hover:scale-105 active:scale-95">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={16} /> : <Camera size={16} className="text-hotel-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Change Atmosphere</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Simple Header Text */}
        <div className="mb-10 text-center animate-fade-in max-w-3xl">
          <h2 className="text-white text-3xl md:text-5xl font-serif font-black mb-4 leading-tight tracking-tight">
             Premium Residential Services
          </h2>
          <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed opacity-90 px-4">
            {isEditMode ? (
              <textarea 
                className="bg-transparent border-b border-white/20 outline-none w-full text-center resize-none h-20 text-white"
                value={config.subtitle}
                onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
              />
            ) : config.subtitle}
          </p>
        </div>

        {/* The Refined Hotel Booking Widget */}
        <div className="w-full max-w-6xl bg-white rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-fade-in">
          
          {/* Top Tabs Bar */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth bg-gray-50/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); navigate(tab.path); }}
                className={`flex items-center gap-2.5 px-10 py-6 transition-all relative whitespace-nowrap group ${
                  activeTab === tab.id ? 'text-[#006CE4]' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="text-[14px] font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-hotel-primary"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            {/* Stay Purpose & Guest Row */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-3">
                {[
                  { id: 'vacation', label: 'Vacation' },
                  { id: 'business', label: 'Business' },
                  { id: 'group', label: 'Family/Group' }
                ].map((type) => (
                  <button 
                    key={type.id} 
                    onClick={() => setStayCategory(type.id)}
                    className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                      stayCategory === type.id 
                        ? 'bg-hotel-primary/5 border-hotel-primary/20 text-hotel-primary shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 text-gray-900 text-xs font-black cursor-pointer hover:bg-white transition-all group">
                  <Users size={16} className="text-gray-400 group-hover:text-hotel-primary transition-colors" />
                  <span>2 ADULTS, 0 CHILDREN</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 text-gray-900 text-xs font-black cursor-pointer hover:bg-white transition-all group">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-green-600">BEST PRICE SYNC</span>
                </div>
              </div>
            </div>

            {/* Main Functional Booking Row */}
            <div className="flex flex-col lg:flex-row gap-1 items-stretch bg-gray-100 rounded-[1.5rem] overflow-hidden border border-gray-100 p-1">
              
              {/* Room Category Box */}
              <div className="flex-[1.2] bg-white p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all rounded-l-[1rem]">
                <div className="w-12 h-12 bg-hotel-primary/5 rounded-2xl flex items-center justify-center mr-5 shrink-0">
                  <Key size={22} className="text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Category</span>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-gray-900 truncate">Deluxe Family Suite</p>
                    <ChevronDown size={16} className="text-gray-300 group-hover:text-hotel-primary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Check-in Date */}
              <div className="flex-1 bg-white p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-white transition-all">
                  <Calendar size={22} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</span>
                  <div className="flex flex-col">
                    <p className="text-lg font-black text-gray-900">28 Jan</p>
                    <p className="text-[10px] text-gray-400 font-bold">WEDNESDAY, 2026</p>
                  </div>
                </div>
              </div>

              {/* Check-out Date */}
              <div className="flex-1 bg-white p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-white transition-all">
                  <Moon size={22} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-out</span>
                  <div className="flex flex-col">
                    <p className="text-lg font-black text-gray-900">30 Jan</p>
                    <p className="text-[10px] text-gray-400 font-bold">FRIDAY, 2026</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => navigate('/rooms')}
                className="bg-hotel-primary hover:bg-[#B22222] text-white px-10 py-6 lg:py-0 rounded-r-[1rem] flex items-center justify-center transition-all active:scale-[0.98] shadow-inner gap-3 shrink-0"
              >
                <Search size={24} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] lg:hidden">Check Availability</span>
              </button>
            </div>

            {/* Bottom Perks Bar */}
            <div className="flex flex-wrap items-center gap-10 mt-10 px-2">
              {[
                { label: 'Breakfast Included', icon: <Utensils size={14} /> },
                { label: 'Free Cancellation', icon: <ShieldCheck size={14} /> },
                { label: 'Pay at Hotel', icon: <Key size={14} /> }
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-gray-400 group cursor-default">
                  <span className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-hotel-primary group-hover:bg-hotel-primary/5 transition-all">
                    {perk.icon}
                  </span>
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="mt-12 flex flex-col items-center gap-3 animate-bounce">
            <div className="w-11 h-11 bg-white/5 backdrop-blur rounded-full flex items-center justify-center text-white/40 border border-white/10">
                <ChevronDown size={22} />
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Explore Rooms</span>
        </div>
      </div>
      
      {/* Dynamic Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-hotel-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;
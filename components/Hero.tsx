import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Loader2, Search, Bed, Utensils, Map as MapIcon, 
  Calendar, Users, ChevronDown, Moon, ShieldCheck, Key
} from 'lucide-react';
import { HeroConfig } from '../types';
import { ROOMS_DATA } from '../constants';

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
  const [selectedRoomId, setSelectedRoomId] = useState(ROOMS_DATA[0].id);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

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

  const handleSearch = () => {
    // Navigate to rooms with the specific category ID to trigger highlighting
    navigate(`/rooms?category=${selectedRoomId}`);
    
    // Smooth scroll if already on the page or after navigation
    setTimeout(() => {
      const element = document.getElementById(selectedRoomId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const tabs = [
    { id: 'hotel', label: 'Book Stay', icon: <Bed size={16} />, path: '/rooms' },
    { id: 'restaurants', label: 'Restaurants', icon: <Utensils size={16} />, path: '/restaurants' },
    { id: 'guide', label: 'Tourist Guide', icon: <MapIcon size={16} />, path: '/guide' }
  ];

  const selectedRoom = ROOMS_DATA.find(r => r.id === selectedRoomId);

  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex flex-col items-center justify-center pt-6 md:pt-12 pb-16 md:pb-24 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
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
        <div className="absolute top-20 md:top-24 right-4 md:right-10 z-20">
          <label className="flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all transform hover:scale-105 active:scale-95">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={14} /> : <Camera size={14} className="text-hotel-primary" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Change Atmosphere</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Simple Header Text */}
        <div className="mb-6 md:mb-10 text-center animate-fade-in max-w-3xl">
          <h2 className="text-white text-2xl md:text-5xl font-serif font-black mb-2 md:mb-4 leading-tight tracking-tight px-2">
             Premium Residential Services
          </h2>
          <p className="text-[11px] md:text-base text-white/70 font-medium leading-relaxed opacity-90 px-6">
            {isEditMode ? (
              <textarea 
                className="bg-transparent border-b border-white/20 outline-none w-full text-center resize-none h-16 md:h-20 text-white"
                value={config.subtitle}
                onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
              />
            ) : config.subtitle}
          </p>
        </div>

        {/* The Refined Hotel Booking Widget */}
        <div className="w-full max-w-6xl bg-white rounded-[1rem] md:rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-visible animate-fade-in">
          
          {/* Top Tabs Bar - Smaller for Mobile */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth bg-gray-50/30 rounded-t-[1rem] md:rounded-t-[1.5rem]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); navigate(tab.path); }}
                className={`flex items-center gap-2 px-6 md:px-10 py-4 md:py-6 transition-all relative whitespace-nowrap group ${
                  activeTab === tab.id ? 'text-[#006CE4]' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] md:text-[14px] font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] md:h-[3px] bg-hotel-primary"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-10">
            {/* Stay Purpose Row - Smaller and centered on mobile */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'vacation', label: 'Vacation' },
                  { id: 'business', label: 'Business' },
                  { id: 'group', label: 'Family/Group' }
                ].map((type) => (
                  <button 
                    key={type.id} 
                    onClick={() => setStayCategory(type.id)}
                    className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      stayCategory === type.id 
                        ? 'bg-hotel-primary/5 border-hotel-primary/20 text-hotel-primary shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row md:ml-auto gap-3 md:gap-4">
                <div className="flex items-center justify-between gap-2 bg-gray-50 px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-gray-100 text-gray-900 text-[10px] md:text-xs font-black cursor-pointer hover:bg-white transition-all group">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400 group-hover:text-hotel-primary" />
                    <span>2 ADULTS</span>
                  </div>
                  <ChevronDown size={12} className="text-gray-400 ml-2" />
                </div>
                <div className="flex items-center justify-center gap-2 bg-gray-50 px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-gray-100 text-[10px] md:text-xs font-black group">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span className="text-green-600 uppercase tracking-widest">Best Rate Guarantee</span>
                </div>
              </div>
            </div>

            {/* Main Functional Booking Row - Highly optimized for Mobile */}
            <div className="flex flex-col lg:flex-row gap-1 items-stretch bg-gray-100 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-gray-100 p-0.5 md:p-1">
              
              {/* Room Category Box - Interactive Dropdown */}
              <div className="relative flex-[1.2]">
                <div 
                  onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                  className="bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all rounded-t-lg md:rounded-l-[1rem] md:rounded-tr-none"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-hotel-primary/5 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 md:mr-5 shrink-0">
                    <Key size={18} md:size={22} className="text-hotel-primary" />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Select Room Type</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-lg font-black text-gray-900 truncate max-w-[150px] md:max-w-none">
                        {selectedRoom?.title}
                      </p>
                      <ChevronDown size={14} className={`text-gray-300 transition-transform ${showRoomDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showRoomDropdown && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    {ROOMS_DATA.map((room) => (
                      <div 
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setShowRoomDropdown(false);
                        }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 ${selectedRoomId === room.id ? 'bg-blue-50/30' : ''}`}
                      >
                        <div>
                          <p className="text-xs font-black text-gray-900">{room.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{room.tag}</p>
                        </div>
                        <p className="text-[10px] font-black text-hotel-primary">৳{room.discountPrice}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in Date */}
              <div className="flex-1 bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 md:mr-5 shrink-0 group-hover:bg-white transition-all">
                  <Calendar size={18} md:size={22} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Check-in</span>
                  <div className="flex flex-row md:flex-col items-baseline gap-2 md:gap-0">
                    <p className="text-sm md:text-lg font-black text-gray-900">28 Jan</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase">Wednesday</p>
                  </div>
                </div>
              </div>

              {/* Check-out Date */}
              <div className="flex-1 bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 md:mr-5 shrink-0 group-hover:bg-white transition-all">
                  <Moon size={18} md:size={22} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Check-out</span>
                  <div className="flex flex-row md:flex-col items-baseline gap-2 md:gap-0">
                    <p className="text-sm md:text-lg font-black text-gray-900">30 Jan</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase">Friday</p>
                  </div>
                </div>
              </div>

              {/* Action Button - Direct Auto Selection logic */}
              <button 
                onClick={handleSearch}
                className="bg-hotel-primary hover:bg-[#B22222] text-white px-8 md:px-10 py-5 md:py-6 lg:py-0 rounded-b-lg lg:rounded-r-[1rem] lg:rounded-b-none flex items-center justify-center transition-all active:scale-[0.98] shadow-inner gap-3 shrink-0"
              >
                <Search size={22} md:size={24} strokeWidth={3} />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Check Availability</span>
              </button>
            </div>

            {/* Bottom Perks Bar - Hidden on very small devices to save space */}
            <div className="hidden sm:flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-10 mt-6 md:mt-10 px-2 opacity-80">
              {[
                { label: 'Breakfast Incl.', icon: <Utensils size={12} /> },
                { label: 'Free Cancel', icon: <ShieldCheck size={12} /> },
                { label: 'Pay at Hotel', icon: <Key size={12} /> }
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-400 group cursor-default">
                  <span className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-hotel-primary group-hover:bg-hotel-primary/5 transition-all">
                    {perk.icon}
                  </span>
                  <span className="text-[9px] md:text-[12px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Scroll Indicator - Smaller */}
        <div className="mt-8 md:mt-12 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-8 h-8 md:w-11 md:h-11 bg-white/5 backdrop-blur rounded-full flex items-center justify-center text-white/40 border border-white/10">
                <ChevronDown size={18} md:size={22} />
            </div>
            <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Explore Rooms</span>
        </div>
      </div>
      
      {/* Dynamic Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-hotel-primary/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;
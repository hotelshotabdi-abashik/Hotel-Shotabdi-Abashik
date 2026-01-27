import React, { useState, useRef } from 'react';
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
  
  // Date selection states
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

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
    navigate(`/rooms?category=${selectedRoomId}&checkIn=${checkIn}&checkOut=${checkOut}`);
    
    // Smooth scroll if already on the page or after navigation
    setTimeout(() => {
      const element = document.getElementById(selectedRoomId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const weekday = date.toLocaleString('default', { weekday: 'short' });
    return { day, month, weekday };
  };

  const tabs = [
    { id: 'hotel', label: 'Book Stay', icon: <Bed size={16} />, path: '/rooms' },
    { id: 'restaurants', label: 'Restaurants', icon: <Utensils size={16} />, path: '/restaurants' },
    { id: 'guide', label: 'Tourist Guide', icon: <MapIcon size={16} />, path: '/guide' }
  ];

  const selectedRoom = ROOMS_DATA.find(r => r.id === selectedRoomId);
  const checkInDisplay = formatDateLabel(checkIn);
  const checkOutDisplay = formatDateLabel(checkOut);

  return (
    <section className="relative min-h-[65vh] md:min-h-[85vh] flex flex-col items-center justify-center pt-6 md:pt-12 pb-16 md:pb-24 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-30 md:opacity-40 scale-105" 
          alt="Hotel Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/40 via-transparent to-[#0A192F]/95"></div>
      </div>
      
      {isEditMode && (
        <div className="absolute top-20 md:top-24 right-4 md:right-10 z-20">
          <label className="flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all transform hover:scale-105 active:scale-95">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={14} /> : <Camera size={14} className="text-hotel-primary" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Update Canvas</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Simple Header Text */}
        <div className="mb-6 md:mb-10 text-center animate-fade-in max-w-3xl">
          <h2 className="text-white text-2xl md:text-5xl font-serif font-black mb-2 md:mb-4 leading-tight tracking-tight px-4">
             Premium Residential Services
          </h2>
          <p className="text-[10px] md:text-base text-white/60 font-medium leading-relaxed opacity-90 px-6 max-w-2xl mx-auto">
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
        <div className="w-full max-w-6xl bg-white rounded-[1.2rem] md:rounded-[1.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/10 overflow-visible animate-fade-in">
          
          {/* Top Tabs Bar - Minimized for better mobile density */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth bg-gray-50/50 rounded-t-[1.2rem] md:rounded-t-[1.5rem]">
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
                <span className="text-[9px] md:text-[13px] font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] md:h-[3px] bg-hotel-primary"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-10">
            {/* Stay Purpose & Guests - Simplified for small devices */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="flex items-center justify-center md:justify-start gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
                {[
                  { id: 'vacation', label: 'Vacation' },
                  { id: 'business', label: 'Business' },
                  { id: 'group', label: 'Group' }
                ].map((type) => (
                  <button 
                    key={type.id} 
                    onClick={() => setStayCategory(type.id)}
                    className={`px-3 md:px-5 py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      stayCategory === type.id 
                        ? 'bg-hotel-primary/5 border-hotel-primary/20 text-hotel-primary shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between md:ml-auto gap-3">
                <div className="flex items-center gap-2 bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-100 text-gray-900 text-[9px] md:text-xs font-black cursor-pointer hover:bg-white transition-all group shrink-0">
                  <Users size={12} className="text-gray-400 group-hover:text-hotel-primary" />
                  <span>2 ADULTS</span>
                  <ChevronDown size={10} className="text-gray-400 ml-1" />
                </div>
                <div className="flex items-center gap-2 bg-green-50/50 px-4 py-2.5 rounded-xl border border-green-100/50 text-[9px] md:text-xs font-black group shrink-0">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span className="text-green-600 uppercase tracking-widest">Guaranteed Rate</span>
                </div>
              </div>
            </div>

            {/* Main Functional Row - Balanced for density */}
            <div className="flex flex-col lg:flex-row gap-0.5 items-stretch bg-gray-100 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-gray-100">
              
              {/* Room Category Box */}
              <div className="relative flex-[1.2]">
                <div 
                  onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                  className="bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all rounded-t-lg md:rounded-l-[1.2rem] md:rounded-tr-none border-b lg:border-b-0 lg:border-r border-gray-100"
                >
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-hotel-primary/5 rounded-xl flex items-center justify-center mr-4 shrink-0">
                    <Key size={18} className="text-hotel-primary" />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden text-left">
                    <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Room Selection</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-lg font-black text-gray-900 truncate max-w-[140px] md:max-w-none">
                        {selectedRoom?.title}
                      </p>
                      <ChevronDown size={12} className={`text-gray-300 transition-transform duration-300 ${showRoomDropdown ? 'rotate-180 text-hotel-primary' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Optimized Dropdown Menu */}
                {showRoomDropdown && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[250px] overflow-y-auto no-scrollbar">
                    {ROOMS_DATA.map((room) => (
                      <div 
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setShowRoomDropdown(false);
                        }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 ${selectedRoomId === room.id ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className="text-left">
                          <p className="text-[11px] font-black text-gray-900">{room.title}</p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{room.tag}</p>
                        </div>
                        <p className="text-[10px] font-black text-hotel-primary">৳{room.discountPrice}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in Date Picker */}
              <div 
                onClick={() => checkInRef.current?.showPicker()}
                className="relative flex-1 bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all border-b lg:border-b-0 lg:border-r border-gray-100"
              >
                <input 
                  type="date" 
                  ref={checkInRef}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="absolute inset-0 opacity-0 pointer-events-none" 
                />
                <div className="w-9 h-9 md:w-11 md:h-11 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:bg-white transition-all">
                  <Calendar size={18} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Check-in</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm md:text-lg font-black text-gray-900">{checkInDisplay.day} {checkInDisplay.month}</p>
                    <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase">{checkInDisplay.weekday}</p>
                  </div>
                </div>
              </div>

              {/* Check-out Date Picker */}
              <div 
                onClick={() => checkOutRef.current?.showPicker()}
                className="relative flex-1 bg-white p-4 md:p-6 flex items-center group cursor-pointer hover:bg-gray-50/80 transition-all border-b lg:border-b-0"
              >
                <input 
                  type="date" 
                  ref={checkOutRef}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="absolute inset-0 opacity-0 pointer-events-none" 
                />
                <div className="w-9 h-9 md:w-11 md:h-11 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:bg-white transition-all">
                  <Moon size={18} className="text-gray-400 group-hover:text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Check-out</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm md:text-lg font-black text-gray-900">{checkOutDisplay.day} {checkOutDisplay.month}</p>
                    <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase">{checkOutDisplay.weekday}</p>
                  </div>
                </div>
              </div>

              {/* High Contrast Action Button */}
              <button 
                onClick={handleSearch}
                className="bg-hotel-primary hover:bg-[#B22222] text-white px-8 md:px-12 py-5 md:py-6 lg:py-0 rounded-b-lg lg:rounded-r-[1.5rem] lg:rounded-b-none flex items-center justify-center transition-all active:scale-[0.98] shadow-inner gap-3 shrink-0"
              >
                <Search size={22} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] lg:hidden">Check Vacancy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Minimized Scroll Indicator */}
        <div className="mt-8 md:mt-12 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-white/5 backdrop-blur rounded-full flex items-center justify-center text-white/40 border border-white/10">
                <ChevronDown size={18} />
            </div>
            <span className="text-[7px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Explore Stay</span>
        </div>
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-hotel-primary/5 rounded-full blur-[80px] md:blur-[150px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;
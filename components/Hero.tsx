
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Loader2, Search, Bed, Utensils, Map as MapIcon, 
  Calendar, Users, ChevronDown, Moon, ShieldCheck, Key,
  Tag, MessageSquare, History, Sparkles, MapPin, ExternalLink
} from 'lucide-react';
import { HeroConfig, Room } from '../types';
import { ROOMS_DATA } from '../constants';
import { translations, Language } from '../translations';

interface HeroProps {
  config: HeroConfig;
  rooms: Room[];
  isEditMode?: boolean;
  language: Language;
  onUpdate?: (config: Partial<HeroConfig>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const Hero: React.FC<HeroProps> = ({ config, rooms = [], isEditMode, language, onUpdate, onImageUpload }) => {
  const navigate = useNavigate();
  const t = translations[language];
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('hotel');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);
  
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
    // If we are on the home page, just scroll. Otherwise navigate.
    const isHome = window.location.pathname === '/';
    
    if (isHome) {
      const element = document.getElementById(selectedRoomId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Update URL without reload to trigger highlight
        const newUrl = `${window.location.pathname}?category=${selectedRoomId}&checkIn=${checkIn}&checkOut=${checkOut}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        // Dispatch event so RoomGrid knows to highlight
        window.dispatchEvent(new Event('popstate'));
      } else {
        navigate(`/rooms?category=${selectedRoomId}&checkIn=${checkIn}&checkOut=${checkOut}`);
      }
    } else {
      navigate(`/rooms?category=${selectedRoomId}&checkIn=${checkIn}&checkOut=${checkOut}`);
    }
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

  const shortcuts = [
    { id: 'rooms', label: 'Our Rooms', icon: <Bed size={18} />, path: '/rooms', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'offers', label: 'Offers', icon: <Tag size={18} />, path: '/offers', color: 'text-hotel-primary', bg: 'bg-red-50' },
    { id: 'restaurants', label: 'Dining', icon: <Utensils size={18} />, path: '/restaurants', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'guide', label: 'Guide', icon: <MapIcon size={18} />, path: '/guide', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'mystays', label: 'History', icon: <History size={18} />, path: '/mystays', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'helpdesk', label: 'Support', icon: <MessageSquare size={18} />, path: '/helpdesk', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const checkInDisplay = formatDateLabel(checkIn);
  const checkOutDisplay = formatDateLabel(checkOut);

  return (
    <section id="hero-section" className="relative h-[300px] md:h-[400px] flex flex-col items-center justify-center px-4 md:px-10 w-full overflow-hidden bg-white">
      {isEditMode && (
        <div className="absolute top-4 right-4 md:right-10 z-20">
          <label className="flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all transform hover:scale-105 active:scale-95">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={14} /> : <Camera size={14} className="text-hotel-primary" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Update Canvas</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-gray-900 text-4xl md:text-6xl font-serif font-black mb-2 tracking-tight">
             {t.residentialService}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-medium tracking-widest uppercase">
            {t.eliteHospitality}
          </p>
        </div>

        {/* Refined Hotel Search Bar */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-stretch overflow-hidden p-1.5 border border-gray-100 mb-12">
          
          <div className="relative flex-[1.2] border-b lg:border-b-0 lg:border-r border-gray-100">
            <div 
              onClick={() => setShowRoomDropdown(!showRoomDropdown)}
              className="p-4 md:p-5 flex items-center h-full group cursor-pointer hover:bg-gray-50/80 transition-all"
            >
              <div className="w-10 h-10 bg-hotel-primary/5 rounded-xl flex items-center justify-center mr-4 shrink-0">
                <Key size={18} className="text-hotel-primary" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t.selectRoom}</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-gray-900 truncate max-w-[140px]">
                    {rooms.find(r => r.id === selectedRoomId)?.title || t.selectRoom}
                  </p>
                  <ChevronDown size={12} className={`text-gray-300 transition-transform ${showRoomDropdown ? 'rotate-180 text-hotel-primary' : ''}`} />
                </div>
              </div>
            </div>

            {showRoomDropdown && (
              <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[250px] overflow-y-auto no-scrollbar">
                {rooms.map((room) => (
                  <div 
                    key={room.id}
                    onClick={() => { setSelectedRoomId(room.id); setShowRoomDropdown(false); }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 ${selectedRoomId === room.id ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="text-left">
                      <p className="text-[11px] font-black text-gray-900">{room.title}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{room.tag}</p>
                    </div>
                    <p className="text-[10px] font-sans font-black text-hotel-primary">৳{room.discountPrice}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            onClick={() => checkInRef.current?.showPicker()}
            className="relative flex-1 p-4 md:p-5 flex items-center h-full group cursor-pointer hover:bg-gray-50/80 transition-all border-b lg:border-b-0 lg:border-r border-gray-100"
          >
            <input type="date" ref={checkInRef} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="absolute inset-0 opacity-0 pointer-events-none" />
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:bg-white transition-all">
              <Calendar size={18} className="text-gray-400 group-hover:text-hotel-primary" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t.checkIn}</span>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-black text-gray-900">{checkInDisplay.day} {checkInDisplay.month}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase">{checkInDisplay.weekday}</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => checkOutRef.current?.showPicker()}
            className="relative flex-1 p-4 md:p-5 flex items-center h-full group cursor-pointer hover:bg-gray-50/80 transition-all border-b lg:border-b-0 lg:border-r border-gray-100"
          >
            <input type="date" ref={checkOutRef} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="absolute inset-0 opacity-0 pointer-events-none" />
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:bg-white transition-all">
              <Moon size={18} className="text-gray-400 group-hover:text-hotel-primary" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t.checkOut}</span>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-black text-gray-900">{checkOutDisplay.day} {checkOutDisplay.month}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase">{checkOutDisplay.weekday}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="bg-hotel-primary hover:bg-hotel-secondary text-white px-10 py-5 lg:py-0 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shrink-0 rounded-xl shadow-xl shadow-red-100 flex items-center justify-center gap-3"
          >
            <Search size={18} strokeWidth={3} />
            {t.checkVacancy}
          </button>
        </div>

        {/* Categories / Shortcuts below search - Styled as Filters */}
        <div className="w-full max-w-4xl flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-hotel-primary flex items-center justify-center">
              <div className="w-2 h-2 bg-hotel-primary rounded-full"></div>
            </div>
            <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{t.allCategories}</span>
          </div>

          {shortcuts.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-hotel-primary flex items-center justify-center transition-colors">
                <div className="w-2 h-2 bg-hotel-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-hotel-primary/5 rounded-full blur-[80px] md:blur-[150px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;

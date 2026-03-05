
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Loader2, Search, ChevronDown, ShieldCheck,
  Filter, Check, Bed, Utensils, Map as MapIcon, Tag, 
  History, MessageSquare, Sparkles, Key, Moon, Calendar,
  Image as ImageIcon, PlayCircle
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
  requireAuth?: (action: () => void) => void;
  activeCategories: string[];
  onCategoriesChange: (ids: string[]) => void;
}

const Hero: React.FC<HeroProps> = ({ config, rooms = [], isEditMode, language, onUpdate, onImageUpload, requireAuth, activeCategories, onCategoriesChange }) => {
  const navigate = useNavigate();
  const t = translations[language];
  
  const formatNumber = (num: number | string) => {
    if (language === 'EN') return String(num);
    return String(num).split('').map(char => t.numbers[char as keyof typeof t.numbers] || char).join('');
  };

  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('hotel');
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  const toggleCategory = (id: string) => {
    if (['mystays', 'helpdesk'].includes(id)) {
      scrollToSection(id);
      return;
    }

    if (id === 'all') {
      onCategoriesChange(['all']);
      return;
    }

    let next = [...activeCategories];
    if (next.includes('all')) {
      next = [id];
    } else {
      if (next.includes(id)) {
        next = next.filter(x => x !== id);
        if (next.length === 0) next = ['all'];
      } else {
        next.push(id);
      }
    }
    onCategoriesChange(next);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const path = shortcuts.find(s => s.id === id)?.path;
      if (path) {
        if (['mystays', 'helpdesk'].includes(id) && requireAuth) {
          requireAuth(() => navigate(path));
        } else {
          navigate(path);
        }
      }
    }
  };

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId('all');
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
      const targetId = selectedRoomId === 'all' ? 'rooms' : selectedRoomId;
      const element = document.getElementById(targetId);
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
    if (!dateStr) return { day: '--', month: '---', weekday: '---' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { day: '--', month: '---', weekday: '---' };
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const weekday = date.toLocaleString('default', { weekday: 'short' });
    return { day, month, weekday };
  };

  const shortcuts = [
    { id: 'rooms', label: t.ourRooms, icon: <Bed size={22} />, path: '/rooms', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'offers', label: t.offers, icon: <Tag size={22} />, path: '/offers', color: 'text-hotel-primary', bg: 'bg-red-50' },
    { id: 'restaurants', label: t.dining, icon: <Utensils size={22} />, path: '/restaurants', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'guide', label: t.guide, icon: <MapIcon size={22} />, path: '/guide', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'gallery', label: language === 'EN' ? 'Gallery' : 'গ্যালারি', icon: <ImageIcon size={22} />, path: '/gallery', color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'mystays', label: t.history, icon: <History size={22} />, path: '/mystays', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'helpdesk', label: t.support, icon: <MessageSquare size={22} />, path: '/helpdesk', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const checkInDisplay = formatDateLabel(checkIn);
  const checkOutDisplay = formatDateLabel(checkOut);

  return (
    <section id="hero-section" className="relative min-h-[550px] md:h-[450px] flex flex-col items-center justify-center px-4 md:px-10 w-full overflow-hidden bg-white pt-12 md:pt-0 pb-0">
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
          <h2 
            className={`text-gray-900 text-4xl md:text-6xl font-serif font-black mb-2 tracking-tight transition-all ${isEditMode ? 'hover:bg-amber-50 cursor-pointer rounded px-2' : ''}`}
            onClick={() => isEditMode && onUpdate?.({ title: window.prompt("Edit Title:", config.title) || config.title })}
          >
             {config.title || t.residentialService}
          </h2>
          <p 
            className={`text-gray-500 text-xs md:text-sm font-medium tracking-widest uppercase transition-all ${isEditMode ? 'hover:bg-amber-50 cursor-pointer rounded px-2' : ''}`}
            onClick={() => isEditMode && onUpdate?.({ subtitle: window.prompt("Edit Subtitle:", config.subtitle) || config.subtitle })}
          >
            {config.subtitle || t.eliteHospitality}
          </p>
        </div>

        {/* Refined Hotel Search Bar */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-stretch overflow-hidden p-1.5 border border-gray-100 mb-8">
          
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
                    {selectedRoomId === 'all' ? t.allRooms : (rooms.find(r => r.id === selectedRoomId)?.title || t.selectRoom)}
                  </p>
                  <ChevronDown size={12} className={`text-gray-300 transition-transform ${showRoomDropdown ? 'rotate-180 text-hotel-primary' : ''}`} />
                </div>
              </div>
            </div>

            {showRoomDropdown && (
              <div className="absolute top-full left-0 right-0 z-[150] mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[300px] overflow-y-auto no-scrollbar">
                <div 
                  onClick={() => { setSelectedRoomId('all'); setShowRoomDropdown(false); }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 ${selectedRoomId === 'all' ? 'bg-blue-50/20' : ''}`}
                >
                  <div className="text-left">
                    <p className="text-[11px] font-black text-gray-900">{t.allRooms}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{t.allCategories}</p>
                  </div>
                  <Sparkles size={14} className="text-hotel-primary" />
                </div>
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
                    <p className="text-[10px] font-sans font-black text-hotel-primary">৳{formatNumber(room.discountPrice)}</p>
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
                <p className="text-sm font-black text-gray-900">{formatNumber(checkInDisplay.day)} {checkInDisplay.month}</p>
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
                <p className="text-sm font-black text-gray-900">{formatNumber(checkOutDisplay.day)} {checkOutDisplay.month}</p>
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

        {/* Categories / Shortcuts below search - Modern Restaurant Style */}
        <div className="hidden lg:flex w-full max-w-5xl flex-wrap justify-center items-start gap-10">
          <button 
            onClick={() => toggleCategory('all')}
            className="flex flex-col items-center gap-3 group transition-all active:scale-95"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
              activeCategories.includes('all') 
              ? 'bg-hotel-primary text-white border-hotel-primary shadow-xl shadow-red-100 scale-110' 
              : 'bg-white text-gray-400 border-gray-100 group-hover:border-hotel-primary group-hover:text-hotel-primary'
            }`}>
              <Sparkles size={28} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeCategories.includes('all') ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`}>
              {t.allCategories}
            </span>
          </button>

          {shortcuts.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleCategory(item.id)}
              className="flex flex-col items-center gap-3 group transition-all active:scale-95"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
                activeCategories.includes(item.id) 
                ? 'bg-hotel-primary text-white border-hotel-primary shadow-xl shadow-red-100 scale-110' 
                : 'bg-white text-gray-400 border-gray-100 group-hover:border-hotel-primary group-hover:text-hotel-primary'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeCategories.includes(item.id) ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full px-4 mt-6">
           <button 
             onClick={() => setShowMobileFilters(true)}
             className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 py-4 rounded-xl transition-all border border-gray-200 shadow-sm"
           >
              <Filter size={18} className="text-gray-500" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">{t.filter}</span>
           </button>
        </div>

        {/* Mobile Filter Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Select Category</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronDown size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                <button 
                  onClick={() => { toggleCategory('all'); setShowMobileFilters(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    activeCategories.includes('all') 
                    ? 'bg-hotel-primary/5 border-hotel-primary text-hotel-primary' 
                    : 'bg-white border-gray-100 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">{t.allCategories}</span>
                  </div>
                  {activeCategories.includes('all') && <Check size={18} strokeWidth={3} />}
                </button>

                {shortcuts.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { toggleCategory(item.id); setShowMobileFilters(false); }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      activeCategories.includes(item.id) 
                      ? 'bg-hotel-primary/5 border-hotel-primary text-hotel-primary' 
                      : 'bg-white border-gray-100 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    {activeCategories.includes(item.id) && <Check size={18} strokeWidth={3} />}
                  </button>
                ))}
              </div>

              <div className="p-6 bg-gray-50">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-yellow-100 transition-all active:scale-95"
                >
                  {t.filter}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-hotel-primary/5 rounded-full blur-[80px] md:blur-[150px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;

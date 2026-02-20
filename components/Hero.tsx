
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Loader2, Search, Bed, Utensils, Map as MapIcon, 
  Calendar, Users, ChevronDown, Moon, ShieldCheck, Key,
  Tag, MessageSquare, History, Sparkles, MapPin, ExternalLink,
  ArrowRight, Play, Star
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
    navigate(`/rooms?category=${selectedRoomId}&checkIn=${checkIn}&checkOut=${checkOut}`);
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

  const shortcuts = [
    { id: 'rooms', label: 'Our Rooms', icon: <Bed size={18} />, path: '/rooms', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'offers', label: 'Offers', icon: <Tag size={18} />, path: '/offers', color: 'text-hotel-primary', bg: 'bg-red-50' },
    { id: 'restaurants', label: 'Dining', icon: <Utensils size={18} />, path: '/restaurants', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'guide', label: 'Guide', icon: <MapIcon size={18} />, path: '/guide', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'mystays', label: 'History', icon: <History size={18} />, path: '/mystays', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'helpdesk', label: 'Support', icon: <MessageSquare size={18} />, path: '/helpdesk', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const selectedRoom = ROOMS_DATA.find(r => r.id === selectedRoomId);
  const checkInDisplay = formatDateLabel(checkIn);
  const checkOutDisplay = formatDateLabel(checkOut);

  return (
    <section id="hero-section" className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-10 w-full overflow-hidden bg-[#050505]">
      {/* Background Image Layer with Parallax-like Zoom */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover" 
          alt="Hotel Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95"></div>
      </motion.div>
      
      {isEditMode && (
        <div className="absolute top-24 right-4 md:right-10 z-20">
          <label className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-white" size={14} /> : <Camera size={14} className="text-white" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Update Background</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        
        {/* Floating Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">
            <Star size={12} className="text-hotel-primary fill-hotel-primary" />
            #1 Luxury Stay in Sylhet
          </div>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <div className="mb-12 text-center max-w-4xl">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white text-5xl md:text-8xl font-serif font-black mb-6 leading-[0.9] tracking-tighter"
          >
            {config.title.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-4 last:mr-0">
                {word === 'Luxury' ? <span className="text-hotel-primary">{word}</span> : word}
              </span>
            ))}
          </motion.h1>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto italic">
              {isEditMode ? (
                <textarea 
                  className="bg-transparent border-b border-white/20 outline-none w-full text-center resize-none h-16 text-white"
                  value={config.subtitle}
                  onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
                />
              ) : `"${config.subtitle}"`}
            </p>
          </motion.div>
        </div>

        {/* Refined Booking Widget */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden mb-16"
        >
          <div className="flex flex-col lg:flex-row items-stretch">
            
            {/* Room Selection */}
            <div className="relative flex-[1.2] border-b lg:border-b-0 lg:border-r border-gray-100">
              <div 
                onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                className="p-8 flex items-center h-full group cursor-pointer hover:bg-gray-50 transition-all"
              >
                <div className="w-12 h-12 bg-hotel-primary/10 rounded-2xl flex items-center justify-center mr-5 shrink-0">
                  <Key size={22} className="text-hotel-primary" />
                </div>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Experience</span>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-gray-900 truncate">
                      {selectedRoom?.title}
                    </p>
                    <ChevronDown size={14} className={`text-gray-300 transition-transform duration-300 ${showRoomDropdown ? 'rotate-180 text-hotel-primary' : ''}`} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showRoomDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar"
                  >
                    {ROOMS_DATA.map((room) => (
                      <div 
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setShowRoomDropdown(false);
                        }}
                        className={`p-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 ${selectedRoomId === room.id ? 'bg-hotel-primary/5' : ''}`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-900">{room.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{room.tag}</p>
                        </div>
                        <p className="text-xs font-sans font-black text-hotel-primary">৳{room.discountPrice}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Check-in */}
            <div 
              onClick={() => checkInRef.current?.showPicker()}
              className="relative flex-1 p-8 flex items-center h-full group cursor-pointer hover:bg-gray-50 transition-all border-b lg:border-b-0 lg:border-r border-gray-100"
            >
              <input 
                type="date" 
                ref={checkInRef}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none" 
              />
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-white transition-all">
                <Calendar size={22} className="text-gray-400 group-hover:text-hotel-primary" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-black text-gray-900">{checkInDisplay.day} {checkInDisplay.month}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{checkInDisplay.weekday}</p>
                </div>
              </div>
            </div>

            {/* Check-out */}
            <div 
              onClick={() => checkOutRef.current?.showPicker()}
              className="relative flex-1 p-8 flex items-center h-full group cursor-pointer hover:bg-gray-50 transition-all border-b lg:border-b-0 lg:border-r border-gray-100"
            >
              <input 
                type="date" 
                ref={checkOutRef}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none" 
              />
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-white transition-all">
                <Moon size={22} className="text-gray-400 group-hover:text-hotel-primary" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-out</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-black text-gray-900">{checkOutDisplay.day} {checkOutDisplay.month}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{checkOutDisplay.weekday}</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={handleSearch}
              className="bg-hotel-primary hover:bg-[#B22222] text-white px-12 py-8 lg:py-0 flex items-center justify-center transition-all active:scale-95 gap-3 shrink-0"
            >
              <span className="text-xs font-black uppercase tracking-[0.2em]">Check Vacancy</span>
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </motion.div>

        {/* Section Shortcuts */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {shortcuts.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center group"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-hotel-primary group-hover:scale-110 mb-3 border border-white/10 group-hover:border-hotel-primary`}>
                   <div className={`text-white/60 group-hover:text-white transition-colors`}>
                     {item.icon}
                   </div>
                </div>
                <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-widest transition-colors text-center">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16"
        >
          <a 
            href="https://maps.app.goo.gl/NonEKgvUTbKvvkxTA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group"
          >
            <MapPin size={16} className="text-hotel-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Kumargaon Bus Terminal, Sylhet</span>
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>

      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-hotel-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default Hero;

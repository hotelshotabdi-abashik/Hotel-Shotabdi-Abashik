
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronRight, Zap, Camera, Loader2, 
  MapPin, Calendar, Users, Search, Bed, Utensils, 
  Map as MapIcon, HelpCircle, Briefcase, Info, 
  Settings, ChevronDown, RotateCw, Globe, Coffee, PhoneCall
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
  const [activeTab, setActiveTab] = useState('Hotel');
  const [stayType, setStayType] = useState('Standard');

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
    { id: 'Hotel', icon: <Bed size={18} />, path: '/rooms' },
    { id: 'Dining', icon: <Utensils size={18} />, path: '/restaurants' },
    { id: 'Guide', icon: <MapIcon size={18} />, path: '/guide' },
    { id: 'Help', icon: <PhoneCall size={18} />, action: () => window.location.href = 'tel:+8801717425702' },
    { id: 'Policy', icon: <Info size={18} />, path: '/privacypolicy' },
  ];

  const handleTabClick = (tab: any) => {
    setActiveTab(tab.id);
    if (tab.action) {
      tab.action();
    } else if (tab.path && tab.id !== 'Hotel') {
      navigate(tab.path);
    }
  };

  return (
    <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background with Professional Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-30 grayscale" 
          alt="Hotel Exterior"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A192F]/80 to-[#0A192F]"></div>
      </div>
      
      {isEditMode && (
        <div className="absolute top-10 right-10 z-20">
          <label className="flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-white transition-all">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={16} /> : <Camera size={16} className="text-hotel-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Change Canvas</span>
          </label>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Screenshot Style Floating Card */}
        <div className="bg-white rounded-[1rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in">
          
          {/* Top Horizontal Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar border-b border-gray-100 bg-white px-2 md:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3 px-6 py-5 text-[11px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}>{tab.icon}</span>
                {tab.id}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Stay Type Selectors */}
            <div className="flex flex-wrap items-center gap-4">
              {['Standard', 'Family Stay', 'Corporate'].map((type) => (
                <button
                  key={type}
                  onClick={() => setStayType(type)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    stayType === type 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${stayType === type ? 'border-white' : 'border-gray-300'}`}>
                    {stayType === type && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  {type}
                </button>
              ))}

              <div className="ml-auto hidden lg:flex gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-colors">
                  1 Traveller <ChevronDown size={14} />
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-colors">
                  Economy <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Logical Booking Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Physical Name Input */}
              <div className="lg:col-span-3 p-5 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-5 h-full">
                  <div className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">SYL</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate">Sylhet, Kumargaon</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-tighter">Bus Stand Area</p>
                  </div>
                </div>
              </div>

              {/* Swap Visual Link */}
              <div className="hidden lg:flex items-center justify-center -mx-4 z-20">
                <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                  <RotateCw size={16} />
                </div>
              </div>

              {/* Map Code / Code Input */}
              <div className="lg:col-span-3 p-5 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-5 h-full">
                  <div className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">GPS</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate">WR6H+Q2P</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-tighter">Sylhet 3100, BD</p>
                  </div>
                </div>
              </div>

              {/* Check-In Date */}
              <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-5 h-full">
                  <div className="text-2xl font-black text-gray-900">28</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate">May</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-tighter">Friday, 2024</p>
                  </div>
                </div>
              </div>

              {/* Check-Out Date */}
              <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-5 h-full">
                  <div className="text-2xl font-black text-gray-900">30</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate">May</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-tighter">Sunday, 2024</p>
                  </div>
                </div>
              </div>

              {/* Action Button (Orange) */}
              <div className="lg:col-span-2 p-3 bg-white">
                <button 
                  onClick={() => navigate('/rooms')}
                  className="w-full h-full bg-[#FF7000] hover:bg-[#E66400] text-white rounded-xl flex items-center justify-center transition-all shadow-xl shadow-orange-100 py-6 lg:py-0 active:scale-95"
                >
                  <Search size={32} strokeWidth={3} />
                </button>
              </div>

            </div>

            {/* Bottom Fare Options (Shortcut Rates) */}
            <div className="flex flex-wrap gap-10 pt-4">
              {[
                { label: 'Regular Fare', selected: true },
                { label: 'Student Fare', selected: false },
                { label: 'Umrah Fare', selected: false }
              ].map((fare) => (
                <label key={fare.label} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    fare.selected ? 'border-blue-600 bg-blue-600 shadow-md ring-4 ring-blue-50' : 'border-gray-200 group-hover:border-blue-600'
                  }`}>
                    {fare.selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${fare.selected ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-700'}`}>
                    {fare.label}
                  </span>
                </label>
              ))}
            </div>

          </div>
        </div>

        {/* Brand Presence Text */}
        <div className="mt-20 text-center lg:text-left animate-fade-in delay-200">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7000] animate-pulse"></span>
            <span className="text-[11px] font-black text-white/90 uppercase tracking-[0.3em]">Premium Residential Service</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-sans font-black text-white leading-[1] mb-6 tracking-tighter">
            {isEditMode ? (
              <input 
                className="bg-transparent border-b-4 border-blue-600 outline-none w-full"
                value={config.title}
                onChange={(e) => onUpdate?.({ title: e.target.value })}
              />
            ) : config.title}
          </h2>
          <p className="text-xl text-white/50 max-w-2xl leading-relaxed font-light">
             {isEditMode ? (
              <input 
                className="bg-transparent border-b border-white/20 outline-none w-full"
                value={config.subtitle}
                onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
              />
            ) : config.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

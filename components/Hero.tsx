
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronRight, Zap, Camera, Loader2, 
  MapPin, Calendar, Users, Search, Bed, Utensils, 
  Map as MapIcon, HelpCircle, Briefcase, Info, 
  Settings, ChevronDown, RotateCw
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
  const [tripType, setTripType] = useState('Standard');

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
    { id: 'Hotel', icon: <Bed size={18} /> },
    { id: 'Dining', icon: <Utensils size={18} /> },
    { id: 'Guide', icon: <MapIcon size={18} /> },
    { id: 'Support', icon: <HelpCircle size={18} /> },
    { id: 'Corporate', icon: <Briefcase size={18} /> },
  ];

  return (
    <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-40 grayscale" 
          alt="Shotabdi Exterior"
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
        {/* Floating Booking Card (Screenshot Style) */}
        <div className="bg-white rounded-[1rem] shadow-2xl overflow-hidden animate-fade-in">
          
          {/* Tabs Header */}
          <div className="flex items-center overflow-x-auto no-scrollbar border-b border-gray-100 bg-white px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-hotel-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                {tab.id}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-hotel-primary rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Trip Type Options */}
            <div className="flex flex-wrap gap-4">
              {['Standard', 'Long Stay', 'Group'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                    tripType === type 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${tripType === type ? 'bg-white border-white' : 'border-gray-300'}`}></div>
                  {type}
                </button>
              ))}

              <div className="ml-auto hidden lg:flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  1 Guest <ChevronDown size={14} />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  Economy <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Main Booking Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gray-100 rounded-xl overflow-hidden">
              
              {/* Location 1 */}
              <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4 h-full">
                  <div className="text-xl font-black text-gray-900 group-hover:text-hotel-primary transition-colors">SYL</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">Sylhet, Kumargaon</p>
                    <p className="text-[9px] text-gray-400 font-medium truncate uppercase tracking-tighter">Bus Stand Area</p>
                  </div>
                </div>
              </div>

              {/* Swap Button (Purely Visual for style) */}
              <div className="hidden lg:flex items-center justify-center -mx-4 z-20">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
                  <RotateCw size={14} />
                </div>
              </div>

              {/* Location 2 (Map Code) */}
              <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4 h-full">
                  <div className="text-xl font-black text-gray-900 group-hover:text-hotel-primary transition-colors">MAP</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">WR6H+Q2P</p>
                    <p className="text-[9px] text-gray-400 font-medium truncate uppercase tracking-tighter">Sylhet 3100, BD</p>
                  </div>
                </div>
              </div>

              {/* Check-In */}
              <div className="lg:col-span-2 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 h-full">
                  <div className="text-xl font-black text-gray-900">24</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">May</p>
                    <p className="text-[9px] text-gray-400 font-medium truncate uppercase tracking-tighter">Friday, 2024</p>
                  </div>
                </div>
              </div>

              {/* Check-Out */}
              <div className="lg:col-span-2 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 h-full">
                  <div className="text-xl font-black text-gray-900">26</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">May</p>
                    <p className="text-[9px] text-gray-400 font-medium truncate uppercase tracking-tighter">Sunday, 2024</p>
                  </div>
                </div>
              </div>

              {/* Search Button (Orange) */}
              <div className="lg:col-span-2 p-2 bg-white">
                <button 
                  onClick={() => navigate('/rooms')}
                  className="w-full h-full bg-[#FF7000] hover:bg-[#E66400] text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-orange-100 py-6 lg:py-0"
                >
                  <Search size={28} strokeWidth={3} />
                </button>
              </div>

            </div>

            {/* Bottom Fare Toggles */}
            <div className="flex flex-wrap gap-6 pt-2">
              {['Regular Fare', 'Group Fare', 'Corporate Rate'].map((fare) => (
                <label key={fare} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                    {fare === 'Regular Fare' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">{fare}</span>
                </label>
              ))}
            </div>

          </div>
        </div>

        {/* Textual Overlay (Optional but kept for context if needed) */}
        <div className="mt-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF7000] animate-pulse"></span>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Premium Residential Hub</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-sans font-black text-white leading-[1.1] mb-4">
            {isEditMode ? (
              <input 
                className="bg-transparent border-b-2 border-hotel-primary outline-none w-full"
                value={config.title}
                onChange={(e) => onUpdate?.({ title: e.target.value })}
              />
            ) : config.title}
          </h2>
          <p className="text-lg text-white/60 max-w-xl leading-relaxed font-light">
             {isEditMode ? (
              <input 
                className="bg-transparent border-b border-white/30 outline-none w-full"
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

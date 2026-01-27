import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Loader2, Search, Bed, Utensils, Map as MapIcon, 
  Sparkles, Calendar, Users, ChevronDown, Repeat, MousePointer2
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
  const [stayType, setStayType] = useState('round');

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
    { id: 'hotel', label: 'Hotel', icon: <Bed size={18} />, path: '/rooms' },
    { id: 'dining', label: 'Dining', icon: <Utensils size={18} />, path: '/restaurants' },
    { id: 'guide', label: 'Guide', icon: <MapIcon size={18} />, path: '/guide' },
    { id: 'concierge', label: 'Concierge', icon: <Sparkles size={18} />, path: '/' }
  ];

  return (
    <section className="relative min-h-[75vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-60" 
          alt="Hotel Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/20 via-transparent to-[#0A192F]/80"></div>
      </div>
      
      {isEditMode && (
        <div className="absolute top-24 right-10 z-20">
          <label className="flex items-center gap-3 bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl shadow-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all transform hover:scale-105 active:scale-95">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={16} /> : <Camera size={16} className="text-hotel-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Customize Canvas</span>
          </label>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Simple Header Text */}
        <div className="mb-10 text-center animate-fade-in max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-sans font-black text-white leading-tight mb-4 tracking-tighter drop-shadow-lg">
            {isEditMode ? (
              <input 
                className="bg-transparent border-b-2 border-hotel-primary outline-none text-center"
                value={config.title}
                onChange={(e) => onUpdate?.({ title: e.target.value })}
              />
            ) : (config.title || "Luxury Awaits You")}
          </h2>
          <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed opacity-90 px-4">
            {isEditMode ? (
              <textarea 
                className="bg-transparent border-b border-white/20 outline-none w-full text-center resize-none h-20"
                value={config.subtitle}
                onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
              />
            ) : "Provides 24-hour front desk and room services, along with high-speed free Wi-Fi and free parking"}
          </p>
        </div>

        {/* The Exact Screenshot-style Booking Widget */}
        <div className="w-full max-w-6xl bg-white rounded-[1rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-gray-200/20 overflow-hidden animate-fade-in">
          
          {/* Top Icons Tab Bar */}
          <div className="flex border-b border-gray-100/60 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); navigate(tab.path); }}
                className={`flex items-center gap-2.5 px-8 py-5 transition-all relative whitespace-nowrap group ${
                  activeTab === tab.id ? 'text-[#006CE4]' : 'text-[#475467] hover:text-[#006CE4]'
                }`}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="text-[13px] font-bold tracking-tight">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-[15%] right-[15%] h-[3px] bg-[#FD8D14] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Trip Type & Guest Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                {[
                  { id: 'one', label: 'One Way' },
                  { id: 'round', label: 'Round Trip' },
                  { id: 'multi', label: 'Multi City' }
                ].map((type) => (
                  <label key={type.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all border ${
                    stayType === type.id ? 'bg-[#E8F0FE] border-transparent' : 'bg-[#F2F4F7] border-transparent hover:bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      stayType === type.id ? 'border-[#006CE4] bg-[#006CE4]' : 'border-gray-300'
                    }`}>
                      {stayType === type.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={stayType === type.id} 
                      onChange={() => setStayType(type.id)} 
                    />
                    <span className={`text-[12px] font-bold ${stayType === type.id ? 'text-[#006CE4]' : 'text-[#475467]'}`}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="ml-auto flex gap-3">
                <button className="flex items-center gap-2 bg-[#E8F0FE] text-[#006CE4] px-5 py-2.5 rounded-lg text-[13px] font-bold border border-[#D1E9FF] hover:bg-[#D1E9FF] transition-all">
                  1 Guest <ChevronDown size={14} />
                </button>
                <button className="flex items-center gap-2 bg-[#E8F0FE] text-[#006CE4] px-5 py-2.5 rounded-lg text-[13px] font-bold border border-[#D1E9FF] hover:bg-[#D1E9FF] transition-all">
                  Deluxe <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Main Functional Search Input Row */}
            <div className="flex flex-col lg:flex-row gap-0.5 items-stretch bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              {/* From Box (Hotel) */}
              <div className="flex-1 bg-white p-5 flex items-center group cursor-pointer hover:bg-blue-50/30 transition-all border-r border-gray-100">
                <div className="flex flex-col items-start">
                  <span className="text-xl font-black text-[#1D2939] leading-none mb-1">SYL</span>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#475467]">Sylhet</p>
                    <p className="text-[10px] text-[#98A2B3] font-medium">Hotel Shotabdi Abashik</p>
                  </div>
                </div>
                <div className="ml-auto bg-[#F2F4F7] p-2.5 rounded-full text-[#98A2B3] group-hover:bg-[#E8F0FE] group-hover:text-[#006CE4] transition-all rotate-90 lg:rotate-0">
                  <Repeat size={18} />
                </div>
              </div>

              {/* To Box (Landmark/Guide) */}
              <div className="flex-1 bg-white p-5 flex items-center group cursor-pointer hover:bg-blue-50/30 transition-all border-r border-gray-100">
                <div className="flex flex-col items-start">
                  <span className="text-xl font-black text-[#1D2939] leading-none mb-1">CITY</span>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#475467]">Where to?</p>
                    <p className="text-[10px] text-[#98A2B3] font-medium">Select Sylhet Landmarks</p>
                  </div>
                </div>
              </div>

              {/* Date Pickers (Check-in/Check-out) */}
              <div className="flex-[1.4] flex items-stretch gap-0.5">
                <div className="flex-1 bg-white p-5 flex items-center cursor-pointer hover:bg-blue-50/30 transition-all border-r border-gray-100">
                  <div className="text-left">
                    <span className="text-2xl font-black text-[#1D2939] leading-none block mb-1">28</span>
                    <p className="text-[13px] font-bold text-[#475467]">January</p>
                    <p className="text-[10px] text-[#98A2B3] font-medium">Wednesday, 2026</p>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 flex items-center cursor-pointer hover:bg-blue-50/30 transition-all">
                  <div className="text-left">
                    <span className="text-2xl font-black text-[#1D2939] leading-none block mb-1">30</span>
                    <p className="text-[13px] font-bold text-[#475467]">January</p>
                    <p className="text-[10px] text-[#98A2B3] font-medium">Friday, 2026</p>
                  </div>
                </div>
              </div>

              {/* Precise Search Button from Image */}
              <button 
                onClick={() => navigate('/rooms')}
                className="bg-[#FD8D14] hover:bg-[#E67E12] text-white w-full lg:w-20 rounded-r-none lg:rounded-r-2xl flex items-center justify-center transition-all p-6 lg:p-0 active:scale-95 shadow-inner"
              >
                <Search size={34} strokeWidth={3} />
              </button>
            </div>

            {/* Bottom Row Selectors (Fare Style) */}
            <div className="flex flex-wrap gap-10 mt-8">
              {[
                { id: 'reg', label: 'Regular Stay' },
                { id: 'mem', label: 'Member Rate' },
                { id: 'group', label: 'Group Booking' }
              ].map((rate) => (
                <label key={rate.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    rate.id === 'reg' ? 'border-[#006CE4] bg-[#006CE4]' : 'border-gray-200 group-hover:border-gray-400'
                  }`}>
                    {rate.id === 'reg' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-[13px] font-bold tracking-tight ${rate.id === 'reg' ? 'text-[#1D2939]' : 'text-[#475467]'}`}>
                    {rate.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Quick Action */}
        <div className="mt-12 flex items-center gap-6 animate-bounce">
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                    <ChevronDown size={20} />
                </div>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Scroll Down</span>
            </div>
        </div>
      </div>
      
      {/* Decorative Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hotel-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </section>
  );
};

export default Hero;
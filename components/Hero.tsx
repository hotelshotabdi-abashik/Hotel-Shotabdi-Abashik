
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Bed, Utensils, Compass, Calendar, Users, Search, MapPin, Building2, ShieldCheck, Wifi, Camera
} from 'lucide-react';
import { HeroConfig } from '../types';

interface HeroProps {
  config: HeroConfig;
  isEditMode?: boolean;
  onUpdate?: (newConfig: Partial<HeroConfig>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const Hero: React.FC<HeroProps> = ({ config, isEditMode, onUpdate, onImageUpload }) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('2024-05-24');
  const [checkOut, setCheckOut] = useState('2024-05-26');
  const [guests, setGuests] = useState('2 Adults, 1 Room');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setIsUploading(true);
      const url = await onImageUpload(file);
      onUpdate?.({ backgroundImage: url });
      setIsUploading(false);
    }
  };

  return (
    <section className="relative pt-6 md:pt-10 pb-16 md:pb-20 px-3 md:px-10 bg-[#F2F6F9] w-full overflow-hidden">
      {/* Background with Edit Capability */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img src={config.backgroundImage} className="w-full h-full object-cover" />
        {isEditMode && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group transition-all">
            <input type="file" className="hidden" onChange={handleImageChange} />
            <div className="bg-white p-4 rounded-full text-hotel-primary shadow-xl group-hover:scale-110 transition-transform">
              {isUploading ? <span className="animate-spin inline-block">⏳</span> : <Camera size={24} />}
            </div>
          </label>
        )}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Header with Edit Capability */}
        <div className="mb-10 text-center lg:text-left">
          {isEditMode ? (
            <textarea 
              className="text-4xl md:text-6xl font-serif font-black text-gray-900 bg-white/50 border-b-2 border-hotel-primary outline-none w-full resize-none"
              value={config.title}
              onChange={(e) => onUpdate?.({ title: e.target.value })}
            />
          ) : (
            <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 leading-tight">{config.title}</h1>
          )}
          
          {isEditMode ? (
            <input 
              className="text-lg text-gray-500 mt-4 bg-white/50 border-b border-gray-300 outline-none w-full"
              value={config.subtitle}
              onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
            />
          ) : (
            <p className="text-lg text-gray-500 mt-4 max-w-2xl">{config.subtitle}</p>
          )}
        </div>

        {/* Search Logic */}
        <div className="bg-white rounded-[1.5rem] shadow-xl p-5 md:p-10 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
            <div className="lg:col-span-4 bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
              <Building2 size={18} className="text-hotel-primary" />
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Location</span>
                <p className="text-sm font-black text-hotel-text">Sylhet HQ District</p>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col justify-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In</span>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="bg-transparent text-xs font-black outline-none" />
              </div>
              <div className="bg-gray-50 p-4 flex flex-col justify-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Out</span>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="bg-transparent text-xs font-black outline-none" />
              </div>
            </div>

            <button 
              onClick={() => navigate('/rooms')}
              className="lg:col-span-3 bg-hotel-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-100 py-4"
            >
              {isEditMode ? (
                <input 
                  className="bg-transparent border-none text-center outline-none w-full text-white cursor-text"
                  value={config.buttonText}
                  onChange={(e) => onUpdate?.({ buttonText: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

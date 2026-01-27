
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronRight, Zap, Camera, Loader2
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

  return (
    <section className="relative pt-6 md:pt-10 pb-16 md:pb-20 px-3 md:px-10 bg-[#F2F6F9] w-full overflow-hidden">
      {/* Background with Subtle Pattern & Edit Capability */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover grayscale" 
          alt="background"
        />
      </div>
      
      {isEditMode && (
        <div className="absolute top-10 right-10 z-20">
          <label className="flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-white transition-all">
            <input type="file" className="hidden" onChange={handleImageChange} />
            {isUploading ? <Loader2 className="animate-spin text-hotel-primary" size={16} /> : <Camera size={16} className="text-hotel-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Change Hero Image</span>
          </label>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-hotel-primary animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Now Accepting Bookings</span>
          </div>
          
          {isEditMode ? (
            <textarea 
              className="text-4xl md:text-7xl font-serif font-black text-gray-900 bg-white/50 border-b-2 border-hotel-primary outline-none w-full resize-none p-2 rounded-xl mb-4 leading-[1.1]"
              value={config.title}
              onChange={(e) => onUpdate?.({ title: e.target.value })}
            />
          ) : (
            <h1 className="text-4xl md:text-7xl font-serif font-black text-gray-900 leading-[1.1] mb-6">
              {config.title.split('Reimagined')[0]} 
              <span className="text-hotel-primary">Reimagined</span> 
              {config.title.split('Reimagined')[1]}
            </h1>
          )}
          
          {isEditMode ? (
            <input 
              className="text-lg text-gray-500 bg-white/50 border-b border-gray-300 outline-none w-full p-2 rounded-xl"
              value={config.subtitle}
              onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
            />
          ) : (
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed font-light">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Search Logic */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] p-4 md:p-6 border border-gray-50 group hover:shadow-[0_40px_120px_rgba(229,57,53,0.12)] transition-all duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
            <div className="lg:col-span-4 bg-gray-50 rounded-[1.5rem] p-5 flex items-center gap-5 border border-transparent group-hover:border-gray-100 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-hotel-primary">
                <Building2 size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Location</span>
                <p className="text-sm font-black text-hotel-text">Sylhet HQ District</p>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-gray-100 rounded-[1.5rem] overflow-hidden border border-transparent group-hover:border-gray-100 transition-all">
              <div className="bg-gray-50 p-5 flex flex-col justify-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check In</span>
                <input type="date" className="bg-transparent text-xs font-black outline-none cursor-pointer" defaultValue="2024-05-24" />
              </div>
              <div className="bg-gray-50 p-5 flex flex-col justify-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check Out</span>
                <input type="date" className="bg-transparent text-xs font-black outline-none cursor-pointer" defaultValue="2024-05-26" />
              </div>
            </div>

            <button 
              onClick={() => navigate('/rooms')}
              className="lg:col-span-3 bg-hotel-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-hotel-secondary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 py-6 lg:py-0"
            >
              {isEditMode ? (
                <input 
                  className="bg-transparent border-none text-center outline-none w-full text-white cursor-text"
                  value={config.buttonText}
                  onChange={(e) => onUpdate?.({ buttonText: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : <>{config.buttonText} <ChevronRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, ChevronRight } from 'lucide-react';
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
    <section className="relative min-h-[70vh] flex items-center pt-20 pb-32 px-4 md:px-10 w-full overflow-hidden bg-[#0A192F]">
      {/* Background with Professional Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={config.backgroundImage} 
          className="w-full h-full object-cover opacity-40 grayscale" 
          alt="Hotel Exterior"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/60 via-[#0A192F]/80 to-[#0A192F]"></div>
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

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="max-w-3xl animate-fade-in">
          <h2 className="text-5xl md:text-8xl font-sans font-black text-white leading-[0.95] mb-8 tracking-tighter">
            {isEditMode ? (
              <input 
                className="bg-transparent border-b-4 border-hotel-primary outline-none w-full"
                value={config.title}
                onChange={(e) => onUpdate?.({ title: e.target.value })}
              />
            ) : config.title}
          </h2>
          
          <p className="text-xl md:text-2xl text-white/60 mb-12 leading-relaxed font-light">
             {isEditMode ? (
              <textarea 
                className="bg-transparent border-b border-white/20 outline-none w-full resize-none h-24"
                value={config.subtitle}
                onChange={(e) => onUpdate?.({ subtitle: e.target.value })}
              />
            ) : config.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={() => navigate('/rooms')}
              className="px-10 py-6 bg-hotel-primary hover:bg-hotel-secondary text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-red-900/40 flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              Explore Our Rooms <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="tel:+8801717425702"
              className="px-10 py-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
            >
              Contact Reception
            </a>
          </div>
        </div>
      </div>
      
      {/* Aesthetic Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
    title: "Elite Hospitality",
    subtitle: "Experience the pinnacle of luxury in the heart of Sylhet."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
    title: "Premium Suites",
    subtitle: "Designed for comfort, crafted for excellence."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    title: "Authentic Dining",
    subtitle: "Savor the flavors of Sylhet in our signature restaurants."
  }
];

const VisualDiscovery: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden group cursor-none md:cursor-default"
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={SLIDES[current].image}
            alt={SLIDES[current].title}
            className="w-full h-full object-cover"
            style={{
              x: mousePos.x,
              y: mousePos.y,
              scale: 1.1
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-20 z-10">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-hotel-primary" />
            <span className="text-[10px] font-black text-hotel-primary uppercase tracking-[0.5em]">Shotabdi Elite</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-tight">
            {SLIDES[current].title}
          </h2>
          <p className="text-lg text-white/70 font-medium mb-10 leading-relaxed">
            {SLIDES[current].subtitle}
          </p>
          
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-white/50">
                <MapPin size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sylhet, Bangladesh</span>
             </div>
             <div className="flex items-center gap-2 text-white/50">
                <Sparkles size={16} className="text-hotel-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">5-Star Standards</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-4 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-1.5 transition-all duration-500 rounded-full ${
              current === idx ? 'h-12 bg-hotel-primary' : 'h-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* 3D Tilt Overlay (Subtle) */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 z-30" />
    </div>
  );
};

export default VisualDiscovery;

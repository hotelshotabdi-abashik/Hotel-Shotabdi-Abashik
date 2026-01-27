
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Plus, Trash2, Camera } from 'lucide-react';
import { Offer } from '../types';

interface Props {
  offers: Offer[];
  isEditMode?: boolean;
  onUpdate?: (offers: Offer[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const ExclusiveOffers: React.FC<Props> = ({ offers = [], isEditMode, onUpdate, onImageUpload }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-play logic
  useEffect(() => {
    if (isEditMode || offers.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (offers.length - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, [offers.length, isEditMode]);

  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
      scrollRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const deleteOffer = (id: string) => {
    if (window.confirm("Delete this offer?")) {
      onUpdate?.(offers.filter(o => o.id !== id));
    }
  };

  const addOffer = () => {
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: "New Exclusive Offer",
      description: "Enter a detailed description here (up to 400 words). This will appear on the dedicated offer page.",
      mediaUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      mediaType: 'image',
      ctaText: "View Details"
    };
    onUpdate?.([...offers, newOffer]);
  };

  const updateOffer = (id: string, field: keyof Offer, value: any) => {
    const updated = offers.map(o => o.id === id ? { ...o, [field]: value } : o);
    onUpdate?.(updated);
  };

  const handleMediaUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      try {
        const url = await onImageUpload(file);
        updateOffer(id, 'mediaUrl', url);
        updateOffer(id, 'mediaType', file.type.startsWith('video') ? 'video' : 'image');
      } catch (err) {
        alert("Upload failed");
      }
    }
  };

  return (
    <section className="py-20 bg-gray-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-hotel-primary font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">Opportunities</span>
            <h2 className="text-3xl md:text-5xl font-sans text-gray-900 font-black tracking-tighter">Exclusive Offers</h2>
          </div>
          <div className="flex gap-3">
            {isEditMode && (
              <button 
                onClick={addOffer}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-hotel-primary transition-all"
              >
                <Plus size={16} /> New Offer
              </button>
            )}
            {offers.length > 3 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="p-3 rounded-full border border-gray-200 bg-white hover:border-hotel-primary hover:text-hotel-primary transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(offers.length - 3, prev + 1))}
                  className="p-3 rounded-full border border-gray-200 bg-white hover:border-hotel-primary hover:text-hotel-primary transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-hidden no-scrollbar"
        >
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] group"
            >
              <div className="bg-white rounded-[1rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 h-full flex flex-col">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  {offer.mediaType === 'video' ? (
                    <video src={offer.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img src={offer.mediaUrl} className="w-full h-full object-cover" alt={offer.title} />
                  )}
                  
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-white p-3 rounded-xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all">
                        <input type="file" className="hidden" onChange={(e) => handleMediaUpload(offer.id, e)} />
                        <Camera size={18} />
                      </label>
                      <button 
                        onClick={() => deleteOffer(offer.id)}
                        className="bg-white p-3 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black text-hotel-primary uppercase tracking-widest shadow-sm">
                      {offer.mediaType === 'video' ? <Play size={10} className="inline mr-1" /> : <ImageIcon size={10} className="inline mr-1" />}
                      Exclusive
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {isEditMode ? (
                    <input 
                      className="text-lg font-black text-[#B22222] border-b border-gray-100 outline-none w-full mb-2"
                      value={offer.title}
                      onChange={(e) => updateOffer(offer.id, 'title', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-lg font-black text-[#B22222] mb-3 line-clamp-2 leading-tight">
                      {offer.title}
                    </h3>
                  )}

                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">
                    {offer.description}
                  </p>

                  <div className="mt-auto">
                    <Link 
                      to={`/offers/${offer.id}`}
                      className="inline-flex items-center gap-2 text-[#B22222] font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all"
                    >
                      {offer.ctaText} <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveOffers;

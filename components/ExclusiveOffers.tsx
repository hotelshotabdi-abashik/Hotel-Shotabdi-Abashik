
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Play, Image as ImageIcon, Plus, Trash2, Camera, 
  Tag, Clock, Settings2, ShieldCheck, X 
} from 'lucide-react';
import { Offer } from '../types';

interface Props {
  offers: Offer[];
  isEditMode?: boolean;
  claimedOfferId?: string | null;
  onClaim?: (offer: Offer) => void;
  onUpdate?: (offers: Offer[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const ExclusiveOffers: React.FC<Props> = ({ offers = [], isEditMode, claimedOfferId, onClaim, onUpdate, onImageUpload }) => {
  const navigate = useNavigate();
  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);

  // Initialize Swiper.js
  useEffect(() => {
    // Fix: Cast window to any to access Swiper property
    if (!(window as any).Swiper) return;
    
    // Fix: Swiper constructor accessed via cast window
    swiperRef.current = new (window as any).Swiper('.offers-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: offers.length > 3,
      autoplay: isEditMode ? false : {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });

    return () => {
      if (swiperRef.current) swiperRef.current.destroy();
    };
  }, [offers, isEditMode]);

  const deleteOffer = (id: string) => {
    if (window.confirm("Delete this offer permanently?")) {
      onUpdate?.(offers.filter(o => o.id !== id));
    }
  };

  const addOffer = () => {
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: "New Exclusive Season Deal",
      description: "Discover unmatched luxury with this limited time residential offer. Includes fiber-optic connectivity and priority lounge access.",
      mediaUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      mediaType: 'image',
      ctaText: "Claim Now",
      discountPercent: 10,
      isOneTime: true,
      startDate: Date.now(),
      endDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
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

  const activeOffer = offers.find(o => o.id === activeSettingsId);

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div className="max-w-xl">
            <span className="text-[#B22222] font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Limited Opportunities</span>
            <h2 className="text-4xl md:text-6xl font-sans text-gray-900 font-black tracking-tighter leading-tight">Exclusive Offers</h2>
          </div>
          <div className="flex gap-4 mb-4">
            {isEditMode && (
              <button 
                onClick={addOffer}
                className="bg-[#B22222] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:brightness-110 shadow-xl shadow-red-100 transition-all"
              >
                <Plus size={18} /> Add New Deal
              </button>
            )}
          </div>
        </div>

        <div className="swiper offers-swiper !overflow-visible">
          <div className="swiper-wrapper">
            {offers.map((offer) => (
              <div key={offer.id} className="swiper-slide h-auto">
                <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden group shadow-2xl bg-gray-100 transition-all duration-700 hover:-translate-y-2">
                  {offer.mediaType === 'video' ? (
                    <video src={offer.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img src={offer.mediaUrl} className="w-full h-full object-cover" alt={offer.title} />
                  )}
                  
                  {/* Media Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <span className="bg-[#B22222] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Tag size={12} /> {offer.discountPercent}% OFF
                    </span>
                    {offer.isOneTime && (
                      <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[8px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={10} /> One-Time Claim
                      </span>
                    )}
                  </div>

                  {/* Claim Button - Card View */}
                  <div className="absolute bottom-8 left-0 right-0 px-8 flex flex-col items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                     <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => onClaim?.(offer)}
                          disabled={claimedOfferId === offer.id}
                          className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl ${
                            claimedOfferId === offer.id 
                            ? 'bg-green-500 text-white cursor-default' 
                            : 'bg-white text-gray-900 hover:bg-[#B22222] hover:text-white'
                          }`}
                        >
                          {claimedOfferId === offer.id ? 'Already Claimed' : (offer.ctaText || 'Claim Now')}
                        </button>
                        <Link 
                          to={`/offers/${offer.id}`}
                          className="w-12 h-12 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl text-white hover:bg-white hover:text-[#B22222] transition-all"
                        >
                          <ChevronRight size={20} />
                        </Link>
                     </div>
                  </div>

                  {/* Admin Controls UI */}
                  {isEditMode && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2">
                      <button 
                        onClick={() => setActiveSettingsId(offer.id)}
                        className="bg-white/95 p-3 rounded-xl text-gray-700 hover:text-[#B22222] shadow-xl"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteOffer(offer.id)}
                        className="bg-red-600 p-3 rounded-xl text-white shadow-xl hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center gap-4">
             <div className="swiper-button-prev !static !w-12 !h-12 !mt-0 bg-gray-50 hover:bg-[#B22222] hover:text-white rounded-full transition-all after:!text-sm"></div>
             <div className="swiper-pagination !static !w-auto !flex items-center gap-2"></div>
             <div className="swiper-button-next !static !w-12 !h-12 !mt-0 bg-gray-50 hover:bg-[#B22222] hover:text-white rounded-full transition-all after:!text-sm"></div>
          </div>
        </div>
      </div>

      {/* Optimized Admin Modal for Offer Settings - No Inner Scroll */}
      {activeSettingsId && isEditMode && activeOffer && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#B22222]/10 rounded-xl flex items-center justify-center text-[#B22222]">
                    <Settings2 size={20} />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Offer Configuration</h3>
              </div>
              <button onClick={() => setActiveSettingsId(null)} className="p-3 text-gray-400 hover:text-hotel-primary transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column: Metadata */}
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Marketing Title</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#B22222] transition-all"
                      value={activeOffer.title}
                      onChange={(e) => updateOffer(activeSettingsId, 'title', e.target.value)}
                      placeholder="Summer Special 2024..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount %</label>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#B22222]">%</span>
                        <input 
                          type="number"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#B22222] transition-all"
                          value={activeOffer.discountPercent}
                          onChange={(e) => updateOffer(activeSettingsId, 'discountPercent', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                       <button 
                        onClick={() => updateOffer(activeSettingsId, 'isOneTime', !activeOffer.isOneTime)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeOffer.isOneTime ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
                       >
                         {activeOffer.isOneTime ? 'Single Use' : 'Recurring'}
                         <ShieldCheck size={14} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Active</label>
                      <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[11px] font-bold outline-none"
                        value={new Date(activeOffer.startDate || Date.now()).toISOString().split('T')[0]}
                        onChange={(e) => updateOffer(activeSettingsId, 'startDate', new Date(e.target.value).getTime())}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">End Expiry</label>
                      <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[11px] font-bold outline-none"
                        value={new Date(activeOffer.endDate || Date.now()).toISOString().split('T')[0]}
                        onChange={(e) => updateOffer(activeSettingsId, 'endDate', new Date(e.target.value).getTime())}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-medium outline-none h-32 resize-none focus:border-[#B22222] transition-all no-scrollbar"
                      value={activeOffer.description}
                      onChange={(e) => updateOffer(activeSettingsId, 'description', e.target.value)}
                      placeholder="Write your terms and benefits here..."
                    />
                  </div>
                </div>

                {/* Right Column: Visual Assets */}
                <div className="space-y-6 flex flex-col justify-center">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Preview (16:9 1080p)</label>
                    <div className="relative group aspect-video rounded-[1.5rem] overflow-hidden border-4 border-gray-100 shadow-xl bg-gray-200">
                       {activeOffer.mediaType === 'video' ? (
                         <video src={activeOffer.mediaUrl} className="w-full h-full object-cover" muted loop />
                       ) : (
                         <img src={activeOffer.mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="text-white" size={32} />
                       </div>
                    </div>
                  </div>

                  <div className="relative border-2 border-dashed border-gray-200 rounded-[1.5rem] p-8 bg-gray-50/50 flex flex-col items-center gap-3 text-center transition-all hover:bg-white hover:border-[#B22222]/30 cursor-pointer group">
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleMediaUpload(activeSettingsId, e)} />
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#B22222] group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Replace Media</p>
                       <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Stored in: /hotel-shotabdi-assets/Exclusive Offers/</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setActiveSettingsId(null)} 
                className="flex-1 bg-[#B22222] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Confirm Offer Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExclusiveOffers;

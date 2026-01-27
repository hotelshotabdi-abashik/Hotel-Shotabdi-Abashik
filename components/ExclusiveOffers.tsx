
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
    if (!(window as any).Swiper) return;
    
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
      description: "Discover unmatched luxury with this limited time residential offer.",
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
        // Path logic is handled in the callback passed from App.tsx
        const url = await onImageUpload(file);
        updateOffer(id, 'mediaUrl', url);
        updateOffer(id, 'mediaType', file.type.startsWith('video') ? 'video' : 'image');
      } catch (err) {
        alert("Upload failed. Ensure file is under 10MB.");
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
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

      {/* Refined Admin Modal: Fixed size, centered, no internal scroll */}
      {activeSettingsId && isEditMode && activeOffer && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-hidden">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col transform transition-all">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-[#B22222]/10 rounded-2xl flex items-center justify-center text-[#B22222]">
                    <Settings2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Offer Configuration</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Manage Residential Incentives</p>
                 </div>
              </div>
              <button onClick={() => setActiveSettingsId(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100"><X size={24}/></button>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                {/* Left Column: Input Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marketing Header</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#B22222] transition-all focus:bg-white"
                      value={activeOffer.title}
                      onChange={(e) => updateOffer(activeSettingsId, 'title', e.target.value)}
                      placeholder="e.g. Summer Residential Deal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rebate (%)</label>
                      <div className="relative">
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[#B22222]">%</span>
                        <input 
                          type="number"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#B22222] transition-all focus:bg-white"
                          value={activeOffer.discountPercent}
                          onChange={(e) => updateOffer(activeSettingsId, 'discountPercent', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redemption</label>
                       <button 
                        onClick={() => updateOffer(activeSettingsId, 'isOneTime', !activeOffer.isOneTime)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeOffer.isOneTime ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
                       >
                         {activeOffer.isOneTime ? 'Single Use' : 'Unlimited'}
                         <ShieldCheck size={16} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Release Date</label>
                      <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[12px] font-bold outline-none focus:bg-white"
                        value={new Date(activeOffer.startDate || Date.now()).toISOString().split('T')[0]}
                        onChange={(e) => updateOffer(activeSettingsId, 'startDate', new Date(e.target.value).getTime())}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                      <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[12px] font-bold outline-none focus:bg-white"
                        value={new Date(activeOffer.endDate || Date.now()).toISOString().split('T')[0]}
                        onChange={(e) => updateOffer(activeSettingsId, 'endDate', new Date(e.target.value).getTime())}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Offer Narrative</label>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none h-36 resize-none focus:border-[#B22222] transition-all no-scrollbar focus:bg-white"
                      value={activeOffer.description}
                      onChange={(e) => updateOffer(activeSettingsId, 'description', e.target.value)}
                      placeholder="Detail the exclusive benefits of this stay..."
                    />
                  </div>
                </div>

                {/* Right Column: Visual Controls & Preview */}
                <div className="space-y-8 flex flex-col justify-center">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Media Asset Preview (16:9)</label>
                    <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-gray-200 ring-1 ring-black/5">
                       {activeOffer.mediaType === 'video' ? (
                         <video src={activeOffer.mediaUrl} className="w-full h-full object-cover" muted loop />
                       ) : (
                         <img src={activeOffer.mediaUrl} className="w-full h-full object-cover" alt="R2 Stored Asset" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <ImageIcon className="text-white" size={48} />
                       </div>
                    </div>
                  </div>

                  <div className="relative border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 bg-gray-50/50 flex flex-col items-center gap-4 text-center transition-all hover:bg-white hover:border-[#B22222]/30 cursor-pointer group">
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleMediaUpload(activeSettingsId, e)} />
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#B22222] group-hover:scale-110 transition-transform">
                        <Camera size={32} />
                     </div>
                     <div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-gray-600">Update R2 Cloud Asset</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Directory: /hotel-shotabdi-assets/Exclusive Offers/</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-gray-50/80 border-t border-gray-100 flex gap-6">
              <button 
                onClick={() => setActiveSettingsId(null)} 
                className="flex-1 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:bg-black active:scale-[0.98]"
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExclusiveOffers;

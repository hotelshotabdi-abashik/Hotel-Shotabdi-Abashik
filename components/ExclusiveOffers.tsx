import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Plus, Trash2, Camera, 
  Tag, Settings2, ShieldCheck, X, CheckCircle2, Loader2, CalendarRange
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
  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const swiperRef = useRef<any>(null);

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
      discountPercent: 25, // Updated default to 25%
      isOneTime: true, 
      startDate: Date.now(),
      endDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };
    onUpdate?.([...offers, newOffer]);
    setActiveSettingsId(newOffer.id);
  };

  const updateOffer = (id: string, field: keyof Offer, value: any) => {
    const updated = offers.map(o => o.id === id ? { ...o, [field]: value } : o);
    onUpdate?.(updated);
  };

  const toggleUnlimited = (id: string, currentVal: boolean) => {
    const updatedValue = !currentVal;
    const updated = offers.map(o => o.id === id ? { 
      ...o, 
      isOneTime: updatedValue,
      endDate: updatedValue ? (o.endDate || Date.now() + 604800000) : undefined 
    } : o);
    onUpdate?.(updated);
  };

  const handleMediaUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        const updated = offers.map(o => o.id === id ? { 
          ...o, 
          mediaUrl: url, 
          mediaType: file.type.startsWith('video') ? 'video' as const : 'image' as const 
        } : o);
        onUpdate?.(updated);
      } catch (err) {
        alert("Upload failed. Ensure file is under 10MB.");
      } finally {
        setIsUploading(false);
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
          {isEditMode && (
            <button 
              onClick={addOffer}
              className="bg-[#B22222] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:brightness-110 shadow-xl shadow-red-100 transition-all active:scale-95"
            >
              <Plus size={18} /> Add New Deal
            </button>
          )}
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
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <span className="bg-[#B22222] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ring-1 ring-white/20">
                      <Tag size={12} /> {offer.discountPercent}% OFF
                    </span>
                    {!offer.endDate ? (
                      <span className="bg-green-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ring-1 ring-white/20">
                        <CheckCircle2 size={10} /> Forever
                      </span>
                    ) : (
                      <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-[8px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 border border-gray-100 shadow-lg">
                        <ShieldCheck size={10} /> Single Use
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-8 left-0 right-0 px-8 flex flex-col items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                     <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => onClaim?.(offer)}
                          disabled={claimedOfferId === offer.id}
                          className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl ${
                            claimedOfferId === offer.id 
                            ? 'bg-green-500 text-white cursor-default' 
                            : 'bg-white text-gray-900 hover:bg-[#B22222] hover:text-white border border-gray-100'
                          }`}
                        >
                          {claimedOfferId === offer.id ? 'Claimed' : (offer.ctaText || 'Claim Now')}
                        </button>
                        <Link 
                          to={`/offers/${offer.id}`}
                          className="w-12 h-12 bg-white/40 backdrop-blur-md flex items-center justify-center rounded-2xl text-white hover:bg-white hover:text-[#B22222] transition-all shadow-xl border border-white/20"
                        >
                          <ChevronRight size={20} />
                        </Link>
                     </div>
                  </div>

                  {isEditMode && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2">
                      <button 
                        onClick={() => setActiveSettingsId(offer.id)}
                        className="bg-white/95 p-3 rounded-xl text-gray-700 hover:text-[#B22222] shadow-xl transition-all hover:scale-110"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteOffer(offer.id)}
                        className="bg-red-600 p-3 rounded-xl text-white shadow-xl hover:bg-red-700 transition-all hover:scale-110"
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
             <div className="swiper-button-prev !static !w-12 !h-12 !mt-0 bg-gray-50 hover:bg-[#B22222] hover:text-white rounded-full transition-all after:!text-sm shadow-sm"></div>
             <div className="swiper-pagination !static !w-auto !flex items-center gap-2"></div>
             <div className="swiper-button-next !static !w-12 !h-12 !mt-0 bg-gray-50 hover:bg-[#B22222] hover:text-white rounded-full transition-all after:!text-sm shadow-sm"></div>
          </div>
        </div>
      </div>

      {activeSettingsId && isEditMode && activeOffer && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-hidden">
          <div className="bg-white/95 backdrop-blur-3xl w-full max-w-5xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] flex flex-col max-h-[90vh] border border-white/20 overflow-hidden ring-1 ring-white/10">
            <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-[#B22222]/10 rounded-2xl flex items-center justify-center text-[#B22222] shadow-inner">
                    <Settings2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Deal Configuration</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Configure Exclusive Residential Benefits</p>
                 </div>
              </div>
              <button onClick={() => setActiveSettingsId(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                <X size={24}/>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden p-8 md:p-10 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
                <div className="space-y-5 flex flex-col justify-start">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marketing Headline</label>
                    <input 
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-sm font-bold outline-none focus:border-[#B22222] transition-all focus:bg-white"
                      value={activeOffer.title}
                      onChange={(e) => updateOffer(activeSettingsId, 'title', e.target.value)}
                      placeholder="e.g. Monsoon Luxury Retreat"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rebate Percentage</label>
                      <div className="relative">
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-[#B22222] text-sm">%</span>
                        <input 
                          type="number"
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-sm font-bold outline-none focus:border-[#B22222] transition-all focus:bg-white"
                          value={activeOffer.discountPercent}
                          onChange={(e) => updateOffer(activeSettingsId, 'discountPercent', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redemption Rule</label>
                       <button 
                        onClick={() => toggleUnlimited(activeSettingsId, activeOffer.isOneTime || false)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeOffer.isOneTime ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                       >
                         {activeOffer.isOneTime ? 'Single Use' : 'Forever (Unlimited)'}
                         {activeOffer.isOneTime ? <ShieldCheck size={16} /> : <CheckCircle2 size={16} />}
                       </button>
                    </div>
                  </div>

                  {activeOffer.isOneTime && (
                    <div className="grid grid-cols-2 gap-5 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Release Date</label>
                        <input 
                          type="date"
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[11px] font-bold outline-none focus:bg-white"
                          value={new Date(activeOffer.startDate || Date.now()).toISOString().split('T')[0]}
                          onChange={(e) => updateOffer(activeSettingsId, 'startDate', new Date(e.target.value).getTime())}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration Date</label>
                        <input 
                          type="date"
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[11px] font-bold outline-none focus:bg-white"
                          value={new Date(activeOffer.endDate || Date.now()).toISOString().split('T')[0]}
                          onChange={(e) => updateOffer(activeSettingsId, 'endDate', new Date(e.target.value).getTime())}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Offer Narrative</label>
                    <textarea 
                      className="w-full flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-sm font-medium outline-none resize-none focus:border-[#B22222] transition-all no-scrollbar focus:bg-white leading-relaxed"
                      value={activeOffer.description}
                      onChange={(e) => updateOffer(activeSettingsId, 'description', e.target.value)}
                      placeholder="Detail the unique residential experience..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">16:9 Media Asset Preview</label>
                    <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-200 ring-1 ring-black/5 mx-auto w-full">
                       {activeOffer.mediaType === 'video' ? (
                         <video src={activeOffer.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                       ) : (
                         <img src={activeOffer.mediaUrl} className="w-full h-full object-cover" alt="Asset Preview" />
                       )}
                       {isUploading && (
                         <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-3">
                            <Loader2 className="animate-spin" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Optimizing Asset...</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      onChange={(e) => handleMediaUpload(activeSettingsId, e)} 
                      disabled={isUploading}
                    />
                    <div className={`w-full py-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-center gap-4 transition-all ${isUploading ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-[#B22222]/30'}`}>
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-[#B22222]">
                        <Camera size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-700">Upload Media</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">High Resolution 16:9 Required</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-gray-50/80 border-t border-gray-100 flex gap-6 shrink-0">
              <button 
                onClick={() => setActiveSettingsId(null)} 
                className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all hover:bg-black active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={18} />
                Commit Deal Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExclusiveOffers;
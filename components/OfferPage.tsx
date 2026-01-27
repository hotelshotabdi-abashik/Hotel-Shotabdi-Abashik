
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar, MapPin, Tag, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Offer } from '../types';

interface Props {
  offers: Offer[];
  onClaim?: (offer: Offer) => void;
}

const OfferPage: React.FC<Props> = ({ offers, onClaim }) => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const offer = offers.find(o => o.id === offerId);

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Offer Expired</h2>
        <button onClick={() => navigate('/')} className="bg-hotel-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          Return to Hub
        </button>
      </div>
    );
  }

  const daysLeft = offer.endDate ? Math.ceil((offer.endDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-white animate-fade-in flex flex-col">
      {/* 1080p Full Width Hero */}
      <div className="relative w-full aspect-video md:h-[70vh] lg:h-[80vh] overflow-hidden">
        {offer.mediaType === 'video' ? (
          <video src={offer.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
        ) : (
          <img src={offer.mediaUrl} className="w-full h-full object-cover" alt={offer.title} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        
        <div className="absolute top-10 left-10 z-20">
           <Link to="/" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900">
              <ArrowLeft size={16} /> Hub Overview
            </Link>
        </div>

        <div className="absolute bottom-16 left-0 right-0 px-6 md:px-20">
          <div className="max-w-7xl mx-auto flex flex-col items-start gap-6">
            <div className="flex flex-wrap gap-4">
               <span className="bg-[#B22222] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Tag size={12} /> {offer.discountPercent}% Off Applied
               </span>
               {daysLeft !== null && daysLeft > 0 && (
                 <span className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Clock size={12} /> {daysLeft} Days Remaining
                 </span>
               )}
            </div>
            <h1 className="text-4xl md:text-7xl font-sans font-black text-white max-w-5xl leading-tight tracking-tighter">
              {offer.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Optimized Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-20 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* Main Description (Left 8 Columns) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-2xl prose-red max-w-none">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:text-[#B22222] first-letter:mr-3 first-letter:float-left">
                {offer.description}
              </p>
            </div>

            <div className="pt-12 border-t border-gray-100 flex flex-wrap gap-8 items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</p>
                    <p className="text-xs font-black text-gray-900">Official Residential Offer</p>
                  </div>
               </div>
               <button 
                onClick={() => {
                  navigator.share?.({ title: offer.title, url: window.location.href });
                }}
                className="flex items-center gap-3 text-gray-400 hover:text-hotel-primary text-[10px] font-black uppercase tracking-widest transition-colors ml-auto"
              >
                <Share2 size={18} /> Spread the word
              </button>
            </div>
          </div>

          {/* Sticky Sidebar (Right 4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100 shadow-sm sticky top-32">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Claim Your Privilege</h3>
              
              <div className="space-y-6 mb-12">
                 <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-hotel-primary/10 flex items-center justify-center text-hotel-primary shrink-0">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Benefit</p>
                       <p className="text-[11px] font-black text-gray-900">Guaranteed Discount</p>
                    </div>
                 </div>
                 <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-hotel-primary/10 flex items-center justify-center text-hotel-primary shrink-0">
                       <MapPin size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valid At</p>
                       <p className="text-[11px] font-black text-gray-900">Hotel Shotabdi - Sylhet</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => onClaim?.(offer)}
                className="w-full bg-[#B22222] text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all mb-4"
              >
                Apply this Offer
              </button>
              
              <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest">
                Requires login to verify claim status
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPage;

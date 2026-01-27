
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Fixed missing import: ShieldCheck
import { ArrowLeft, Share2, Calendar, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { Offer } from '../types';

interface Props {
  offers: Offer[];
}

const OfferPage: React.FC<Props> = ({ offers }) => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const offer = offers.find(o => o.id === offerId);

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Offer Not Found</h2>
        <button onClick={() => navigate('/')} className="bg-hotel-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {offer.mediaType === 'video' ? (
          <video src={offer.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
        ) : (
          <img src={offer.mediaUrl} className="w-full h-full object-cover" alt={offer.title} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-[10px] font-black uppercase tracking-widest transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-3xl md:text-6xl font-sans font-black text-white max-w-4xl leading-tight">
              {offer.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-hotel-primary/5 text-hotel-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Tag size={14} /> Exclusive Opportunity
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Calendar size={14} /> Limited Time
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light whitespace-pre-wrap">
                {offer.description}
              </p>
            </div>
            
            <div className="mt-12 pt-12 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => {
                  navigator.share?.({ title: offer.title, url: window.location.href });
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-hotel-primary text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <Share2 size={16} /> Share this Offer
              </button>
              
              <Link to="/rooms" className="bg-[#B22222] text-white px-10 py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all">
                Book with this Offer
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Stay Details</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-primary shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-gray-700">Sylhet HQ District</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-primary shadow-sm">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assurance</p>
                    <p className="text-sm font-bold text-gray-700">Best Rate Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0A192F] rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-4">Need Assistance?</h3>
                <p className="text-xs text-white/60 mb-8 leading-relaxed">
                  Our 24/7 concierge is ready to help you plan your perfect stay.
                </p>
                <a href="tel:+8801717425702" className="block w-full bg-hotel-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-xl">
                  Call Concierge
                </a>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPage;

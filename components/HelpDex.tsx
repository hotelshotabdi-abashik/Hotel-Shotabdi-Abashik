
import React from 'react';
import { 
  Phone, MessageCircle, Shield, Key, 
  ExternalLink, Headphones, Clock, MapPin
} from 'lucide-react';
import { OWNER_EMAIL } from '../services/firebase';
import { UserProfile, SiteConfig } from '../types';
import { translations } from '../translations';

interface HelpDeskProps {
  profile: UserProfile | null;
  logoUrl?: string;
  language?: 'EN' | 'BN';
  siteConfig?: SiteConfig;
  isAdmin?: boolean;
  pendingBookingsCount?: number;
}

const HelpDesk: React.FC<HelpDeskProps> = ({ profile, logoUrl, language = 'EN', siteConfig, isAdmin, pendingBookingsCount = 0 }) => {
  const isOwner = profile?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const t = translations[language];

  const contactNumbers = siteConfig?.helpDeskNumbers || [
    { number: '+880177425702', labelEn: 'Primary Support', labelBn: 'প্রাথমিক সাপোর্ট' },
    { number: '+8801334935566', labelEn: 'Secondary Support', labelBn: 'সেকেন্ডারি সাপোর্ট' }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center px-6 py-6 md:py-10">
      <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-8 md:p-12 text-center border-b border-gray-50 bg-gray-50/30">
          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl border border-gray-50 flex items-center justify-center p-4 mx-auto mb-6 animate-bounce-slow">
            <img src={logoUrl} className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-gray-900 tracking-tight mb-3">
            {language === 'EN' ? 'Help Desk & Support' : 'হেল্প ডেস্ক ও সাপোর্ট'}
          </h2>
          <p className="text-[11px] text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
            {language === 'EN' 
              ? 'Our dedicated team is available 24/7 to assist you with your stay, bookings, and inquiries.' 
              : 'আমাদের নিবেদিত দল আপনার অবস্থান, বুকিং এবং জিজ্ঞাসায় সহায়তা করার জন্য ২৪/৭ উপলব্ধ।'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Clock size={14} className="text-hotel-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Shield size={14} className="text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Support</span>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactNumbers.map((contact, idx) => (
            <div key={idx} className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 hover:border-hotel-primary/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-hotel-primary shadow-sm border border-gray-50">
                  <Headphones size={18} />
                </div>
                <span className="text-[8px] font-black text-hotel-primary uppercase tracking-[0.2em] bg-hotel-primary/5 px-2 py-1 rounded-full">
                  {language === 'EN' ? contact.labelEn : contact.labelBn}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight font-mono">
                {contact.number}
              </h3>

              <div className="space-y-3">
                <a 
                  href={`tel:${contact.number}`}
                  className="w-full flex items-center justify-center gap-3 bg-hotel-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-hotel-secondary transition-all active:scale-95"
                >
                  <Phone size={18} />
                  {language === 'EN' ? 'Normal Call' : 'সরাসরি কল'}
                </a>
                
                <a 
                  href={`https://wa.me/${contact.number.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
                >
                  <MessageCircle size={18} />
                  {language === 'EN' ? 'WhatsApp Call' : 'হোয়াটসঅ্যাপ কল'}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sylhet, Bangladesh</span>
          </div>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] text-center">
        Hotel Shotabdi Residential &copy; 2024
      </p>
    </div>
  );
};

export default HelpDesk;

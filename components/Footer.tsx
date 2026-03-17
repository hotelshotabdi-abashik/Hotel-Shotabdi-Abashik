
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, ChevronRight, Globe, Edit3 } from 'lucide-react';
import { translations, Language } from '../translations';

interface FooterProps {
  isEditMode?: boolean;
  language: Language;
  logoUrl?: string;
  socialLinks?: {
    facebook: string;
    instagram: string;
    website: string;
  };
  onUpdateSocial?: (links: { facebook: string; instagram: string; website: string }) => void;
}

const Footer: React.FC<FooterProps> = ({ isEditMode, language, logoUrl, socialLinks, onUpdateSocial }) => {
  const currentYear = new Date().getFullYear();
  const t = translations[language];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSocialEdit = (platform: 'facebook' | 'instagram' | 'website') => {
    if (!isEditMode || !onUpdateSocial || !socialLinks) return;
    const currentUrl = socialLinks[platform];
    const newUrl = window.prompt(`Update ${platform} link:`, currentUrl);
    if (newUrl !== null) {
      onUpdateSocial({
        ...socialLinks,
        [platform]: newUrl
      });
    }
  };

  const links = socialLinks || {
    facebook: '#',
    instagram: '#',
    website: '#'
  };

  return (
    <footer id="about" className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 md:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Column 1: Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img 
              src={logoUrl} 
              className="w-12 h-12 object-contain" 
              alt="Hotel Shotabdi Abashik Logo"
              draggable="false"
              style={{ pointerEvents: 'none' }}
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-lg font-cormorant font-black text-gray-900 tracking-wider uppercase leading-none notranslate">Hotel Shotabdi</h1>
              <p className="text-[6px] text-hotel-primary font-black uppercase tracking-[0.4em] mt-0.5 notranslate">Abashik</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {t.footerDesc}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => isEditMode ? handleSocialEdit('facebook') : window.open(links.facebook, '_blank')}
              className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all shadow-sm border border-gray-100 relative group ${isEditMode ? 'hover:bg-amber-50 text-amber-600 border-amber-200' : 'text-gray-400 hover:text-hotel-primary hover:bg-hotel-primary/10'}`}
              title={isEditMode ? "Click to edit Facebook link" : "Facebook"}
            >
              <Facebook size={18} />
              {isEditMode && <Edit3 size={8} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5 border border-amber-200" />}
            </button>
            <button 
              onClick={() => isEditMode ? handleSocialEdit('instagram') : window.open(links.instagram, '_blank')}
              className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all shadow-sm border border-gray-100 relative group ${isEditMode ? 'hover:bg-amber-50 text-amber-600 border-amber-200' : 'text-gray-400 hover:text-hotel-primary hover:bg-hotel-primary/10'}`}
              title={isEditMode ? "Click to edit Instagram link" : "Instagram"}
            >
              <Instagram size={18} />
              {isEditMode && <Edit3 size={8} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5 border border-amber-200" />}
            </button>
            <button 
              onClick={() => isEditMode ? handleSocialEdit('website') : window.open(links.website, '_blank')}
              className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all shadow-sm border border-gray-100 relative group ${isEditMode ? 'hover:bg-amber-50 text-amber-600 border-amber-200' : 'text-gray-400 hover:text-hotel-primary hover:bg-hotel-primary/10'}`}
              title={isEditMode ? "Click to edit Website link" : "Website"}
            >
              <Globe size={18} />
              {isEditMode && <Edit3 size={8} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5 border border-amber-200" />}
            </button>
          </div>
        </div>

        {/* Column 2: Discover */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] border-l-4 border-hotel-primary pl-3">{t.exploreHub}</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.homeOverview}
              </Link>
            </li>
            <li>
              <Link to="/rooms" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.luxuryRooms}
              </Link>
            </li>
            <li>
              <Link to="/offers" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.specialOffers}
              </Link>
            </li>
            <li>
              <Link to="/restaurants" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.nearbyDining}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Support & Legal */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] border-l-4 border-hotel-primary pl-3">{t.registrySupport}</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/helpdesk" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.helpDesk}
              </Link>
            </li>
            <li>
              <Link to="/privacypolicy" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.privacyPolicy}
              </Link>
            </li>
            <li>
              <Link to="/termsofservice" onClick={scrollToTop} className="text-xs font-bold text-gray-400 hover:text-hotel-primary transition-colors flex items-center gap-2 group">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {t.termsOfService}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Info */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] border-l-4 border-hotel-primary pl-3">{t.officialHQ}</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <a href="tel:+8801717425702" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-hotel-primary group-hover:text-white transition-all shadow-sm">
                  <Phone size={14} />
                </div>
                <span className="text-xs font-black text-gray-600 group-hover:text-hotel-primary transition-colors">+880 1717-425702</span>
              </a>
              <a href="tel:+8801334935566" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-hotel-primary group-hover:text-white transition-all shadow-sm">
                  <Phone size={14} />
                </div>
                <span className="text-xs font-black text-gray-600 group-hover:text-hotel-primary transition-colors">+880 1334-935566</span>
              </a>
            </div>
            <a href="mailto:hotelshotabdiabashik@gmail.com" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-hotel-primary group-hover:text-white transition-all shadow-sm">
                <Mail size={14} />
              </div>
              <span className="text-[11px] font-black text-gray-600 group-hover:text-hotel-primary transition-colors truncate">hotelshotabdiabashik@gmail.com</span>
            </a>
            <div className="flex items-start gap-3 pt-2">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                <MapPin size={14} />
              </div>
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                Kumargaon Bus Terminal, <br />Sylhet, Bangladesh
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          © {currentYear} <span className="notranslate">Hotel Shotabdi Abashik</span>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

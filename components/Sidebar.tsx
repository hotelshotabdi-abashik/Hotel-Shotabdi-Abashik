
import React, { useState, useRef, useEffect } from 'react';
import { Phone, LayoutDashboard, ChevronRight, X, Info, Camera, MessageSquare, PhoneCall } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, LOGO_ICON_URL } from '../constants';

interface SidebarProps {
  isAdmin?: boolean;
  logoUrl?: string;
  isEditMode?: boolean;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false, logoUrl, isEditMode, onLogoChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [activeNumberChoice, setActiveNumberChoice] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const contactNumbers = [
    { label: "Registry 1", value: "+880 1717-425702", clean: "+8801717425702" },
    { label: "Registry 2", value: "+880 1334-935566", clean: "+8801334935566" }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveNumberChoice(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoSpinning(true);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLogoSpinning(false), 2000);
  };

  const scrollToFooter = () => {
    const footer = document.getElementById('main-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col shadow-sm z-50">
      {/* Branding */}
      <div className="p-8 pb-4 flex flex-col items-center justify-center relative">
        <div className="relative group">
          <a href="/" onClick={handleLogoClick} className="flex flex-col items-center gap-2">
            <img src={logoUrl || LOGO_ICON_URL} className={`w-20 h-20 object-contain transition-transform group-hover:scale-110 ${isLogoSpinning ? 'animate-spin-once' : ''}`} alt="Shotabdi Abashik" />
            <div className="text-center">
              <h2 className="text-sm font-serif font-black text-gray-900 tracking-widest uppercase">Shotabdi</h2>
              <p className="text-[8px] text-hotel-primary font-black uppercase tracking-[0.4em]">Abashik</p>
            </div>
          </a>
          {isEditMode && (
            <label className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 p-2 text-center">
               <input type="file" className="hidden" accept=".png,.svg" onChange={onLogoChange} />
               <Camera className="text-white mb-1" size={16} />
               <span className="text-[7px] text-white font-black uppercase leading-tight">PNG/SVG Only</span>
            </label>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 px-4">Navigation</p>
        <nav className="space-y-2 mb-8">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-hotel-primary text-white shadow-xl shadow-red-100 translate-x-1' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-hotel-primary'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-hotel-primary'}>
                  {item.icon}
                </span>
                <span className={`text-[10px] tracking-[0.15em] font-black uppercase ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-50">
              <Link
                to="/admin"
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  location.pathname === '/admin' 
                    ? 'bg-amber-600 text-white shadow-xl shadow-amber-50' 
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                <LayoutDashboard size={20} />
                <span className="text-[10px] tracking-[0.15em] font-black uppercase">
                  Registry Panel
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      <div className="p-6 pt-0 space-y-4">
        <button 
          onClick={scrollToFooter}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-hotel-primary transition-all duration-300"
        >
          <Info size={20} className="text-hotel-primary" />
          <span className="text-[10px] tracking-[0.15em] font-black uppercase">About</span>
        </button>

        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-hotel-primary/20 transition-all relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 mb-3">
            <Phone size={14} className="text-gray-400 group-hover:text-hotel-primary transition-colors" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Desk</span>
          </div>
          <div className="space-y-2 mb-2">
            {contactNumbers.map((num) => (
              <div key={num.value} className="relative">
                <button 
                  onClick={() => setActiveNumberChoice(activeNumberChoice === num.value ? null : num.value)}
                  className={`text-[11px] font-black tracking-tight transition-colors w-full text-left flex justify-between items-center group/num ${activeNumberChoice === num.value ? 'text-hotel-primary' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {num.value}
                  <ChevronRight size={12} className={`transition-transform ${activeNumberChoice === num.value ? 'rotate-90' : ''}`} />
                </button>
                
                {activeNumberChoice === num.value && (
                  <div className="absolute left-full top-0 ml-4 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[60] animate-fade-in origin-left ring-1 ring-black/5">
                     <a href={`tel:${num.clean}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all">
                        <PhoneCall size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Direct Call</span>
                     </a>
                     <a href={`https://wa.me/${num.clean.replace('+', '').replace(/\s/g, '').replace('-', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-green-600 transition-all">
                        <MessageSquare size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                     </a>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center mt-2 opacity-60 italic">Click for direct options</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

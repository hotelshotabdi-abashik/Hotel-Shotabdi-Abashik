import React, { useState } from 'react';
import { Phone, LayoutDashboard, ChevronRight, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, LOGO_ICON_URL } from '../constants';

const Sidebar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const location = useLocation();
  const [showCallChoices, setShowCallChoices] = useState(false);
  const mapUrl = "https://maps.app.goo.gl/Fqxeny69cdNArTfA9";

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col shadow-sm z-50">
      {/* Branding */}
      <div className="p-8 pb-4 flex items-center justify-center">
        <Link to="/" className="group flex flex-col items-center gap-2">
           <img src={LOGO_ICON_URL} className="w-20 h-20 object-contain transition-transform group-hover:scale-110" alt="Shotabdi Abashik" />
           <div className="text-center">
             <h2 className="text-sm font-serif font-black text-gray-900 tracking-widest uppercase">Shotabdi</h2>
             <p className="text-[8px] text-hotel-primary font-black uppercase tracking-[0.4em]">Abashik</p>
           </div>
        </Link>
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

      <div className="p-6 pt-0">
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-hotel-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Phone size={14} className="text-gray-400 group-hover:text-hotel-primary transition-colors" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Desk</span>
          </div>
          <div className="space-y-1 mb-5">
            <p className="text-[11px] text-gray-500 font-medium tracking-tight">+880 1717-425702</p>
          </div>
          <button 
            onClick={() => setShowCallChoices(!showCallChoices)}
            className="block w-full bg-hotel-primary text-white py-3.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-100 text-center active:scale-95"
          >
            Call Registry
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
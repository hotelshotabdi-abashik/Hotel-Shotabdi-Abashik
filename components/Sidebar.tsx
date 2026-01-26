import React from 'react';
import { Phone } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange
}) => {
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Hotel+Shotabdi+Residential,+WR6H%2BQ2P,+Sylhet%203100";

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-hotel-muted hidden lg:flex flex-col shadow-sm z-50">
      <div className="relative group h-48 w-full overflow-hidden border-b border-hotel-muted">
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full relative"
        >
          <div className="absolute inset-0 w-full h-[120%] -top-[10%] left-0">
            <iframe
              title="Hotel Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src="https://maps.google.com/maps?q=Hotel%20Shotabdi%20Residential,%20WR6H+Q2P,%20Sylhet%203100&t=&z=16&ie=UTF8&iwloc=addr&output=embed"
              className="grayscale-0 pointer-events-none"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-hotel-primary/0 group-hover:bg-hotel-primary/10 transition-colors"></div>
        </a>
        
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent">
          <h1 className="font-serif font-black text-2xl leading-tight text-hotel-primary">Shotabdi</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">Residential • Sylhet</p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        <nav className="space-y-2 mb-8">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-hotel-primary text-white shadow-xl shadow-red-100' 
                    : 'text-gray-500 hover:bg-hotel-muted hover:text-hotel-primary'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-hotel-primary'}>
                  {item.icon}
                </span>
                <span className={`text-sm tracking-wide font-black uppercase ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 pt-0 space-y-4">
        <div className="p-5 bg-hotel-muted rounded-[2rem] border border-hotel-primary/10">
          <div className="flex items-center gap-3 mb-1">
            <Phone size={16} className="text-hotel-primary" />
            <span className="text-xs font-black text-hotel-text uppercase tracking-widest">Helpline</span>
          </div>
          <p className="text-[11px] text-hotel-primary font-bold mb-4">+880 1700-000000</p>
          <button className="w-full bg-white text-hotel-primary py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border border-hotel-primary/20 hover:bg-hotel-primary hover:text-white transition-all shadow-sm">
            Call Reception
          </button>
        </div>
        <div className="text-center py-2">
           <div className="w-8 h-1 bg-hotel-primary/10 mx-auto mb-3 rounded-full"></div>
           <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase italic font-bold">
            Legacy of Comfort
           </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
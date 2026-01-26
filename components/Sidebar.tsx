
import React from 'react';
import { Phone, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

const Sidebar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const location = useLocation();
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Hotel+Shotabdi+Residential,+WR6H%2BQ2P,+Sylhet%203100";

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col shadow-sm z-50">
      {/* Map Section - Full color as requested */}
      <div className="relative group h-40 w-full overflow-hidden border-b border-gray-50">
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
              className="pointer-events-none opacity-80 group-hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-hotel-primary/0 group-hover:bg-hotel-primary/5 transition-colors"></div>
        </a>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar pt-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-6">Navigation</p>
        <nav className="space-y-2 mb-8">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-hotel-primary text-white shadow-xl shadow-red-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-hotel-primary'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-hotel-primary'}>
                  {item.icon}
                </span>
                <span className={`text-[10px] tracking-[0.1em] font-black uppercase ${isActive ? 'text-white' : ''}`}>
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
                <span className="text-[11px] tracking-[0.1em] font-black uppercase">
                  Admin Dashboard
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      <div className="p-6 pt-0 space-y-4">
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Phone size={14} className="text-hotel-primary" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Helpline</span>
          </div>
          <p className="text-[12px] text-hotel-primary font-black mb-4 tracking-tight">+8801717425702</p>
          <a href="tel:+8801717425702" className="block w-full bg-white text-hotel-primary py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-hotel-primary hover:text-white transition-all shadow-sm text-center">
            Quick Reach
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { Phone, LayoutDashboard, ChevronRight, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

const Sidebar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const location = useLocation();
  const [showCallChoices, setShowCallChoices] = useState(false);
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Hotel+Shotabdi+Residential,+WR6H%2BQ2P,+Sylhet%203100";

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col shadow-sm z-50">
      {/* Map Section */}
      <div className="relative group h-32 mx-6 mt-8 rounded-[2rem] overflow-hidden border border-gray-50">
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full relative"
        >
          <div className="absolute inset-0 w-full h-[140%] -top-[20%]">
            <iframe
              title="Hotel Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src="https://maps.google.com/maps?q=Hotel%20Shotabdi%20Residential,%20WR6H+Q2P,%20Sylhet%203100&t=&z=15&ie=UTF8&iwloc=addr&output=embed"
              className="pointer-events-none opacity-60 group-hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-hotel-primary/5 group-hover:bg-transparent transition-colors"></div>
        </a>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar pt-8">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 px-4">Menu</p>
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
                  Admin Panel
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
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Helplines</span>
          </div>
          <div className="space-y-1 mb-5">
            <p className="text-[11px] text-gray-500 font-medium tracking-tight">01717-425702</p>
            <p className="text-[11px] text-gray-500 font-medium tracking-tight">0133-4935566</p>
          </div>
          
          {!showCallChoices ? (
            <button 
              onClick={() => setShowCallChoices(true)}
              className="block w-full bg-white text-gray-500 py-3.5 text-[9px] font-black uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-hotel-primary hover:text-white transition-all shadow-sm text-center active:scale-95"
            >
              Call Reception
            </button>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <div className="flex flex-col gap-2">
                <a 
                  href="tel:+8801717425702" 
                  className="flex items-center justify-between w-full bg-hotel-primary text-white py-3 px-4 rounded-xl shadow-lg shadow-red-100 hover:brightness-110 transition-all active:scale-95 group/call"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">Line 1</span>
                  <ChevronRight size={14} className="group-hover/call:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="tel:+8801334935566" 
                  className="flex items-center justify-between w-full bg-hotel-primary text-white py-3 px-4 rounded-xl shadow-lg shadow-red-100 hover:brightness-110 transition-all active:scale-95 group/call"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">Line 2</span>
                  <ChevronRight size={14} className="group-hover/call:translate-x-1 transition-transform" />
                </a>
              </div>
              <button 
                onClick={() => setShowCallChoices(false)}
                className="w-full flex items-center justify-center gap-2 mt-2 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-hotel-primary transition-colors"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
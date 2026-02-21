
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Bed, Tag, Utensils, Map as MapIcon, 
  MessageSquare, History, LayoutDashboard, 
  LogOut, User as UserIcon, Shield, Key, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarNavProps {
  user: any;
  profile: any;
  isAdmin: boolean;
  logoUrl: string;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  user, profile, isAdmin, logoUrl, onLogout, onOpenAuth, onOpenProfile 
}) => {
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/' },
    { id: 'rooms', label: 'Rooms', icon: <Bed size={20} />, path: '/rooms' },
    { id: 'offers', label: 'Offers', icon: <Tag size={20} />, path: '/offers' },
    { id: 'restaurants', label: 'Dining', icon: <Utensils size={20} />, path: '/restaurants' },
    { id: 'guide', label: 'Guide', icon: <MapIcon size={20} />, path: '/guide' },
  ];

  const secondaryItems = [
    { id: 'mystays', label: 'History', icon: <History size={20} />, path: '/mystays' },
    { id: 'helpdesk', label: 'Support', icon: <MessageSquare size={20} />, path: '/helpdesk' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[100px] hover:w-[280px] bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-[110] transition-all duration-500 group overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-4 border-b border-gray-50 h-[100px] shrink-0">
        <Link to="/" className="flex items-center gap-4 shrink-0">
          <img src={logoUrl} className="w-12 h-12 object-contain" alt="Logo" />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-sm font-serif font-black text-gray-900 uppercase leading-none">Shotabdi</h1>
            <p className="text-[6px] text-hotel-primary font-black uppercase tracking-[0.4em] mt-0.5">Residential</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
        <div className="mb-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Main Menu</span>
        </div>
        {navItems.map((item) => (
          <Link 
            key={item.id} 
            to={item.path}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative group/item ${
              location.pathname === item.path 
              ? 'bg-hotel-primary/5 text-hotel-primary' 
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="shrink-0 transition-transform duration-300 group-hover/item:scale-110">
              {item.icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {item.label}
            </span>
            {location.pathname === item.path && (
              <motion.div 
                layoutId="activeNav"
                className="absolute left-0 w-1 h-6 bg-hotel-primary rounded-r-full"
              />
            )}
          </Link>
        ))}

        <div className="mt-10 mb-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Services</span>
        </div>
        {secondaryItems.map((item) => (
          <Link 
            key={item.id} 
            to={item.path}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative group/item ${
              location.pathname === item.path 
              ? 'bg-hotel-primary/5 text-hotel-primary' 
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="shrink-0 transition-transform duration-300 group-hover/item:scale-110">
              {item.icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        ))}

        {isAdmin && (
          <Link 
            to="/admin"
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative group/item ${
              location.pathname === '/admin' 
              ? 'bg-amber-50 text-amber-600' 
              : 'text-amber-600/60 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <div className="shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Admin Console
            </span>
          </Link>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-50 shrink-0">
        {user ? (
          <div className="space-y-2">
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all w-full group/user"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 shrink-0">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full object-cover" alt="User" />
              </div>
              <div className="flex flex-col items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <span className="text-[10px] font-black text-gray-900 uppercase truncate w-full text-left">{profile?.legalName || user.displayName || 'Resident'}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate w-full text-left">{profile?.role || 'Guest'}</span>
              </div>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all w-full group/logout"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Logout
              </span>
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-4 p-4 rounded-2xl bg-hotel-primary text-white hover:brightness-110 transition-all w-full group/login shadow-lg shadow-hotel-primary/20"
          >
            <UserIcon size={20} className="shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Login
            </span>
          </button>
        )}
      </div>

      {/* Vertical Rail Text */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
         <span className="writing-vertical-rl rotate-180 text-[9px] font-black text-gray-300 uppercase tracking-[0.6em]">
            SHOTABDI RESIDENTIAL
         </span>
      </div>
    </aside>
  );
};

export default SidebarNav;

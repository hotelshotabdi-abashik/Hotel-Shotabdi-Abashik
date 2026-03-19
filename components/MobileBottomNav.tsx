
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Map, Utensils, User, LogIn, Tag, LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { OWNER_EMAIL } from '../services/firebase';
import { translations, Language } from '../translations';

interface MobileBottomNavProps {
  user: any;
  profile: UserProfile | null;
  isAdmin: boolean;
  language: Language;
  openAuth: () => void;
  toggleProfile: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user, profile, isAdmin, language, openAuth, toggleProfile }) => {
  const location = useLocation();
  const t = translations[language];

  const navItems = [
    { id: 'home', path: '/', label: t.home, icon: <Home size={16} /> },
    { id: 'offers', path: '/offers', label: t.exclusiveOffers, icon: <Tag size={16} /> },
    { id: 'rooms', path: '/rooms', label: t.rooms, icon: <Bed size={16} /> },
    { id: 'restaurants', path: '/restaurants', label: t.restaurantsTitle, icon: <Utensils size={16} /> },
    { id: 'guide', path: '/guide', label: t.guideTitle, icon: <Map size={16} /> },
    { id: 'gallery', path: '/gallery', label: language === 'EN' ? 'Gallery' : 'গ্যালারি', icon: <ImageIcon size={16} /> },
  ];

  const getRoleLabel = () => {
    if (user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || profile?.role === 'owner') return language === 'EN' ? 'Owner' : 'মালিক';
    if (profile?.role === 'manager') return language === 'EN' ? 'Manager' : 'ম্যানেজার';
    return language === 'EN' ? 'Me' : 'আমি';
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around w-full py-2 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={item.path === '/' ? handleHomeClick : undefined}
              className={`flex flex-col items-center justify-center px-1 py-1 rounded-xl transition-all duration-300 ${
                isActive ? 'text-hotel-primary' : 'text-gray-400'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Dynamic Admin/Profile/Login Button */}
        {isAdmin ? (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center px-1 py-1 rounded-xl transition-all duration-300 relative ${
              location.pathname === '/admin' ? 'text-amber-600' : 'text-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${location.pathname === '/admin' ? 'scale-110' : ''}`}>
              <LayoutDashboard size={16} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap">
              {getRoleLabel()}
            </span>
          </Link>
        ) : (
          <button
            onClick={user ? toggleProfile : openAuth}
            className="flex flex-col items-center justify-center px-1 py-1 rounded-xl transition-all duration-300 relative text-hotel-primary"
          >
            {user ? (
              <div className={`w-4 h-4 rounded-md overflow-hidden border shadow-sm ring-1 transition-all ${isAdmin ? 'border-amber-400 ring-amber-100' : 'border-white ring-gray-100'}`}>
                 <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
              </div>
            ) : (
              <div className="p-0.5">
                <LogIn size={16} />
              </div>
            )}
            <span className="text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap">
              {user ? (language === 'EN' ? 'Me' : 'আমি') : t.login}
            </span>
          </button>
        )}
      </div>
      
      {/* Spacer for bottom safe area insets */}
      <div className="h-[env(safe-area-inset-bottom,0)]"></div>
    </nav>
  );
};

export default MobileBottomNav;

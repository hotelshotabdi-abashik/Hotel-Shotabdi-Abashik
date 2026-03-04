
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Map, Utensils, User, LogIn, Tag, LayoutDashboard } from 'lucide-react';
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
    { id: 'home', path: '/', label: t.home, icon: <Home size={20} /> },
    { id: 'offers', path: '/offers', label: t.exclusiveOffers, icon: <Tag size={20} /> },
    { id: 'rooms', path: '/rooms', label: t.ourLuxuryRooms, icon: <Bed size={20} /> },
    { id: 'restaurants', path: '/restaurants', label: t.restaurantsTitle, icon: <Utensils size={20} /> },
    { id: 'guide', path: '/guide', label: t.guideTitle, icon: <Map size={20} /> },
  ];

  const getRoleLabel = () => {
    if (user?.email === OWNER_EMAIL || profile?.role === 'owner') return language === 'EN' ? 'Owner' : 'মালিক';
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-2 py-3 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-start gap-1 overflow-x-auto no-scrollbar pb-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={item.path === '/' ? handleHomeClick : undefined}
              className={`flex flex-col items-center justify-center min-w-[72px] py-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400'
              }`}
            >
              <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1.5 whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-[1px] h-8 bg-gray-100 mx-2 shrink-0"></div>

        {/* Dynamic Admin/Profile/Login Button */}
        {isAdmin ? (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center min-w-[72px] py-2 rounded-2xl transition-all duration-300 relative ${
              location.pathname === '/admin' ? 'bg-amber-50 text-amber-600' : 'text-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${location.pathname === '/admin' ? 'scale-110' : ''}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter mt-1.5 whitespace-nowrap">
              {getRoleLabel()}
            </span>
          </Link>
        ) : (
          <button
            onClick={user ? toggleProfile : openAuth}
            className={`flex flex-col items-center justify-center min-w-[72px] py-2 rounded-2xl transition-all duration-300 relative ${
              user ? 'text-hotel-primary' : 'text-hotel-primary'
            }`}
          >
            {user ? (
              <div className={`w-6 h-6 rounded-lg overflow-hidden border-2 shadow-sm ring-1 transition-all ${isAdmin ? 'border-amber-400 ring-amber-100' : 'border-white ring-gray-100'}`}>
                 <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
              </div>
            ) : (
              <div className="p-1">
                <LogIn size={20} />
              </div>
            )}
            <span className="text-[9px] font-black uppercase tracking-tighter mt-1.5 whitespace-nowrap">
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


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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = activeItemRef.current;
      
      const itemLeft = item.offsetLeft;
      const itemWidth = item.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      // If item is out of view (left or right), scroll to it
      if (itemLeft < scrollLeft || (itemLeft + itemWidth) > (scrollLeft + containerWidth)) {
        container.scrollTo({
          left: itemLeft - (containerWidth / 2) + (itemWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [location.pathname]);

  const navItems = [
    { id: 'home', path: '/', label: t.home, icon: <Home size={18} /> },
    { id: 'offers', path: '/offers', label: t.exclusiveOffers, icon: <Tag size={18} /> },
    { id: 'rooms', path: '/rooms', label: t.ourLuxuryRooms, icon: <Bed size={18} /> },
    { id: 'restaurants', path: '/restaurants', label: t.restaurantsTitle, icon: <Utensils size={18} /> },
    { id: 'guide', path: '/guide', label: t.guideTitle, icon: <Map size={18} /> },
    { id: 'gallery', path: '/gallery', label: language === 'EN' ? 'Gallery' : 'গ্যালারি', icon: <ImageIcon size={18} /> },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="relative flex items-center">
        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center justify-start overflow-x-auto no-scrollbar py-2.5 pl-3 pr-12 scroll-smooth snap-x snap-mandatory"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                ref={isActive ? (activeItemRef as any) : null}
                onClick={item.path === '/' ? handleHomeClick : undefined}
                className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all duration-300 flex-shrink-0 snap-center ${
                  isActive ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400'
                }`}
              >
                <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tight mt-1 whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Separator */}
          <div className="w-[1px] h-6 bg-gray-100 mx-2 shrink-0 snap-center"></div>

          {/* Dynamic Admin/Profile/Login Button */}
          {isAdmin ? (
            <Link
              to="/admin"
              ref={location.pathname === '/admin' ? (activeItemRef as any) : null}
              className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all duration-300 flex-shrink-0 snap-center relative ${
                location.pathname === '/admin' ? 'bg-amber-50 text-amber-600' : 'text-amber-500'
              }`}
            >
              <div className={`transition-transform duration-300 ${location.pathname === '/admin' ? 'scale-110' : ''}`}>
                <LayoutDashboard size={18} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight mt-1 whitespace-nowrap">
                {getRoleLabel()}
              </span>
            </Link>
          ) : (
            <button
              onClick={user ? toggleProfile : openAuth}
              className="flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all duration-300 flex-shrink-0 snap-center relative text-hotel-primary"
            >
              {user ? (
                <div className={`w-5 h-5 rounded-lg overflow-hidden border-2 shadow-sm ring-1 transition-all ${isAdmin ? 'border-amber-400 ring-amber-100' : 'border-white ring-gray-100'}`}>
                   <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                </div>
              ) : (
                <div className="p-0.5">
                  <LogIn size={18} />
                </div>
              )}
              <span className="text-[9px] font-black uppercase tracking-tight mt-1 whitespace-nowrap">
                {user ? (language === 'EN' ? 'Me' : 'আমি') : t.login}
              </span>
            </button>
          )}
        </div>

        {/* Subtle fade-out effect on the right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10"></div>
      </div>
      
      {/* Spacer for bottom safe area insets */}
      <div className="h-[env(safe-area-inset-bottom,0)]"></div>
    </nav>
  );
};

export default MobileBottomNav;

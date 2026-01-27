
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Map, Utensils, User, LogIn } from 'lucide-react';

interface MobileBottomNavProps {
  user: any;
  isAdmin: boolean;
  openAuth: () => void;
  toggleProfile: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user, isAdmin, openAuth, toggleProfile }) => {
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: <Home size={20} /> },
    { id: 'rooms', path: '/rooms', label: 'Rooms', icon: <Bed size={20} /> },
    { id: 'restaurants', path: '/restaurants', label: 'Dining', icon: <Utensils size={20} /> },
    { id: 'guide', path: '/guide', label: 'Guide', icon: <Map size={20} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-4 left-0 right-0 px-4 z-[70] transition-all duration-500 animate-fade-in">
      <div className="max-w-lg mx-auto bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-[2rem] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 relative ${
                isActive ? 'text-hotel-primary' : 'text-gray-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-hotel-primary/10' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-hotel-primary rounded-full"></div>
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-[1px] h-6 bg-gray-100 mx-1"></div>

        {/* Dynamic Profile/Login Button */}
        <button
          onClick={user ? toggleProfile : openAuth}
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 relative ${
            user ? (isAdmin ? 'text-amber-600' : 'text-hotel-primary') : 'text-hotel-primary'
          }`}
        >
          {user ? (
            <div className="w-6 h-6 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
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
          <span className="text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap">
            {user ? (isAdmin ? 'Admin' : 'Me') : 'Entry'}
          </span>
        </button>
      </div>
      
      {/* Spacer for bottom safe area insets */}
      <div className="h-[env(safe-area-inset-bottom,0)]"></div>
    </nav>
  );
};

export default MobileBottomNav;

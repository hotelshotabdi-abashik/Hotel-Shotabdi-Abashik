
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Map, User, LayoutDashboard, LogIn } from 'lucide-react';

interface MobileBottomNavProps {
  user: any;
  isAdmin: boolean;
  openAuth: (mode: 'login' | 'register') => void;
  toggleProfile: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user, isAdmin, openAuth, toggleProfile }) => {
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: <Home size={20} /> },
    { id: 'rooms', path: '/rooms', label: 'Rooms', icon: <Bed size={20} /> },
    { id: 'guide', path: '/guide', label: 'Guide', icon: <Map size={20} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70] transition-all duration-500 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] px-4 py-3 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${
                isActive ? 'text-hotel-primary scale-110' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-hotel-primary rounded-full"></div>
              )}
            </Link>
          );
        })}

        <div className="w-[1px] h-8 bg-gray-100 mx-1"></div>

        {user ? (
          <button
            onClick={toggleProfile}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${
              isAdmin ? 'text-amber-600' : 'text-hotel-primary'
            }`}
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
               <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">
              {isAdmin ? 'Admin' : 'Me'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => openAuth('login')}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-hotel-primary transition-all duration-300"
          >
            <LogIn size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Entry</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;


import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bed, 
  Utensils, 
  Map as MapIcon, 
  PhoneCall, 
  Compass, 
  Calendar, 
  Users, 
  Search,
  MapPin
} from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts = [
    { id: 'overview', label: 'Hotel', icon: <Home size={20} />, path: '/' },
    { id: 'rooms', label: 'Rooms', icon: <Bed size={20} />, path: '/rooms' },
    { id: 'restaurants', label: 'Dining', icon: <Utensils size={20} />, path: '/restaurants' },
    { id: 'guide', label: 'Holiday', icon: <Compass size={20} />, path: '/guide' },
    { id: 'map', label: 'Location', icon: <MapPin size={20} />, path: 'https://www.google.com/maps/search/?api=1&query=Hotel+Shotabdi+Residential,+WR6H%2BQ2P,+Sylhet%203100', external: true },
    { id: 'support', label: 'Support', icon: <PhoneCall size={20} />, path: 'tel:+8801717425702', external: true },
  ];

  const handleNavigation = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
    <section className="relative pt-10 pb-20 px-4 md:px-10 bg-[#F2F6F9]">
      <div className="max-w-7xl mx-auto">
        
        {/* Shortcut Navigation Bar (SS Inspired) */}
        <div className="bg-white rounded-t-[1.5rem] shadow-sm border-b border-gray-100 flex items-center overflow-x-auto no-scrollbar px-2 md:px-6">
          <div className="flex min-w-max">
            {shortcuts.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.external)}
                  className={`flex items-center gap-2 px-6 py-5 transition-all relative group ${
                    isActive ? 'text-hotel-primary' : 'text-gray-500 hover:text-hotel-primary'
                  }`}
                >
                  <span className={`${isActive ? 'text-hotel-primary' : 'text-gray-400 group-hover:text-hotel-primary'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className={`text-[11px] md:text-sm font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-hotel-primary rounded-t-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interface Card */}
        <div className="bg-white rounded-b-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 md:p-10">
          
          {/* Radio Options Style (SS Inspired) */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#E8F1FF] text-[#1A73E8] rounded-full text-[11px] font-black uppercase tracking-widest border border-transparent">
              <div className="w-4 h-4 rounded-full border-4 border-[#1A73E8] bg-white"></div>
              Round Trip
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-full text-[11px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              One Way
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-full text-[11px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              Multi-City
            </button>
          </div>

          {/* Booking Inputs Grid (SS Inspired) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Location Selector */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-white p-5 flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</span>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-hotel-text">SYL</h4>
                  <p className="text-xs text-gray-500 font-medium truncate">Sylhet, Bangladesh</p>
                </div>
              </div>
              <div className="bg-white p-5 flex flex-col justify-center relative">
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm z-10 hidden md:flex">
                  <MapIcon size={14} className="rotate-90" />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</span>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-hotel-text">DAC</h4>
                  <p className="text-xs text-gray-500 font-medium truncate">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-white p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Check-In</span>
                  <p className="text-sm font-black text-hotel-text">24 May, 2024</p>
                </div>
              </div>
              <div className="bg-white p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Check-Out</span>
                  <p className="text-sm font-black text-hotel-text">26 May, 2024</p>
                </div>
              </div>
            </div>

            {/* Travelers & Search */}
            <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Guests</span>
                  <p className="text-sm font-black text-hotel-text whitespace-nowrap">2 Adults, 1 Room</p>
                </div>
              </div>
              
              <button className="bg-hotel-primary hover:bg-hotel-secondary text-white w-full md:w-20 lg:w-24 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 transition-all active:scale-95 group min-h-[60px] md:min-h-0">
                <Search size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

          </div>

          {/* Bottom Tags (SS Inspired) */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-4 border-hotel-primary bg-white"></div>
              <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Regular Fare</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Student Fare</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Corporate Fare</span>
            </div>
          </div>

        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: '24/7 Security', icon: <div className="text-hotel-primary mx-auto mb-2"><Home size={24} /></div> },
            { label: 'Fast Wi-Fi', icon: <div className="text-hotel-primary mx-auto mb-2"><Compass size={24} /></div> },
            { label: 'City Central', icon: <div className="text-hotel-primary mx-auto mb-2"><MapPin size={24} /></div> },
            { label: 'Great Dining', icon: <div className="text-hotel-primary mx-auto mb-2"><Utensils size={24} /></div> },
          ].map((feature, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white transition-all hover:shadow-lg">
              {feature.icon}
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

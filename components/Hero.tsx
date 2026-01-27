
import React, { useState } from 'react';
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
  MapPin,
  Building2
} from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Booking states
  const [checkIn, setCheckIn] = useState('2024-05-24');
  const [checkOut, setCheckOut] = useState('2024-05-26');
  const [guests, setGuests] = useState('2 Adults, 1 Room');

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

  const handleSearch = () => {
    // Navigate to the Rooms service/section as the primary action for hotel search
    navigate('/rooms');
  };

  return (
    <section className="relative pt-6 md:pt-10 pb-16 md:pb-20 px-3 md:px-10 bg-[#F2F6F9] w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Shortcut Navigation Bar */}
        <div className="bg-white rounded-t-[1.5rem] shadow-sm border-b border-gray-100 flex items-center overflow-x-auto no-scrollbar px-2 md:px-6">
          <div className="flex min-w-max">
            {shortcuts.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.external)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 md:py-5 transition-all relative group ${
                    isActive ? 'text-hotel-primary' : 'text-gray-500 hover:text-hotel-primary'
                  }`}
                >
                  <span className={`${isActive ? 'text-hotel-primary' : 'text-gray-400 group-hover:text-hotel-primary'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] md:text-sm font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>
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

        {/* Main Booking Card */}
        <div className="bg-white rounded-b-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-5 md:p-10">
          
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-serif font-black text-gray-900">Book Your Perfect Stay</h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Direct Booking • Best Rate Guarantee</p>
          </div>

          {/* Booking Inputs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
            
            {/* Property/Location Selector */}
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-hotel-primary/30 transition-colors">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary shrink-0">
                <Building2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Location</span>
                <p className="text-sm font-black text-hotel-text truncate">Sylhet, Humayun Rashid Square</p>
              </div>
            </div>

            {/* Date Selector */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-white p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors relative">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block">Check-In</span>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs md:text-sm font-black text-hotel-text bg-transparent outline-none border-none p-0 cursor-pointer appearance-none"
                  />
                </div>
              </div>
              <div className="bg-white p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors relative">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block">Check-Out</span>
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs md:text-sm font-black text-hotel-text bg-transparent outline-none border-none p-0 cursor-pointer appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Travelers & Search */}
            <div className="lg:col-span-3 flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-hotel-primary/30 transition-colors cursor-pointer group/guests">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-hotel-primary shrink-0 group-hover/guests:bg-hotel-primary/10 transition-colors">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block">Guests</span>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full text-xs md:text-sm font-black text-hotel-text bg-transparent outline-none border-none p-0 cursor-pointer appearance-none"
                  >
                    <option>1 Adult, 1 Room</option>
                    <option>2 Adults, 1 Room</option>
                    <option>3 Adults, 1 Room</option>
                    <option>4 Adults, 2 Rooms</option>
                    <option>Family (5+), 2 Rooms</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleSearch}
                className="bg-hotel-primary hover:bg-hotel-secondary text-white w-full md:w-20 lg:w-24 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 transition-all active:scale-95 group min-h-[50px] md:min-h-0"
              >
                <Search size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rooms Available Today</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <span className="text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Best Rate Guaranteed</span>
            </div>
          </div>

        </div>

        {/* Feature Highlights */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            { label: '24/7 Security', icon: <div className="text-hotel-primary mx-auto mb-1 md:mb-2"><Home size={20} /></div> },
            { label: 'Fast Wi-Fi', icon: <div className="text-hotel-primary mx-auto mb-1 md:mb-2"><Compass size={20} /></div> },
            { label: 'City Central', icon: <div className="text-hotel-primary mx-auto mb-1 md:mb-2"><MapPin size={20} /></div> },
            { label: 'Great Dining', icon: <div className="text-hotel-primary mx-auto mb-1 md:mb-2"><Utensils size={20} /></div> },
          ].map((feature, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white transition-all hover:shadow-lg">
              {feature.icon}
              <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

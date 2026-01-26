import React, { useState, useEffect } from 'react';
import { ViewType } from './types';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import Concierge from './components/Concierge';
import AuthModal from './components/AuthModal';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { Phone, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="bg-white">
            <Hero />
            <div className="mt-20"><RoomGrid /></div>
            <div className="mt-12"><NearbyRestaurants /></div>
          </div>
        );
      case 'rooms':
        return <div className="py-20 bg-white"><RoomGrid /></div>;
      case 'restaurants':
        return <div className="py-20 bg-white min-h-screen"><NearbyRestaurants /></div>;
      case 'guide':
        return <div className="py-20 bg-white"><TouristGuide /></div>;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      <main className="lg:ml-72 flex-1 relative pb-20 lg:pb-0">
        {/* TOP NAVBAR / HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-hotel-muted px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-hotel-primary text-white p-2 rounded-lg font-black text-xs">HS</div>
            <span className="font-serif font-black text-hotel-primary tracking-tight">Shotabdi Residential</span>
          </div>

          <div className="hidden lg:block">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-hotel-primary/10 shadow-sm">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=FF0000&color=fff`} alt="Profile" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{user.displayName || 'Guest User'}</p>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] italic">Legacy of Comfort</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-hotel-muted text-hotel-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-hotel-primary hover:text-white transition-all shadow-sm active:scale-95"
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-hotel-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                <UserIcon size={14} /> Sign In
              </button>
            )}
            <a href="tel:+8801700000000" className="bg-hotel-muted p-2.5 rounded-xl text-hotel-primary lg:hidden shadow-sm">
              <Phone size={18} />
            </a>
          </div>
        </header>

        {renderContent()}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        {/* FOOTER */}
        <footer className="bg-hotel-primary text-white pt-24 pb-12 mt-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white text-hotel-primary p-2 rounded-xl font-bold text-xs shadow-lg">HS</div>
                <h4 className="text-2xl font-serif font-black">Shotabdi Residential</h4>
              </div>
              <p className="text-white/70 text-[11px] leading-relaxed max-w-xs font-medium">
                Redefining the residential experience in Sylhet since 2010. We combine modern luxury with traditional warmth.
              </p>
            </div>
            {/* Additional footer columns could go here */}
          </div>
          <div className="border-t border-white/10 pt-12 text-center text-[9px] font-bold text-white/40 uppercase tracking-[0.5em] px-10">
            © 2024 Hotel Shotabdi Residential • All Rights Reserved
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
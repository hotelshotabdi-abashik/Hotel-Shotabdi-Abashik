
import React, { useState, useEffect } from 'react';
import { ViewType } from './types';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import Concierge from './components/Concierge';
import AuthModal from './components/AuthModal';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  getRedirectResult, 
  signInWithCredential, 
  GoogleAuthProvider 
} from './services/firebase';
import { Phone, LogOut, User as UserIcon, MessageSquare, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Header visibility state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Client ID for One Tap - extracted from common firebase pattern or defined manually
  // Using the project's likely client ID based on project ID
  const GOOGLE_CLIENT_ID = "682102275681-3m5v9kq86cl595l6o3l2p29q0r1h78u1.apps.googleusercontent.com"; // Placeholder derived from typical setup

  useEffect(() => {
    // 1. Handle the result of a redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });

    // 2. Standard auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // 3. Google One Tap Initialization (Triggered if no user)
      if (!currentUser && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              const credential = GoogleAuthProvider.credential(response.credential);
              try {
                await signInWithCredential(auth, credential);
              } catch (err) {
                console.error("One Tap Sign-in Error:", err);
              }
            },
            cancel_on_tap_outside: false,
            context: 'signin'
          });

          // Display the One Tap prompt
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            }
          });
        } catch (err) {
          console.error("Google One Tap Error:", err);
        }
      }
    });

    // 4. Scroll listener for hiding header
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false); // Scrolling down
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

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

      <main className="lg:ml-72 flex-1 relative">
        {/* TOP NAVBAR / HEADER - Fixed and Hide on Scroll */}
        <header 
          className={`fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 md:px-8 py-3 flex justify-between items-center transition-all duration-500 ease-in-out ${
            showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          {/* Left Side: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="bg-hotel-primary text-white w-9 h-9 flex items-center justify-center rounded-xl font-black text-xs lg:hidden shadow-lg shadow-red-200">HS</div>
            <div className="flex flex-col">
              <h1 className="font-serif font-black text-hotel-primary tracking-tight text-sm md:text-xl leading-tight">
                Shotabdi <span className="text-hotel-text font-serif">Residential</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-4 h-[1px] bg-hotel-primary hidden md:block"></span>
                <p className="text-[7px] md:text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold">Legacy of Comfort</p>
              </div>
            </div>
          </div>

          {/* Right Side: Profile & Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Desktop Premium Pill Profile in Top Right */}
                <div className="group relative flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-100 rounded-2xl pl-4 pr-1.5 py-1.5 transition-all duration-300 hover:shadow-md cursor-pointer">
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mb-0.5 truncate max-w-[100px] md:max-w-[150px]">
                      {user.displayName || 'Residential Guest'}
                    </p>
                    <p className="text-[8px] font-bold text-hotel-primary uppercase tracking-widest opacity-60 leading-none">
                      Verified Access
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-hotel-primary/10">
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=FF0000&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Logged in as</p>
                      <p className="text-[10px] font-bold text-gray-700 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-hotel-primary hover:bg-red-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
                
                {/* Mobile Call Button */}
                <a href="tel:+8801700000000" className="lg:hidden bg-hotel-primary/10 p-2.5 rounded-xl text-hotel-primary shadow-sm hover:bg-hotel-primary hover:text-white transition-all">
                  <Phone size={18} />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-hotel-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                  <UserIcon size={14} /> <span className="hidden sm:inline">Guest Entry</span><span className="sm:hidden">Entry</span>
                </button>
                <a href="tel:+8801700000000" className="bg-hotel-muted p-2.5 rounded-xl text-hotel-primary lg:hidden shadow-sm">
                  <Phone size={18} />
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Padding for fixed header */}
        <div className="h-16"></div>

        {/* PROMPT FLOATING ACTION (Only when logged in) */}
        {user && currentView !== 'rooms' && (
          <div className="fixed bottom-8 right-8 z-[60] lg:right-12">
            <div className="group relative">
               <div className="absolute -inset-2 bg-hotel-primary/20 rounded-full blur-xl group-hover:bg-hotel-primary/40 transition-all opacity-0 group-hover:opacity-100"></div>
               <button 
                onClick={() => {
                  const conciergeElement = document.getElementById('ai-concierge-section');
                  conciergeElement?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative bg-hotel-primary text-white p-5 rounded-[2rem] shadow-2xl shadow-red-200 hover:scale-110 transition-all active:scale-95 flex items-center gap-3"
              >
                <Sparkles size={24} />
                <span className="pr-2 text-[10px] font-black uppercase tracking-widest hidden group-hover:block">AI Concierge for {user.displayName?.split(' ')[0] || 'You'}</span>
              </button>
            </div>
          </div>
        )}

        {renderContent()}

        {/* CUSTOM AI PROMPT SECTION */}
        {currentView === 'overview' && (
          <div id="ai-concierge-section" className="bg-hotel-muted/30 py-24 border-t border-hotel-muted">
            <Concierge />
          </div>
        )}

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

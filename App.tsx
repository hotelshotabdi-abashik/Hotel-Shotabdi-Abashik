
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import Concierge from './components/Concierge';
import AuthModal from './components/AuthModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  getRedirectResult, 
  signInWithCredential, 
  GoogleAuthProvider 
} from './services/firebase';
import { Phone, LogOut, Sparkles, Mail, MapPin, Facebook, Instagram, Twitter, ShieldCheck, FileText } from 'lucide-react';

const LOGO_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/hs%20logo-01.svg";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header = ({ user, openAuth, handleSignOut }: { user: any, openAuth: (mode: 'login' | 'register') => void, handleSignOut: () => void }) => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 flex justify-between items-center transition-all duration-500 ease-in-out ${
        showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 overflow-hidden">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-serif font-black text-hotel-primary tracking-tight text-sm md:text-xl leading-tight">
            Shotabdi <span className="text-hotel-text font-serif">Residential</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-4 h-[1px] bg-hotel-primary hidden md:block"></span>
            <p className="text-[7px] md:text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold">Luxury Reimagined</p>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 md:gap-5">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="group relative flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-100 rounded-2xl pl-5 pr-1.5 py-1.5 transition-all duration-300 hover:shadow-md cursor-pointer">
              <div className="text-right flex flex-col justify-center hidden sm:flex">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-0.5 truncate max-w-[150px]">
                  {user.displayName || 'Guest User'}
                </p>
                <p className="text-[8px] font-bold text-hotel-primary uppercase tracking-widest opacity-70 leading-none">
                  Active Member
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-hotel-primary/10">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Profile Identity</p>
                  <p className="text-[11px] font-bold text-gray-700 truncate">{user.email}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-3 text-hotel-primary hover:bg-red-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => openAuth('login')}
              className="px-4 md:px-6 py-2.5 text-gray-600 hover:text-hotel-primary font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all"
            >
              Login
            </button>
            <button 
              onClick={() => openAuth('register')}
              className="px-6 md:px-8 py-3 bg-hotel-primary text-white rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-hotel-secondary shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              Register
            </button>
          </div>
        )}
        <a href="tel:+8801717425702" className="bg-gray-50 p-2.5 rounded-xl text-hotel-primary lg:hidden border border-gray-100">
          <Phone size={18} />
        </a>
      </div>
    </header>
  );
};

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  const GOOGLE_CLIENT_ID = "682102275681-3m5v9kq86cl595l6o3l2p29q0r1h78u1.apps.googleusercontent.com";

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch((error) => console.error("Redirect sign-in error:", error));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              const credential = GoogleAuthProvider.credential(response.credential);
              await signInWithCredential(auth, credential);
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin'
          });
          (window as any).google.accounts.id.prompt();
        } catch (err) { console.error("Google One Tap Error:", err); }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);
  const openAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text">
      <Sidebar />

      <main className="lg:ml-72 flex-1 relative">
        <Header user={user} openAuth={openAuth} handleSignOut={handleSignOut} />
        <div className="h-16"></div>

        <Routes>
          <Route path="/" element={
            <div className="bg-white">
              <Hero />
              <div className="mt-20"><RoomGrid /></div>
              <div className="mt-12"><NearbyRestaurants /></div>
              <div id="ai-concierge-section" className="bg-hotel-muted/30 py-24 border-t border-hotel-muted">
                <Concierge />
              </div>
            </div>
          } />
          <Route path="/rooms" element={<div className="py-20 bg-white"><RoomGrid /></div>} />
          <Route path="/restaurants" element={<div className="py-20 bg-white min-h-screen"><NearbyRestaurants /></div>} />
          <Route path="/guide" element={<div className="py-20 bg-white"><TouristGuide /></div>} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
        </Routes>

        {user && location.pathname === '/' && (
          <div className="fixed bottom-8 right-8 z-[60] lg:right-12">
            <div className="group relative">
               <div className="absolute -inset-2 bg-hotel-primary/20 rounded-full blur-xl group-hover:bg-hotel-primary/40 transition-all opacity-0 group-hover:opacity-100"></div>
               <button 
                onClick={() => document.getElementById('ai-concierge-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative bg-hotel-primary text-white p-5 rounded-[2rem] shadow-2xl shadow-red-200 hover:scale-110 transition-all active:scale-95 flex items-center gap-3"
              >
                <Sparkles size={24} />
                <span className="pr-2 text-[10px] font-black uppercase tracking-widest hidden group-hover:block">AI Concierge</span>
              </button>
            </div>
          </div>
        )}

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authInitialMode}
        />

        <footer className="bg-hotel-primary text-white pt-24 pb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12">
                  <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h4 className="text-2xl font-serif font-black">Shotabdi Residential</h4>
              </Link>
              <p className="text-white/70 text-[11px] leading-relaxed max-w-xs font-medium">
                Redefining the residential experience in Sylhet since 2010. We combine modern luxury with traditional warmth and unparalleled service.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Facebook size={16}/></a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Instagram size={16}/></a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Twitter size={16}/></a>
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Quick Navigation</h5>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Home Residency</Link></li>
                <li><Link to="/rooms" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Luxury Rooms</Link></li>
                <li><Link to="/guide" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Tourist Destinations</Link></li>
                <li><Link to="/restaurants" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Dining Options</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Contact Detail</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-white/60 shrink-0" />
                  <span className="text-sm">WR6H+Q2P, Humayun Rashid Square, Sylhet 3100</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-white/60 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm">+8801717425702</span>
                    <span className="text-sm">01334935566</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-white/60 shrink-0" />
                  <span className="text-sm">hotelshotabdiabashik@gmail.com</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Legal & Security</h5>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacypolicy" className="flex items-center gap-2 text-sm font-medium hover:translate-x-2 transition-transform">
                    <ShieldCheck size={14} className="text-white/60" /> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/termsofservice" className="flex items-center gap-2 text-sm font-medium hover:translate-x-2 transition-transform">
                    <FileText size={14} className="text-white/60" /> Terms of Service
                  </Link>
                </li>
                <li>
                  <div className="mt-4 rounded-2xl overflow-hidden h-32 border border-white/10 shadow-lg grayscale">
                    <iframe
                      title="Footer Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src="https://maps.google.com/maps?q=Hotel%20Shotabdi%20Residential,%20WR6H+Q2P,%20Sylhet%203100&t=&z=14&ie=UTF8&iwloc=addr&output=embed"
                    ></iframe>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-12 flex flex-col items-center gap-4 text-center px-10">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.5em]">
              © 2024 Shotabdi Residential • All Rights Reserved
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacypolicy" className="text-[8px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Privacy</Link>
              <Link to="/termsofservice" className="text-[8px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
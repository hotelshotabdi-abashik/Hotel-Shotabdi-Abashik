
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import AuthModal from './components/AuthModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import MobileBottomNav from './components/MobileBottomNav';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  signInWithCredential, 
  GoogleAuthProvider 
} from './services/firebase';
import { Phone, LogOut, Mail, MapPin, Facebook, Instagram, Twitter, ShieldCheck, FileText, LayoutDashboard, ChevronDown, Loader2 } from 'lucide-react';

const LOGO_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/hs%20logo-01.svg";
const GOOGLE_CLIENT_ID = "682102275681-3m5v9kq86cl595l6o3l2p29q0r1h78u1.apps.googleusercontent.com";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header = ({ user, isAdmin, openAuth, handleSignOut, isAuthLoading, isProfileOpen, setIsProfileOpen }: { 
  user: any, 
  isAdmin: boolean, 
  openAuth: (mode: 'login' | 'register') => void, 
  handleSignOut: () => void,
  isAuthLoading: boolean,
  isProfileOpen: boolean,
  setIsProfileOpen: (val: boolean) => void
}) => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) setShowHeader(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 100) setShowHeader(false);
      else if (currentScrollY < lastScrollY) setShowHeader(true);
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
      <Link to="/" className="flex items-center gap-4 md:gap-5">
        <div className="w-14 h-14 md:w-20 md:h-20 overflow-hidden shrink-0">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-serif font-black text-hotel-primary tracking-tight text-sm md:text-3xl leading-tight">
            Shotabdi <span className="text-hotel-text font-serif">Residential</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-hotel-primary hidden md:block"></span>
            <p className="text-[7px] md:text-[10px] text-gray-400 tracking-[0.3em] uppercase font-bold">Luxury Reimagined</p>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 md:gap-5">
        <div className="hidden lg:flex items-center gap-2 md:gap-5">
          {isAuthLoading ? (
            <div className="p-3 bg-gray-50 rounded-2xl animate-pulse flex items-center gap-2">
              <Loader2 size={16} className="text-hotel-primary animate-spin" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verifying...</span>
            </div>
          ) : user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-100 rounded-2xl pl-4 pr-2 py-2 transition-all duration-300 hover:shadow-md group"
              >
                <div className="text-right flex flex-col justify-center hidden sm:flex">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-0.5 truncate max-w-[120px]">
                    {user.displayName || 'Account'}
                  </p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${isAdmin ? 'text-amber-600' : 'text-hotel-primary'}`}>
                    {isAdmin ? 'Admin Access' : 'Registered Member'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-hotel-primary/10 group-hover:ring-hotel-primary/30 transition-all">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
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
        </div>

        {isProfileOpen && user && (
          <>
            <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm lg:bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
            <div className="absolute top-[80%] lg:top-full right-4 lg:right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-4 border-b border-gray-50 mb-1 bg-gray-50/30">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Session Identity</p>
                <p className="text-xs font-bold text-gray-800 truncate">{user.email}</p>
              </div>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <LayoutDashboard size={14} /> Admin Dashboard
                </Link>
              )}

              <button 
                onClick={() => {
                  handleSignOut();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-hotel-primary hover:bg-red-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={14} /> Log Out Account
              </button>
            </div>
          </>
        )}

        <a href="tel:+8801717425702" className="bg-gray-50 p-2.5 rounded-xl text-hotel-primary border border-gray-100 shadow-sm active:scale-90 transition-all">
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const initializeGoogleOneTap = () => {
    if ((window as any).google && !user) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setIsAuthLoading(true);
            try {
              const credential = GoogleAuthProvider.credential(response.credential);
              const result = await signInWithCredential(auth, credential);
              setUser(result.user);
            } catch (err) {
              console.error("One Tap Authentication Failed:", err);
            } finally {
              setIsAuthLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin'
        });
        (window as any).google.accounts.id.prompt();
      } catch (err) {
        console.warn("One Tap Initialization Warning:", err);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (e) {
          console.error("Claims fetch error:", e);
        }
      } else {
        setIsAdmin(false);
        if ((window as any).google) {
          initializeGoogleOneTap();
        } else {
          const checkScript = setInterval(() => {
            if ((window as any).google) {
              initializeGoogleOneTap();
              clearInterval(checkScript);
            }
          }, 1000);
          setTimeout(() => clearInterval(checkScript), 10000);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    await signOut(auth);
    setIsAuthLoading(false);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text">
      <Sidebar isAdmin={isAdmin} />

      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0">
        <Header 
          user={user} 
          isAdmin={isAdmin} 
          openAuth={openAuth} 
          handleSignOut={handleSignOut} 
          isAuthLoading={isAuthLoading}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />
        <div className="h-16"></div>

        <Routes>
          <Route path="/" element={
            <div className="bg-white">
              <Hero />
              <div className="mt-20"><RoomGrid /></div>
              <div className="mt-12"><NearbyRestaurants /></div>
              <div className="bg-gray-50 py-24 text-center">
                <h3 className="text-3xl font-serif font-black text-hotel-primary">Experience Excellence</h3>
                <p className="text-gray-500 mt-4 max-w-lg mx-auto font-light">Join thousands of happy guests who have made Shotabdi Residential their home away from home in Sylhet.</p>
              </div>
            </div>
          } />
          <Route path="/rooms" element={<div className="py-20 bg-white"><RoomGrid /></div>} />
          <Route path="/restaurants" element={<div className="py-20 bg-white min-h-screen"><NearbyRestaurants /></div>} />
          <Route path="/guide" element={<div className="py-20 bg-white"><TouristGuide /></div>} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/admin" element={
            <div className="p-20 text-center min-h-screen flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mb-6">
                <LayoutDashboard size={40} />
              </div>
              <h1 className="text-3xl font-serif font-black">Admin Management Panel</h1>
              <p className="text-gray-500 mt-4 max-w-md mx-auto">Welcome back. This portal is strictly for authorized personnel of Shotabdi Residential.</p>
            </div>
          } />
        </Routes>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authInitialMode}
          onSuccess={(u) => setUser(u)}
        />

        <MobileBottomNav 
          user={user} 
          isAdmin={isAdmin} 
          openAuth={openAuth} 
          toggleProfile={() => setIsProfileOpen(!isProfileOpen)}
        />

        <footer className="bg-hotel-primary text-white pt-24 pb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-20 h-20 md:w-28 md:h-28 shrink-0">
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

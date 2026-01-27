
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import AuthModal from './components/AuthModal';
import ProfileOnboarding from './components/ProfileOnboarding';
import ManageAccount from './components/ManageAccount';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import MobileBottomNav from './components/MobileBottomNav';
import AdminDashboard from './components/AdminDashboard';
import { 
  auth, 
  db,
  onAuthStateChanged, 
  signOut, 
  signInWithCredential, 
  GoogleAuthProvider,
  syncUserProfile,
  ref,
  get,
  onValue,
  update,
  OWNER_EMAIL
} from './services/firebase';
import { UserProfile, AppNotification } from './types';
import { Phone, LogOut, Mail, MapPin, Facebook, Instagram, Twitter, ShieldCheck, FileText, LayoutDashboard, ChevronDown, Loader2, Map as MapIcon, Settings, UserCheck, Bell, CheckCircle2, Circle } from 'lucide-react';

const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";
const GOOGLE_CLIENT_ID = "682102275681-le7slsv9pnljvq34ht8llnbrkn5mumpg.apps.googleusercontent.com";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header = ({ user, profile, isAdmin, isOwner, openAuth, openManageAccount, handleSignOut, isAuthLoading, isProfileOpen, setIsProfileOpen }: { 
  user: any, 
  profile: UserProfile | null,
  isAdmin: boolean, 
  isOwner: boolean,
  openAuth: () => void, 
  openManageAccount: () => void,
  handleSignOut: () => void,
  isAuthLoading: boolean,
  isProfileOpen: boolean,
  setIsProfileOpen: (val: boolean) => void
}) => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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

  useEffect(() => {
    if (user) {
      const notifRef = ref(db, `notifications/${user.uid}`);
      return onValue(notifRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val()) as AppNotification[];
          setNotifications(data.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setNotifications([]);
        }
      });
    }
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const updates: any = {};
    notifications.forEach(n => {
      if (!n.read) updates[`notifications/${user.uid}/${n.id}/read`] = true;
    });
    await update(ref(db), updates);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogoClick = () => {
    if (isRotating) return;
    setIsRotating(true);
  };

  return (
    <header 
      className={`fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-3 md:px-10 py-3 flex justify-between items-center transition-all duration-500 ease-in-out ${
        showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-1.5 md:gap-4 overflow-hidden">
        <div 
          onClick={handleLogoClick}
          onAnimationEnd={() => setIsRotating(false)}
          className={`w-8 h-8 md:w-12 md:h-12 overflow-hidden shrink-0 cursor-pointer transition-transform duration-500 ${
            isRotating ? 'animate-spin-once' : 'hover:scale-110'
          }`}
        >
          <img src={LOGO_ICON_URL} alt="Logo Icon" className="w-full h-full object-contain pointer-events-none" />
        </div>
        
        <Link to="/" className="flex flex-col overflow-hidden">
          <h1 className="font-serif font-black tracking-tighter md:tracking-tight leading-tight flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-hotel-primary text-[13px] md:text-[22px]">Hotel</span>
            <span className="text-hotel-primary text-[10px] md:text-[18px]">Shotabdi</span>
            <span className="text-hotel-text text-[10px] md:text-[18px]">Residential</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-hotel-primary hidden md:block"></span>
            <p className="text-[6.5px] md:text-[9px] text-gray-400 tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold truncate">Luxury Reimagined</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-5">
        <div className="hidden lg:flex items-center gap-2 md:gap-5">
          {isAuthLoading ? (
            <div className="p-3 bg-gray-50 rounded-2xl animate-pulse flex items-center gap-2">
              <Loader2 size={16} className="text-hotel-primary animate-spin" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verifying Identity...</span>
            </div>
          ) : user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    if (!isNotifOpen) markAllAsRead();
                  }}
                  className="p-3.5 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-hotel-primary transition-all relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notifications</span>
                      <button onClick={() => setIsNotifOpen(false)} className="text-[9px] font-bold text-hotel-primary">Close</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-hotel-primary/5' : ''}`}>
                          <div className="flex gap-3">
                            <CheckCircle2 size={16} className="text-hotel-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-black text-gray-900 leading-tight mb-1">{n.title}</p>
                              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center">
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-100 rounded-2xl pl-4 pr-2 py-2 transition-all duration-300 hover:shadow-md group"
                >
                  <div className="text-right flex flex-col justify-center hidden sm:flex">
                    <div className="flex items-center gap-1.5 justify-end">
                      <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none truncate max-w-[120px]">
                        {profile?.legalName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Member'}
                      </p>
                      {profile?.isComplete && <ShieldCheck size={10} className="text-green-500" />}
                    </div>
                    <p className={`text-[8px] font-bold uppercase tracking-widest leading-none mt-1 ${isOwner ? 'text-purple-600' : isAdmin ? 'text-amber-600' : 'text-hotel-primary'}`}>
                      {isOwner ? 'Proprietor' : isAdmin ? 'Manager' : `@${profile?.username || 'member'}`}
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
            </>
          ) : (
            <button 
              onClick={openAuth}
              className="px-8 py-3 bg-hotel-primary text-white rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-hotel-secondary shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>

        {isProfileOpen && user && (
          <>
            <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm lg:bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
            <div className="absolute top-[80%] lg:top-full right-4 lg:right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-5 border-b border-gray-50 mb-1 bg-gray-50/30">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Memory Brain Active</p>
                <div className="flex flex-col gap-1">
                   <p className="text-[11px] font-black text-gray-800 truncate">{profile?.legalName || user.displayName}</p>
                   <p className="text-[8px] font-bold text-gray-400 truncate tracking-tight">{user.email}</p>
                </div>
                {profile?.isComplete && (
                  <div className="mt-3 py-1.5 px-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2">
                     <UserCheck size={12} className="text-green-500" />
                     <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Verified Member</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  openManageAccount();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                <Settings size={14} className="text-hotel-primary" /> Manage Identity
              </button>
              
              {(isAdmin || isOwner) && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <LayoutDashboard size={14} /> Admin HQ
                </Link>
              )}

              <button 
                onClick={() => {
                  handleSignOut();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-hotel-primary hover:bg-red-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={14} /> End Session
              </button>
            </div>
          </>
        )}

        <a href="tel:+8801717425702" className="bg-gray-50 p-2 rounded-md md:rounded-xl text-hotel-primary border border-gray-100 shadow-sm active:scale-90 transition-all">
          <Phone size={16} className="md:w-[18px] md:h-[18px]" />
        </a>
      </div>
    </header>
  );
};

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadProfile = async (u: any) => {
    const data = await syncUserProfile(u);
    setProfile(data);
    if (u) {
      // Owner Logic
      if (u.email === OWNER_EMAIL) {
        setIsOwner(true);
        setIsAdmin(true);
      } else {
        await fetchUserRole(u.uid);
      }
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const roleRef = ref(db, `roles/${userId}`);
      const roleSnap = await get(roleRef);
      if (roleSnap.exists()) {
        const role = roleSnap.val();
        setIsAdmin(role === 'admin' || role === 'owner');
        setIsOwner(role === 'owner');
      }
    } catch (err) {
      console.error("Memory Access Error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await loadProfile(currentUser);
      }
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (!currentUser) {
        setIsAdmin(false);
        setIsOwner(false);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    await signOut(auth);
    setIsAuthLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      <Sidebar isAdmin={isAdmin || isOwner} />

      {/* Persistent Onboarding Memory */}
      {user && profile && !profile.isComplete && (
        <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />
      )}

      {/* Account Memory Management */}
      {user && profile && isManageAccountOpen && (
        <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />
      )}

      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full overflow-x-hidden">
        <Header 
          user={user} 
          profile={profile}
          isAdmin={isAdmin} 
          isOwner={isOwner}
          openAuth={() => setIsAuthModalOpen(true)} 
          openManageAccount={() => setIsManageAccountOpen(true)}
          handleSignOut={handleSignOut} 
          isAuthLoading={isAuthLoading}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />
        <div className="h-20 md:h-24"></div>

        <Routes>
          <Route path="/" element={
            <div className="bg-white">
              <Hero />
              <div className="mt-10 md:mt-20"><RoomGrid /></div>
              <div className="mt-8 md:mt-12"><NearbyRestaurants /></div>
              <div className="bg-gray-50 py-16 md:py-24 text-center px-6">
                <h3 className="text-2xl md:text-3xl font-serif font-black text-hotel-primary">Experience Excellence</h3>
                <p className="text-gray-500 mt-4 max-w-lg mx-auto font-light text-sm md:text-base">Join thousands of verified guests who have made Shotabdi Residential their trusted choice in Sylhet.</p>
              </div>
            </div>
          } />
          <Route path="/rooms" element={<div className="py-10 md:py-20 bg-white"><RoomGrid /></div>} />
          <Route path="/restaurants" element={<div className="py-10 md:py-20 bg-white min-h-screen"><NearbyRestaurants /></div>} />
          <Route path="/guide" element={<div className="py-10 md:py-20 bg-white"><TouristGuide /></div>} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/admin" element={
            (isAdmin || isOwner) ? (
              <AdminDashboard />
            ) : (
              <div className="p-10 md:p-20 text-center min-h-screen flex flex-col items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-3xl flex items-center justify-center text-hotel-primary mb-6 shadow-inner ring-1 ring-red-100">
                  <LayoutDashboard size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-black">Secure Admin Gateway</h1>
                <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm font-medium">Access restricted to authorized HQ personnel only.</p>
              </div>
            )
          } />
        </Routes>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={async (u) => {
            await loadProfile(u);
            setUser(u);
          }}
        />

        <MobileBottomNav 
          user={user} 
          isAdmin={isAdmin || isOwner} 
          openAuth={() => setIsAuthModalOpen(true)} 
          toggleProfile={() => setIsProfileOpen(!isProfileOpen)}
        />

        <footer className="bg-hotel-primary text-white pt-16 md:pt-24 pb-12 relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-4 group">
                <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 brightness-0 invert transition-transform duration-500 group-hover:scale-105">
                  <img src={LOGO_ICON_URL} alt="Logo Icon" className="w-full h-full object-contain" />
                </div>
              </Link>
              <p className="text-white/70 text-[11px] leading-relaxed max-w-xs font-medium">
                Redefining the residential experience in Sylhet since 2010. We combine modern luxury with professional integrity.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <a href="#" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Facebook size={18}/></a>
                <a href="#" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Instagram size={18}/></a>
                <a href="#" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Twitter size={18}/></a>
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-2">Direct Links</h5>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Home</Link></li>
                <li><Link to="/rooms" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Our Suites</Link></li>
                <li><Link to="/guide" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Tourist Guide</Link></li>
                <li><Link to="/restaurants" className="text-sm font-medium hover:translate-x-2 transition-transform inline-block">Dining Options</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-2">HQ Contact</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-white/60 shrink-0" />
                  <span className="text-sm">Kumargaon, Bus Stand, Sylhet 3100</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-white/60 shrink-0" />
                  <span className="text-sm font-bold">+8801717425702</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-white/60 shrink-0" />
                  <span className="text-sm break-all">hotelshotabdiabashik@gmail.com</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-2">Security & Legal</h5>
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
                  <div className="mt-4 rounded-2xl overflow-hidden h-32 border border-white/20 shadow-lg grayscale hover:grayscale-0 transition-all duration-700">
                    <iframe
                      title="Footer Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src="https://maps.google.com/maps?q=Hotel%20Shotabdi%20Residential,%20Kumargaon,%20Bus%20Stand,%20Sylhet%203100&t=&z=14&ie=UTF8&iwloc=addr&output=embed"
                    ></iframe>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-12 flex flex-col items-center gap-4 text-center px-6">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.5em]">
              © 2024 Shotabdi Residential • All Rights Reserved
            </p>
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


import React, { useState, useEffect, useCallback } from 'react';
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
  syncUserProfile,
  ref,
  get,
  onValue,
  update,
  OWNER_EMAIL
} from './services/firebase';
import { UserProfile, AppNotification } from './types';
import { Phone, LogOut, LayoutDashboard, ChevronDown, Loader2, Settings, Bell, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";

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

  return (
    <header className={`fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-3 md:px-10 py-3 flex justify-between items-center transition-all duration-500 ease-in-out ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="flex items-center gap-1.5 md:gap-4 overflow-hidden">
        <Link to="/" className="w-8 h-8 md:w-12 md:h-12 overflow-hidden shrink-0 hover:scale-110 transition-transform">
          <img src={LOGO_ICON_URL} alt="Logo" className="w-full h-full object-contain" />
        </Link>
        <div className="flex flex-col overflow-hidden">
          <h1 className="font-serif font-black tracking-tighter md:tracking-tight leading-tight flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-hotel-primary text-[13px] md:text-[22px]">Hotel</span>
            <span className="text-hotel-primary text-[10px] md:text-[18px]">Shotabdi</span>
            <span className="text-hotel-text text-[10px] md:text-[18px]">Residential</span>
          </h1>
          <p className="text-[6.5px] md:text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold truncate">Luxury Reimagined</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isAuthLoading ? (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <Loader2 size={14} className="animate-spin text-hotel-primary" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) markAllAsRead(); }}
                className="p-3 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-hotel-primary transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">{unreadCount}</span>}
              </button>
              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Updates</span>
                    <button onClick={() => setIsNotifOpen(false)} className="text-[9px] font-bold text-hotel-primary">Close</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-hotel-primary/5' : ''}`}>
                        <div className="flex gap-3">
                          <CheckCircle2 size={14} className="text-hotel-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-gray-900 leading-tight mb-0.5">{n.title}</p>
                            <p className="text-[9px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    )) : <div className="p-8 text-center text-[9px] font-bold text-gray-300 uppercase">No alerts</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 pl-3 hover:shadow-md transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-gray-900 leading-none truncate max-w-[80px]">{profile?.legalName?.split(' ')[0] || 'Guest'}</p>
                  <p className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${isOwner ? 'text-amber-600' : 'text-hotel-primary'}`}>{isOwner ? 'Owner' : 'Member'}</p>
                </div>
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-8 h-8 rounded-xl object-cover border border-gray-100" />
              </button>
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in">
                  {(isAdmin || isOwner) && (
                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest">
                      <LayoutDashboard size={14} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { openManageAccount(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest">
                    <Settings size={14} /> My Profile
                  </button>
                  <button onClick={() => { handleSignOut(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-hotel-primary hover:bg-red-50 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest border-t border-gray-50 mt-1 pt-2">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button onClick={openAuth} className="px-6 py-2.5 bg-hotel-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-hotel-secondary shadow-lg shadow-red-100 transition-all">Login</button>
        )}
        <a href="tel:+8801717425702" className="p-2.5 bg-gray-50 text-hotel-primary rounded-xl border border-gray-100 hover:bg-white transition-all">
          <Phone size={18} />
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

  const loadProfile = useCallback(async (u: any) => {
    if (!u) return;
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      
      if (u.email === OWNER_EMAIL) {
        setIsOwner(true);
        setIsAdmin(true);
        return;
      }

      const roleRef = ref(db, `roles/${u.uid}`);
      const roleSnap = await get(roleRef);
      if (roleSnap.exists()) {
        const role = roleSnap.val();
        setIsAdmin(role === 'admin' || role === 'owner');
      }
    } catch (error) {
      console.warn("Background Sync Warning:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Clear loading state as soon as we have a user object
        // Even if the profile is still loading in background
        setIsAuthLoading(false);
        loadProfile(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsOwner(false);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    await signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      <Sidebar isAdmin={isAdmin || isOwner} />
      {user && profile && !profile.isComplete && !isAuthLoading && (
        <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />
      )}
      {user && profile && isManageAccountOpen && (
        <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />
      )}
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full">
        <Header 
          user={user} profile={profile} isAdmin={isAdmin} isOwner={isOwner}
          openAuth={() => setIsAuthModalOpen(true)} 
          openManageAccount={() => setIsManageAccountOpen(true)}
          handleSignOut={handleSignOut} 
          isAuthLoading={isAuthLoading}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />
        <div className="h-20"></div>

        <Routes>
          <Route path="/" element={<div className="bg-white"><Hero /><div className="mt-10"><RoomGrid /></div><div className="mt-8"><NearbyRestaurants /></div></div>} />
          <Route path="/rooms" element={<div className="py-10 bg-white"><RoomGrid /></div>} />
          <Route path="/restaurants" element={<div className="py-10 bg-white min-h-screen"><NearbyRestaurants /></div>} />
          <Route path="/guide" element={<div className="py-10 bg-white"><TouristGuide /></div>} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/admin" element={(isAdmin || isOwner) ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-serif font-black">Restricted Area</h1></div>} />
        </Routes>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <MobileBottomNav user={user} isAdmin={isAdmin || isOwner} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsProfileOpen(!isProfileOpen)} />

        <footer className="bg-hotel-primary text-white pt-16 pb-12 w-full text-center">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.5em]">© 2024 Shotabdi Residential • All Rights Reserved</p>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AppContent />
  </BrowserRouter>
);

export default App;

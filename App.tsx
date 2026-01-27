
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
  onAuthStateChanged, 
  syncUserProfile,
  OWNER_EMAIL,
  db,
  ref,
  onValue,
  update
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification } from './types';
import { LogIn, Loader2, Bell, Edit3, Eye, Globe, RefreshCw, X, Info } from 'lucide-react';
import { ROOMS_DATA } from './constants';

const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";
const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // CMS States
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero: {
      title: "Luxury Rooms in Sylhet",
      subtitle: "Enjoy the best stay at the heart of the city.",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      buttonText: "Book Now"
    },
    rooms: ROOMS_DATA,
    announcement: "25% OFF DISCOUNT",
    lastUpdated: 0
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${CMS_WORKER_URL}/site-config.json`);
      if (res.ok) {
        const data = await res.json();
        setSiteConfig(prev => data.lastUpdated > prev.lastUpdated ? data : prev);
      }
    } catch (e) {
      console.warn("Using default settings.");
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data) as AppNotification[];
        setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = { ...siteConfig, lastUpdated: Date.now() };
      const res = await fetch(`${CMS_WORKER_URL}/site-config.json`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': ADMIN_SECRET 
        },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        setSiteConfig(updatedConfig);
        alert("Website published!");
        setIsEditMode(false);
      } else {
        throw new Error("Save failed");
      }
    } catch (e) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadToR2 = async (file: File, folder: string): Promise<string> => {
    const cleanFolderName = folder.replace(/^\/|\/$/g, '');
    const filename = `${cleanFolderName}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const res = await fetch(`${CMS_WORKER_URL}/${filename}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': file.type,
        'Authorization': ADMIN_SECRET 
      },
      body: file
    });
    if (!res.ok) throw new Error("Upload failed");
    return `${CMS_WORKER_URL}/${filename}`;
  };

  const loadProfile = useCallback(async (u: any) => {
    if (!u) return;
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      if (u.email === OWNER_EMAIL) {
        setIsOwner(true);
        setIsAdmin(true);
      }
    } catch (error) {
      console.warn("Profile Sync Issue");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
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

  const markAllAsRead = async () => {
    if (!user) return;
    const updates: any = {};
    notifications.forEach(n => {
      updates[`notifications/${user.uid}/${n.id}/read`] = true;
    });
    await update(ref(db), updates);
  };

  const toggleAuth = () => {
    setIsNotificationsOpen(false);
    setIsManageAccountOpen(false);
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  const toggleNotifications = () => {
    setIsAuthModalOpen(false);
    setIsManageAccountOpen(false);
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) markAllAsRead();
  };

  const toggleManageAccount = () => {
    setIsAuthModalOpen(false);
    setIsNotificationsOpen(false);
    setIsManageAccountOpen(!isManageAccountOpen);
  };

  const handleLogoClick = () => {
    setIsLogoSpinning(true);
    setTimeout(() => setIsLogoSpinning(false), 600);
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      {isOwner && (
        <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-3 pointer-events-auto">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-6 py-4 rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest ${
              isEditMode ? 'bg-hotel-primary text-white' : 'bg-white text-gray-900 border border-gray-100'
            }`}
          >
            {isEditMode ? <><Eye size={18} /> View Site</> : <><Edit3 size={18} /> Edit Site</>}
          </button>
          
          {isEditMode && (
            <button 
              onClick={saveConfig}
              disabled={isSaving}
              className="px-6 py-4 bg-green-600 text-white rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:scale-105"
            >
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
              Save Site
            </button>
          )}
        </div>
      )}

      <Sidebar isAdmin={isAdmin || isOwner} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {/* Main Header */}
        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 md:gap-4 group">
              <div 
                onClick={handleLogoClick}
                className="cursor-pointer select-none"
              >
                <img 
                  src={LOGO_ICON_URL} 
                  className={`w-10 h-10 md:w-14 md:h-14 object-contain ${isLogoSpinning ? 'animate-spin-once' : ''}`} 
                  alt="Logo" 
                />
              </div>
              <div className="flex flex-col select-none leading-none -space-y-0.5 md:-space-y-1">
                <h1 className="text-2xl md:text-4xl font-serif font-black text-gray-900 tracking-tighter uppercase">Hotel Shotabdi</h1>
                <p className="text-[10px] md:text-[12px] text-hotel-primary font-bold uppercase tracking-[0.4em]">Residential</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthLoading ? (
              <Loader2 className="animate-spin text-gray-300" size={18} />
            ) : user ? (
              <div className="flex items-center gap-2 md:gap-4 relative">
                <button 
                  onClick={toggleNotifications}
                  className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary'}`}
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button 
                  onClick={toggleManageAccount}
                  className={`flex items-center gap-3 bg-gray-50 hover:bg-white border p-1.5 pr-4 rounded-2xl transition-all group ${isManageAccountOpen ? 'border-hotel-primary/30 ring-4 ring-hotel-primary/5' : 'border-gray-100'}`}
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                      className="w-full h-full object-cover" 
                      alt="User"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] font-black text-gray-900 leading-tight">
                      {profile?.username ? `@${profile.username}` : 'Guest'}
                    </p>
                    {isOwner && <span className="text-[8px] font-black text-hotel-primary uppercase tracking-widest">Owner</span>}
                  </div>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute top-16 right-0 w-[300px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-[100]">
                    <div className="bg-[#B22222] p-6 text-white flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Alerts</h3>
                      </div>
                      <button onClick={() => setIsNotificationsOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar p-4 space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-gray-50 opacity-60' : 'bg-red-50/50 border-hotel-primary/10'}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'booking_update' ? 'bg-[#B22222] text-white' : 'bg-blue-500 text-white'}`}>
                                <Info size={14} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase">{n.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-gray-400">
                          <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={toggleAuth}
                className="flex items-center gap-3 bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
              >
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="animate-fade-in">
                <Hero 
                  config={siteConfig.hero} 
                  isEditMode={isEditMode}
                  onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}, lastUpdated: Date.now()}))}
                  onImageUpload={(f) => uploadToR2(f, 'Hero Section')}
                />
                <RoomGrid 
                  rooms={siteConfig.rooms} 
                  isEditMode={isEditMode}
                  onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r, lastUpdated: Date.now()}))}
                  onImageUpload={(f) => uploadToR2(f, 'Rooms')}
                />
                <NearbyRestaurants />
              </div>
            } />
            <Route path="/rooms" element={<div className="py-10"><RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'Rooms')} /></div>} />
            <Route path="/restaurants" element={<div className="py-10 min-h-screen"><NearbyRestaurants /></div>} />
            <Route path="/guide" element={<div className="py-10"><TouristGuide /></div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
            <Route path="/admin" element={(isAdmin || isOwner) ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen">Denied</div>} />
          </Routes>
        </div>

        <footer className="bg-white border-t border-gray-50 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <img src={LOGO_ICON_URL} className="w-8 h-8 opacity-20 grayscale" alt="Logo" />
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Hotel Shotabdi Residential</p>
                <p className="text-[9px] text-gray-200 font-bold uppercase mt-0.5">Premium Hotel • Sylhet</p>
              </div>
            </div>
            
            <div className="flex gap-10">
              <Link to="/privacypolicy" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-hotel-primary">Privacy Policy</Link>
              <Link to="/termsofservice" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-hotel-primary">Terms</Link>
            </div>

            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
              © 2024 • All Rights Reserved
            </p>
          </div>
        </footer>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
        
        {user && profile && !profile.isComplete && <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />}
        
        {user && profile && isManageAccountOpen && (
          <ManageAccount 
            profile={profile} 
            onClose={() => setIsManageAccountOpen(false)} 
            onUpdate={() => loadProfile(user)} 
          />
        )}
        
        <MobileBottomNav 
          user={user} 
          isAdmin={isAdmin || isOwner} 
          openAuth={toggleAuth} 
          toggleProfile={toggleManageAccount} 
        />
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

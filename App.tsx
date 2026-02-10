
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ExclusiveOffers from './components/ExclusiveOffers';
import OfferPage from './components/OfferPage';
import RoomGrid from './components/RoomGrid';
import TouristGuide from './components/TouristGuide';
import NearbyRestaurants from './components/NearbyRestaurants';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import ProfileOnboarding from './components/ProfileOnboarding';
import ManageAccount from './components/ManageAccount';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import MobileBottomNav from './components/MobileBottomNav';
import AdminDashboard from './components/AdminDashboard';
import HelpDex from './components/HelpDex';
import MyStays from './components/MyStays';
import { 
  auth, 
  onAuthStateChanged, 
  signOut,
  syncUserProfile,
  OWNER_EMAIL,
  db,
  ref,
  onValue,
  update,
  get
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Restaurant, Attraction, Offer, Booking, Room } from './types';
import { LogIn, Loader2, Bell, Edit3, Globe, Save, Megaphone, Camera, RefreshCw, X, Calendar, MessageSquare, Shield, CheckCheck, Trash2, LogOut, User as UserIcon, AlertTriangle } from 'lucide-react';
import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL } from './constants';

const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

const RouteMetadata = ({ siteConfig }: { siteConfig: SiteConfig }) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    let title = 'Hotel Shotabdi Abashik | Best Luxury Stay in Sylhet';
    let desc = 'Book your stay at Hotel Shotabdi Abashik, the premier luxury residential hotel in Sylhet. 24/7 service, free Wi-Fi, and prime location near Keane Bridge.';
    
    const metaConfig: Record<string, { title: string; desc: string }> = {
      '/': { 
        title: 'Hotel Shotabdi Abashik | Premium Residential Stay in Sylhet',
        desc: 'Experience Elite hospitality at Hotel Shotabdi Abashik. Prime location near Sylhet Railway and Bus stations.'
      },
      '/offers': { 
        title: 'Exclusive Deals | Shotabdi Abashik Luxury Offers',
        desc: 'Discover seasonal 25% discounts and premium residential offers at Hotel Shotabdi Abashik.'
      },
      '/rooms': { 
        title: 'Luxury Rooms & Suites | Hotel Shotabdi Abashik',
        desc: 'Explore AC rooms, Deluxe Single, and Family Suites at Hotel Shotabdi Abashik Sylhet.'
      },
      '/restaurants': { 
        title: 'Dining Near Hotel Shotabdi Abashik | Sylhet Food Guide',
        desc: 'Find the best restaurants near Hotel Shotabdi Abashik. Traditional Bengali and international cuisines.'
      },
      '/guide': { 
        title: 'Visit Shah Jalal Dargah & Keane Bridge | Sylhet Guide',
        desc: 'Explore Sylhet with Hotel Shotabdi. Local attractions within 2km of our residence.'
      },
      '/helpdex': { 
        title: 'Registry Help Dex | Hotel Shotabdi Abashik',
        desc: 'Direct synchronization with the Registry Admin for 24/7 resident support.'
      },
      '/mystays': {
        title: 'My Stays | Hotel Shotabdi Abashik Stay History',
        desc: 'Access your submitted stay records and digital identity receipts at Hotel Shotabdi Abashik.'
      }
    };

    const current = metaConfig[pathname] || metaConfig['/'];
    document.title = current.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', current.desc);
  }, [pathname, siteConfig]);
  
  return null;
};

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [isLogoUpdating, setIsLogoUpdating] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero: {
      title: "Experience Luxury",
      subtitle: "Provides 24-hour front desk and room services, along with high-speed free Wi-Fi and free parking",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      buttonText: "Book Now",
      locationLabel: "Sylhet HQ District"
    },
    rooms: ROOMS_DATA,
    offers: [],
    restaurants: SYLHET_RESTAURANTS,
    touristGuides: SYLHET_ATTRACTIONS,
    announcement: "25% OFF DISCOUNT",
    logoUrl: LOGO_ICON_URL,
    lastUpdated: 0
  });

  useEffect(() => {
    const configRef = ref(db, 'site-config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSiteConfig(prev => !isSaving ? { ...prev, ...data } : prev);
      }
      setIsConfigLoading(false);
    });
    return () => unsubscribe();
  }, [isSaving]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const unsub = onValue(notificationsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()) as AppNotification[];
        setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setNotifications([]);
      }
    });
    return () => unsub();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await update(ref(db, `notifications/${user.uid}/${id}`), { read: true });
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const updates: any = {};
      notifications.forEach(n => {
        if (!n.read) updates[`notifications/${user.uid}/${n.id}/read`] = true;
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    } catch (err) { console.error(err); }
  };

  const loadProfile = useCallback(async (u: any) => {
    if (!u) {
      setProfile(null);
      setIsAdmin(false);
      setIsOwner(false);
      return;
    }
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      if (u.email === OWNER_EMAIL) { setIsOwner(true); setIsAdmin(true); }
    } catch (error) { console.warn("Profile Sync Issue"); }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) loadProfile(currentUser);
      else {
        setProfile(null);
        setIsAdmin(false);
        setIsOwner(false);
      }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleLogoClick = () => {
    setIsLogoSpinning(true);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLogoSpinning(false), 2000);
  };

  const uploadToR2 = async (file: File, folder: string): Promise<string> => {
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const url = `${CMS_WORKER_URL}/${filename}`;
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type, 'Authorization': ADMIN_SECRET }, body: file });
    return url;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      setIsLogoUpdating(true);
      try {
        const url = await uploadToR2(file, 'Logo');
        setSiteConfig(prev => ({ ...prev, logoUrl: url }));
        alert("Branding Updated. Don't forget to Publish Site to save permanently.");
      } catch (err) {
        alert("Logo update failed.");
      } finally {
        setIsLogoUpdating(false);
      }
    } else if (file) {
      alert("Please upload a PNG or SVG for proper transparency.");
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = { ...siteConfig, lastUpdated: Date.now() };
      await update(ref(db), { 'site-config': updatedConfig });
      setIsEditMode(false);
      alert("Website Updated Live!");
    } catch (error) {
      alert("Update Failed. Check Connectivity.");
    } finally { setIsSaving(false); }
  };

  if (isConfigLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Restoring Shotabdi Hub...</p>
    </div>
  );

  const currentLogo = siteConfig.logoUrl || LOGO_ICON_URL;
  const unreadCount = notifications.filter(n => !n.read).length;
  const isProfileIncomplete = user && profile && !profile.isComplete;

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      <RouteMetadata siteConfig={siteConfig} />
      <Sidebar isAdmin={isAdmin || isOwner} logoUrl={currentLogo} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {/* Profile Incomplete Warning */}
        {isProfileIncomplete && (
          <div className="bg-amber-500 text-white py-3 px-6 text-center z-[70] relative flex items-center justify-center gap-3 animate-fade-in shadow-lg">
             <AlertTriangle size={16} className="shrink-0 animate-bounce" />
             <p className="font-black text-[10px] md:text-[11px] uppercase tracking-widest">
               Your registry identity is incomplete. <button onClick={() => setIsManageAccountOpen(true)} className="underline decoration-2 underline-offset-4 ml-1">Complete Registry Now</button> to unlock full features.
             </p>
          </div>
        )}

        {(siteConfig.announcement || isEditMode) && (
          <div className="bg-hotel-primary text-white py-2.5 px-6 text-center z-[65] relative flex items-center justify-center gap-3 overflow-hidden">
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
            <p className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] truncate">{siteConfig.announcement}</p>
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
          </div>
        )}

        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 md:py-4 flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center gap-4">
            <div className="lg:hidden flex items-center gap-3 md:gap-4 group cursor-pointer relative" onClick={handleLogoClick}>
              <div className="relative">
                <img src={currentLogo} className={`w-12 h-12 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-110 ${isLogoSpinning ? 'animate-spin-once' : ''}`} alt="Hotel Shotabdi Abashik" />
                {isEditMode && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    <input type="file" className="hidden" accept=".png,.svg" onChange={handleLogoChange} />
                    {isLogoUpdating ? <RefreshCw className="animate-spin text-white" size={16} /> : <Camera className="text-white" size={16} />}
                  </label>
                )}
              </div>
              <div className="flex flex-col select-none leading-none -space-y-1">
                <h1 className="text-lg md:text-xl font-serif font-black text-gray-900 tracking-tight">Hotel Shotabdi</h1>
                <p className="text-[8px] md:text-[9px] text-hotel-primary font-black uppercase tracking-[0.4em]">Abashik</p>
              </div>
            </div>
            <div className="hidden lg:block">
               <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-400">Hotel Shotabdi Abashik</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {(isAdmin || isOwner) && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-100 text-amber-600 animate-pulse shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Edit3 size={16} /> {isEditMode ? 'Editing Live' : 'Edit Web'}
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                    className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary'}`}
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-hotel-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-[100] bg-black/5 md:hidden" onClick={() => setIsNotificationsOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-4 w-[calc(100vw-32px)] md:w-96 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[110] animate-fade-in origin-top-right">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Vault Notifications</h3>
                           {unreadCount > 0 && (
                             <button onClick={handleMarkAllRead} className="text-[10px] font-black text-hotel-primary hover:underline uppercase tracking-widest flex items-center gap-1.5">
                               <CheckCheck size={14} /> Clear All
                             </button>
                           )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                           {notifications.length > 0 ? (
                             notifications.map((notif) => (
                               <div 
                                 key={notif.id} 
                                 onClick={() => handleMarkAsRead(notif.id)}
                                 className={`p-5 border-b border-gray-50 last:border-0 flex gap-4 transition-colors cursor-pointer group ${!notif.read ? 'bg-hotel-primary/[0.02]' : 'hover:bg-gray-50'}`}
                               >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${!notif.read ? 'bg-hotel-primary/10 text-hotel-primary border-hotel-primary/10' : 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                                    {notif.type === 'booking_update' ? <Calendar size={20} /> : notif.type === 'chat_message' ? <MessageSquare size={20} /> : <Shield size={20} />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                      <h4 className={`text-[13px] leading-tight truncate ${!notif.read ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{notif.title}</h4>
                                      {!notif.read && <div className="w-2 h-2 bg-hotel-primary rounded-full shrink-0 mt-1"></div>}
                                    </div>
                                    <p className={`text-[11px] leading-relaxed mb-2 ${!notif.read ? 'font-semibold text-gray-600' : 'text-gray-400'}`}>{notif.message}</p>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div className="p-16 text-center">
                               <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-4 border border-gray-100">
                                 <Bell size={24} />
                               </div>
                               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Registry Vault Empty</p>
                             </div>
                           )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-4 bg-gray-50/50 text-center">
                             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">End of Synchronization</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Profile Actions Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 transition-transform active:scale-90"
                  >
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full object-cover" alt="User" />
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[100] md:hidden" onClick={() => setIsProfileMenuOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[110] animate-fade-in origin-top-right">
                         <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{profile?.legalName || user.displayName || 'Guest'}</p>
                            <p className="text-[9px] text-gray-400 truncate uppercase tracking-widest font-bold mt-0.5">{user.email}</p>
                         </div>
                         <div className="p-2 space-y-1">
                            <button 
                              onClick={() => { setIsManageAccountOpen(true); setIsProfileMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-gray-600 hover:bg-hotel-primary/5 hover:text-hotel-primary transition-all uppercase tracking-widest"
                            >
                              <UserIcon size={16} /> Manage Account
                            </button>
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest"
                            >
                              <LogOut size={16} /> Log Out
                            </button>
                         </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-3 bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all">
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </header>

        {isEditMode && (
          <div className="fixed bottom-32 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-2xl px-10 py-6 rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center gap-10 animate-fade-in ring-1 ring-white/20">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                  <Globe size={24} className="animate-pulse" />
                </div>
                <div>
                   <p className="text-[12px] font-black text-white uppercase tracking-widest">Global Live Editor</p>
                   <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-0.5">Unsaved Changes Detected</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setIsEditMode(false)} className="px-8 py-3.5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                <button 
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                  Publish Site
                </button>
             </div>
          </div>
        )}

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<><Hero config={siteConfig.hero} isEditMode={isEditMode} onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}}))} onImageUpload={(f) => uploadToR2(f, 'hero')} /><ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} onImageUpload={(f) => uploadToR2(f, 'offers')} onClaim={(o) => setActiveDiscount(o.discountPercent || 0)} /><RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} onImageUpload={(f) => uploadToR2(f, 'rooms')} onBook={setSelectedRoomToBook} /></>} />
            <Route path="/offers" element={<ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} onImageUpload={(f) => uploadToR2(f, 'offers')} />} />
            <Route path="/offers/:offerId" element={<OfferPage offers={siteConfig.offers} />} />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} onImageUpload={(f) => uploadToR2(f, 'rooms')} onBook={setSelectedRoomToBook} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} onImageUpload={(f) => uploadToR2(f, 'restaurants')} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} onImageUpload={(f) => uploadToR2(f, 'guide')} />} />
            <Route path="/helpdex" element={<HelpDex profile={profile} />} />
            <Route path="/mystays" element={<MyStays profile={profile} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center">Unauthorized</div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
          </Routes>
        </div>

        <footer id="main-footer" className="bg-white border-t border-gray-100 py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <img src={currentLogo} className="w-14 h-14 object-contain transition-transform group-hover:scale-110 grayscale" alt="Hotel Shotabdi Abashik Logo" />
                <div>
                  <p className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Hotel Shotabdi</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-0.5">Abashik Hub</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed">Verified residential perfection at the heart of Sylhet. Official Hotel Shotabdi Abashik.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[11px] font-bold uppercase tracking-widest text-gray-400">
               <address className="not-italic space-y-4">
                 <p className="text-gray-900 font-black">Contact</p>
                 <a href="tel:+8801717425702" className="block hover:text-hotel-primary">+880 1717-425702</a>
                 <p className="normal-case">hotelshotabdiabashik@gmail.com</p>
               </address>
               <nav className="space-y-4">
                 <p className="text-gray-900 font-black">Legal</p>
                 <Link to="/privacypolicy" className="block hover:text-hotel-primary">Privacy Policy</Link>
                 <Link to="/termsofservice" className="block hover:text-hotel-primary">Terms of Service</Link>
               </nav>
            </div>
          </div>
        </footer>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        {/* Correct Conditional Profile Onboarding */}
        {user && profile && !profile.isComplete && !isManageAccountOpen && (
          <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />
        )}

        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />}
        
        {selectedRoomToBook && profile && (
          <BookingModal 
            room={selectedRoomToBook} 
            profile={profile} 
            activeDiscount={activeDiscount} 
            onClose={() => setSelectedRoomToBook(null)} 
            onImageUpload={(f) => uploadToR2(f, 'nid')} 
          />
        )}
        
        <MobileBottomNav user={user} isAdmin={isAdmin} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

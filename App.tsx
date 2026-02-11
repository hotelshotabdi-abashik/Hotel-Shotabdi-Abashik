
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import HelpDesk from './components/HelpDex';
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
import { LogIn, Loader2, Bell, Edit3, Globe, Save, Megaphone, Camera, RefreshCw, X, Calendar, MessageSquare, Shield, CheckCheck, Trash2, LogOut, User as UserIcon, AlertTriangle, Phone, PhoneCall } from 'lucide-react';
import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL } from './constants';

const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

const RouteMetadata = ({ siteConfig }: { siteConfig: SiteConfig }) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    let title = 'Hotel Shotabdi Abashik | Best Luxury Stay in Sylhet';
    let desc = 'Book your stay at Hotel Shotabdi Abashik, the premier luxury residential hotel in Sylhet.';
    
    const metaConfig: Record<string, { title: string; desc: string }> = {
      '/': { title: 'Hotel Shotabdi Abashik | Premium Residential Stay', desc: 'Experience Elite hospitality at Hotel Shotabdi Abashik.' },
      '/offers': { title: 'Exclusive Deals | Shotabdi Abashik Luxury Offers', desc: 'Discover seasonal 25% discounts.' },
      '/rooms': { title: 'Luxury Rooms & Suites | Hotel Shotabdi Abashik', desc: 'Explore AC rooms and Suites.' },
      '/restaurants': { title: 'Dining Near Hotel Shotabdi Abashik', desc: 'Find the best restaurants near Hotel Shotabdi.' },
      '/guide': { title: 'Sylhet Tourist Guide | Hotel Shotabdi', desc: 'Explore Sylhet with Hotel Shotabdi.' },
      '/helpdesk': { title: 'Registry Help Desk | Hotel Shotabdi Abashik', desc: 'Direct resident support.' },
      '/mystays': { title: 'My Stays | Hotel Shotabdi Abashik', desc: 'Access your stay history.' }
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [isLogoUpdating, setIsLogoUpdating] = useState(false);
  const [activeFooterChoice, setActiveFooterChoice] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const configRef = ref(db, 'site-config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) setSiteConfig(prev => !isSaving ? { ...prev, ...snapshot.val() } : prev);
      setIsConfigLoading(false);
    });
    return () => unsubscribe();
  }, [isSaving]);

  const loadProfile = useCallback(async (u: any) => {
    if (!u) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      if (u.email === OWNER_EMAIL || data?.role === 'manager') {
        setIsAdmin(true);
      }
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
      }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (err) { console.error("Logout failed", err); }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await update(ref(db), { 'site-config': { ...siteConfig, lastUpdated: Date.now() } });
      setIsEditMode(false);
      alert("Website Updated Live!");
    } catch (error) { alert("Update Failed."); } finally { setIsSaving(false); }
  };

  if (isConfigLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Shotabdi Hub...</p>
    </div>
  );

  const currentLogo = siteConfig.logoUrl || LOGO_ICON_URL;
  const isProfileIncomplete = user && profile && (!profile.legalName || !profile.nidImageUrl);

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full overflow-x-hidden">
      <RouteMetadata siteConfig={siteConfig} />
      <Sidebar isAdmin={isAdmin} logoUrl={currentLogo} isEditMode={isEditMode} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {isProfileIncomplete && (
          <div className="bg-amber-500 text-white py-3 px-6 text-center z-[70] relative flex items-center justify-center gap-3 shadow-lg">
             <AlertTriangle size={16} className="shrink-0 animate-bounce" />
             <p className="font-black text-[10px] md:text-[11px] uppercase tracking-widest">
               Identity registry is incomplete. <button onClick={() => setIsManageAccountOpen(true)} className="underline ml-1">Finish Onboarding</button> to unlock stays.
             </p>
          </div>
        )}

        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center gap-4">
            <h2 className="hidden lg:block text-xs font-black uppercase tracking-[0.5em] text-gray-400">Hotel Shotabdi Abashik Registry</h2>
          </div>

          <div className="flex items-center gap-3">
            {(user?.email === OWNER_EMAIL) && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Edit3 size={16} /> {isEditMode ? 'Editing Live' : 'Edit Web'}
              </button>
            )}
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                  className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100"
                >
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full object-cover" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-fade-in origin-top-right">
                     <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-[11px] font-black text-gray-900 truncate uppercase">{profile?.legalName || user.displayName || 'Guest'}</p>
                        <p className="text-[9px] text-gray-400 truncate uppercase font-bold mt-0.5">{profile?.role || 'Guest'}</p>
                     </div>
                     <div className="p-2 space-y-1">
                        <button onClick={() => { setIsManageAccountOpen(true); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black text-gray-600 hover:bg-hotel-primary/5 hover:text-hotel-primary transition-all uppercase">
                          <UserIcon size={18} /> Manage Account
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase">
                          <LogOut size={18} /> Log Out
                        </button>
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-xl">
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<><Hero config={siteConfig.hero} isEditMode={isEditMode} onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}}))} /><ExclusiveOffers offers={siteConfig.offers} /><RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} /><NearbyRestaurants restaurants={siteConfig.restaurants} /><TouristGuide touristGuides={siteConfig.touristGuides} /></>} />
            <Route path="/offers" element={<ExclusiveOffers offers={siteConfig.offers} />} />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} />} />
            <Route path="/helpdesk" element={<HelpDesk profile={profile} />} />
            <Route path="/mystays" element={<MyStays profile={profile} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">Unauthorized</div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
          </Routes>
        </div>

        {isEditMode && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-2xl px-10 py-6 rounded-[2.5rem] flex items-center gap-10 shadow-2xl">
             <button onClick={saveConfig} className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl">
               <Save size={16} /> Publish Site
             </button>
          </div>
        )}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        {user && profile && !profile.isComplete && !isManageAccountOpen && <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />}
        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />}
        {selectedRoomToBook && profile && <BookingModal room={selectedRoomToBook} profile={profile} activeDiscount={activeDiscount} onClose={() => setSelectedRoomToBook(null)} onImageUpload={async(f)=>""} />}
        <MobileBottomNav user={user} isAdmin={isAdmin} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;

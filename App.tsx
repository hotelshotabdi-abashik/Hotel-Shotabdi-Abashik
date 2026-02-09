import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
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
import NotificationPrompt from './components/NotificationPrompt';
import HelpDex from './components/HelpDex';
import { 
  auth, 
  onAuthStateChanged, 
  syncUserProfile,
  OWNER_EMAIL,
  db,
  ref,
  onValue,
  update,
  get,
  set,
  requestNotificationToken
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Restaurant, Attraction, Offer, Booking, Room } from './types';
import { LogIn, Loader2, Bell, Edit3, Eye, Globe, RefreshCw, X, Info, MapPin, Phone, Mail, Tag, ShieldAlert, Languages, Megaphone, ShieldCheck, Gavel, Save, LayoutGrid } from 'lucide-react';
import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL } from './constants';

const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

// --- Language Context for Persistence ---
type Language = 'en' | 'bn';
const LanguageContext = createContext<{ lang: Language; setLang: (l: Language) => void }>({ lang: 'en', setLang: () => {} });

const RouteMetadata = ({ siteConfig }: { siteConfig: SiteConfig }) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Default SEO Base
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
        title: 'Sylhet Tourist Guide | Shotabdi Abashik Travel Hub',
        desc: 'Visit Shah Jalal Dargah, Keane Bridge, and Tea Gardens from Hotel Shotabdi Abashik.'
      },
      '/helpdex': { 
        title: 'Help Dex Support | Hotel Shotabdi Abashik Live Help',
        desc: 'Connect with Hotel Shotabdi Abashik 24/7 registry support for residents.'
      }
    };

    if (pathname.startsWith('/offers/')) {
      const offerId = pathname.split('/').pop();
      const offer = siteConfig.offers?.find(o => o.id === offerId);
      if (offer) {
        title = `${offer.title} | Hotel Shotabdi Abashik`;
        desc = offer.description.substring(0, 160);
      }
    } else {
      const current = metaConfig[pathname] || metaConfig['/'];
      title = current.title;
      desc = current.desc;
    }

    document.title = title;
    
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        if (name.includes('og:')) meta.setAttribute('property', name);
        else meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateMeta('description', desc);
    updateMeta('og:title', title);
    updateMeta('og:description', desc);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `https://hotelshotabdiabashik.com${pathname}`);

  }, [pathname, siteConfig]);
  
  return null;
};

const AppContent = () => {
  const { lang, setLang } = useContext(LanguageContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [claimedOfferId, setClaimedOfferId] = useState<string | null>(null);

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
    lastUpdated: 0
  });

  // Google Translate Helper
  const triggerGoogleTranslate = useCallback((targetLang: Language) => {
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = targetLang;
      googleCombo.dispatchEvent(new Event('change'));
    }
  }, []);

  useEffect(() => {
    // Apply translation after language state changes
    setTimeout(() => triggerGoogleTranslate(lang), 1000);
  }, [lang, triggerGoogleTranslate]);

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
      setHasPendingBooking(false);
      return;
    }
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    onValue(notificationsRef, (snap) => {
      if (snap.exists()) setNotifications((Object.values(snap.val() as any) as AppNotification[]).sort((a: any, b: any) => b.createdAt - a.createdAt));
    });
    const bookingsRef = ref(db, `bookings`);
    onValue(bookingsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()) as Booking[];
        setHasPendingBooking(list.some(b => b.userId === user.uid && b.status === 'pending'));
      }
    });
  }, [user]);

  const loadProfile = useCallback(async (u: any) => {
    if (!u) return;
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
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

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

  const uploadToR2 = async (file: File, folder: string): Promise<string> => {
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const url = `${CMS_WORKER_URL}/${filename}`;
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type, 'Authorization': ADMIN_SECRET }, body: file });
    return url;
  };

  if (isConfigLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Restoring Shotabdi Hub...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      <RouteMetadata siteConfig={siteConfig} />
      <Sidebar isAdmin={isAdmin || isOwner} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {(siteConfig.announcement || isEditMode) && (
          <div className="bg-hotel-primary text-white py-2.5 px-6 text-center z-[65] relative flex items-center justify-center gap-3 overflow-hidden">
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
            <p className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] truncate">{siteConfig.announcement}</p>
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
          </div>
        )}

        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 md:py-4 flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center gap-4">
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => { setIsLogoSpinning(true); setTimeout(() => setIsLogoSpinning(false), 2000); }}>
              <img src={LOGO_ICON_URL} className={`w-12 h-12 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-110 ${isLogoSpinning ? 'animate-spin-once' : ''}`} alt="Hotel Shotabdi Abashik" />
              <div className="flex flex-col select-none leading-none -space-y-1">
                <h1 className="text-lg md:text-xl font-serif font-black text-gray-900 tracking-tight">Hotel Shotabdi</h1>
                <p className="text-[8px] md:text-[9px] text-hotel-primary font-black uppercase tracking-[0.3em]">Abashik</p>
              </div>
            </div>
            {/* Desktop Header Title */}
            <div className="hidden lg:block">
               <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-400">Hotel Shotabdi Abashik</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Edit Web Toggle */}
            {(isAdmin || isOwner) && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-100 text-amber-600 animate-pulse shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Edit3 size={16} /> {isEditMode ? 'Editing Live' : 'Edit Web'}
              </button>
            )}

            <button 
              onClick={toggleLang}
              className="p-2.5 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-hotel-primary transition-all flex items-center gap-2 group"
            >
              <Languages size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4 relative">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary'}`}>
                  <Bell size={24} />
                  {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">!</span>}
                </button>
                <button onClick={() => setIsManageAccountOpen(true)} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full object-cover" alt="User" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-3 bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all">
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </header>

        {/* Floating Save Changes Bar */}
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
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center">Unauthorized</div>} />
          </Routes>
        </div>

        <footer className="bg-white border-t border-gray-100 py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <img src={LOGO_ICON_URL} className="w-14 h-14 object-contain transition-transform group-hover:scale-110" alt="Hotel Shotabdi Abashik Logo" />
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
        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />}
        {selectedRoomToBook && profile && <BookingModal room={selectedRoomToBook} profile={profile} activeDiscount={activeDiscount} onClose={() => setSelectedRoomToBook(null)} onImageUpload={(f) => uploadToR2(f, 'nid')} />}
        <MobileBottomNav user={user} isAdmin={isAdmin} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('shotabdi_lang') as Language) || 'en');
  useEffect(() => { localStorage.setItem('shotabdi_lang', lang); }, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageContext.Provider>
  );
};

export default App;

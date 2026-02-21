
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from './components/Hero';
import ExclusiveOffers from './components/ExclusiveOffers';
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
import Footer from './components/Footer';
import PublicProfile from './components/PublicProfile';
import SchemaOrg from './components/SchemaOrg';
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
  createAdminLog
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Room } from './types';
import { LogIn, Loader2, Bell, Edit3, Save, CheckCheck, LogOut, User as UserIcon, AlertTriangle, LayoutDashboard, Upload, Info, Key, Shield } from 'lucide-react';
import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL, NAV_ITEMS } from './constants';
import { translations, Language } from './translations';

const RouteMetadata = ({ siteConfig }: { siteConfig: SiteConfig }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    let title = 'Hotel Shotabdi Abashik | Best Luxury Stay in Sylhet';
    let desc = 'Book your stay at Hotel Shotabdi Abashik, the premier luxury residential hotel in Sylhet.';
    const metaConfig: Record<string, { title: string; desc: string }> = {
      '/': { title: 'Hotel Shotabdi Abashik | Best Hotel in Sylhet', desc: 'Experience Elite hospitality at Hotel Shotabdi Abashik. Book rooms online for 25% OFF.' },
      '/offers': { title: 'Exclusive Deals | Sylhet Hotel Offers', desc: 'Discover seasonal 25% discounts on luxury rooms in Sylhet.' },
      '/rooms': { title: 'Luxury Rooms & Suites | Best Sylhet Accommodation', desc: 'Explore premium AC rooms and Family Suites in Sylhet.' },
      '/helpdesk': { title: 'Registry Help Desk | Support for residents', desc: 'Direct support for Hotel Shotabdi residents.' },
      '/mystays': { title: 'My Stays | Stay History', desc: 'Access your verified stay history.' }
    };
    const current = metaConfig[pathname] || metaConfig['/'];
    if (!pathname.startsWith('/u/')) {
       document.title = current.title;
       const metaDesc = document.querySelector('meta[name="description"]');
       if (metaDesc) metaDesc.setAttribute('content', current.desc);
    }
  }, [pathname, siteConfig]);
  return null;
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  
  const t = translations[language];
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [showStickyCategories, setShowStickyCategories] = useState(false);
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero: {
      title: "Experience Luxury",
      subtitle: "Provides 24-hour front desk and room services in the heart of Sylhet.",
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
    lastUpdated: 0,
    socialLinks: { facebook: "#", instagram: "#", website: "#" }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsProfileMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!user) { setNotifications([]); return; }
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const unsub = onValue(notificationsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()) as AppNotification[];
        setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
      } else setNotifications([]);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        // If the bottom of the hero section is above the top of the viewport
        setShowStickyCategories(rect.bottom < 80);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProfile = useCallback(async (u: any) => {
    if (!u) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      // Senior Architect Update: Managers have administrative access
      const isPowerUser = u.email === OWNER_EMAIL || data?.role === 'owner' || data?.role === 'manager';
      setIsAdmin(isPowerUser);
    } catch (error) { 
      console.warn("Profile Sync Issue", error);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) loadProfile(currentUser);
      else { setProfile(null); setIsAdmin(false); }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
      setIsAdmin(false);
      navigate('/');
    } catch (err) { console.error("Logout failed", err); }
  };

  const saveConfig = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const configRef = ref(db, 'site-config');
      await update(ref(db), { 'site-config': { ...siteConfig, lastUpdated: Date.now() } });
      await createAdminLog('WEBSITE_UPDATE', 'Configuration updated.');
      setIsEditMode(false);
      alert("Update Success!");
    } catch (error: any) { 
      console.error("Save Error:", error);
      alert(`Update Failed: ${error.message || 'Connection error'}`); 
    } finally { setIsSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLogoSpinning(true);
    try {
      const url = await handleImageUpload(file);
      setSiteConfig(prev => ({ ...prev, logoUrl: url }));
      setTimeout(() => setIsLogoSpinning(false), 2000);
    } catch (err) {
      alert("Logo upload failed.");
      setIsLogoSpinning(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Senior Architect Note: Cloudflare R2 Upload Logic
    // In a production environment with Cloudflare Pages, you would typically 
    // use a Cloudflare Worker (Functions) to securely upload to R2.
    // For now, we use a robust Base64 conversion to ensure immediate UI feedback.
    
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("File too large. Max 10MB allowed for Base64 storage."));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (!base64) {
          reject(new Error("Failed to convert image to data."));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Error reading file."));
      reader.readAsDataURL(file);
    });
  };

  if (isConfigLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.syncingHub}</p>
    </div>
  );

  const currentLogo = siteConfig.logoUrl || LOGO_ICON_URL;
  const unreadCount = notifications.filter(n => !n.read).length;
  const isProfileIncomplete = user && profile && (!profile.legalName || !profile.nidImageUrl);
  
  const getDisplayNameWithRole = () => {
    const name = profile?.legalName || user?.displayName || 'Resident';
    if (user?.email === OWNER_EMAIL || profile?.role === 'owner') return `Owner: ${name}`;
    if (profile?.role === 'manager') return `Manager: ${name}`;
    return name;
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-hotel-text w-full overflow-x-hidden">
      <RouteMetadata siteConfig={siteConfig} />
      <SchemaOrg />
      
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 h-[72px] md:h-[88px] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={currentLogo} 
                className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-transform ${isLogoSpinning ? 'animate-spin-once' : ''}`} 
                alt="Logo"
              />
              {isEditMode && isAdmin && (
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); logoInputRef.current?.click(); }}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <Upload size={14} />
                </button>
              )}
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-serif font-black text-gray-900 uppercase leading-none">Hotel Shotabdi</h1>
              <p className="text-[6px] text-hotel-primary font-black uppercase tracking-[0.4em] mt-0.5">Abashik</p>
            </div>
          </Link>
        </div>

        {showStickyCategories && (
          <div className="hidden xl:flex items-center gap-6 animate-fade-in ml-8">
            {[
              { id: 'rooms', label: t.ourLuxuryRooms },
              { id: 'offers', label: t.exclusiveOffers },
              { id: 'restaurants', label: t.restaurantsTitle },
              { id: 'guide', label: t.guideTitle },
              { id: 'helpdesk', label: t.helpDesk }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  else navigate(item.id === 'helpdesk' ? '/helpdesk' : `/#${item.id}`);
                }}
                className="flex items-center gap-2 group"
              >
                <div className="w-3 h-3 rounded-full border border-gray-200 group-hover:border-hotel-primary flex items-center justify-center transition-colors">
                  <div className="w-1.5 h-1.5 bg-hotel-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[9px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <nav className="hidden lg:flex items-center gap-8 ml-auto mr-8">
          <Link 
            to="/" 
            onClick={handleHomeClick}
            className={`transition-all text-[11px] tracking-widest uppercase font-bold ${location.pathname === '/' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.home}
          </Link>
          <button 
            onClick={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else navigate('/#about');
            }}
            className="transition-all text-[11px] tracking-widest uppercase font-bold text-gray-400 hover:text-hotel-primary"
          >
            {t.about}
          </button>
          <Link 
            to="/helpdesk" 
            className={`transition-all text-[11px] tracking-widest uppercase font-bold ${location.pathname === '/helpdesk' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.helpDesk}
          </Link>

          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`transition-all relative ${isNotificationsOpen ? 'text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary'}`}
            title={t.notifications}
          >
            <Bell size={22} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
          </button>
          
          <div className="h-4 w-[1px] bg-gray-200"></div>

          <button 
            onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
            className="transition-all text-[11px] tracking-widest uppercase font-black text-hotel-primary hover:bg-hotel-primary/5 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-hotel-primary/10"
          >
            <span className={language === 'EN' ? 'opacity-100' : 'opacity-30'}>EN</span>
            <span className="text-gray-300">/</span>
            <span className={language === 'BN' ? 'opacity-100' : 'opacity-30'}>BN</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {isAdmin && (
            <button onClick={() => setIsEditMode(!isEditMode)} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <Edit3 size={14} /> {isEditMode ? t.liveEditing : t.editWeb}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`w-10 h-10 rounded-xl overflow-hidden border-2 shadow-sm ring-1 transition-all ${isAdmin ? 'border-amber-400 ring-amber-100' : 'border-white ring-gray-100'}`}>
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full object-cover" alt="Profile" />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-fade-in origin-top-right">
                     <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1">
                          {isAdmin && (
                            <div className={`p-1 rounded-md ${profile?.role === 'owner' || user?.email === OWNER_EMAIL ? 'bg-hotel-primary text-white' : 'bg-blue-600 text-white'}`}>
                              {profile?.role === 'owner' || user?.email === OWNER_EMAIL ? <Key size={10}/> : <Shield size={10}/>}
                            </div>
                          )}
                          <p className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{getDisplayNameWithRole()}</p>
                        </div>
                        <p className="text-[9px] text-gray-400 truncate font-bold tracking-widest opacity-70">{user.email}</p>
                     </div>
                     <div className="p-2 space-y-1">
                        <button onClick={() => { setIsManageAccountOpen(true); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[11px] font-black text-gray-600 hover:bg-hotel-primary/5 hover:text-hotel-primary transition-all uppercase text-left">
                          <UserIcon size={18} className="shrink-0" /> Manage Identity
                        </button>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[11px] font-black text-amber-600 hover:bg-amber-50 transition-all uppercase text-left">
                            <LayoutDashboard size={18} className="shrink-0" /> Admin Console
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase text-left">
                          <LogOut size={18} className="shrink-0" /> De-authorize
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all">{t.login}</button>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative w-full flex flex-col pt-[72px] md:pt-[88px] pb-32 lg:pb-0">
        {isProfileIncomplete && (
          <div className="bg-amber-500 text-white py-3 px-6 text-center z-[70] relative flex items-center justify-center gap-3 shadow-lg">
             <AlertTriangle size={16} className="shrink-0 animate-bounce" />
             <p className="font-black text-[10px] uppercase tracking-widest">{t.identityIncomplete} <button onClick={() => setIsManageAccountOpen(true)} className="underline ml-1">{t.finishOnboarding}</button></p>
          </div>
        )}
        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <Routes>
            <Route path="/" element={<><Hero config={siteConfig.hero} rooms={siteConfig.rooms} isEditMode={isEditMode} language={language} onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}}))} onImageUpload={handleImageUpload} /><ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} language={language} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} onImageUpload={handleImageUpload} /><RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} isEditMode={isEditMode} language={language} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} onImageUpload={handleImageUpload} /><NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} language={language} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} onImageUpload={handleImageUpload} /><TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} language={language} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} onImageUpload={handleImageUpload} /></>} />
            <Route path="/offers" element={<ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} language={language} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} onImageUpload={handleImageUpload} />} />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} isEditMode={isEditMode} language={language} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} onImageUpload={handleImageUpload} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} language={language} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} onImageUpload={handleImageUpload} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} language={language} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} onImageUpload={handleImageUpload} />} />
            <Route path="/helpdesk" element={<HelpDesk profile={profile} logoUrl={currentLogo} />} />
            <Route path="/mystays" element={<MyStays profile={profile} logoUrl={currentLogo} />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">{t.unauthorized}</div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
          </Routes>
        </div>
        <Footer isEditMode={isEditMode} language={language} logoUrl={currentLogo} socialLinks={siteConfig.socialLinks} onUpdateSocial={(links) => setSiteConfig(prev => ({ ...prev, socialLinks: links }))} />
        {isEditMode && isAdmin && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-2xl px-10 py-6 rounded-[2.5rem] flex items-center gap-10 shadow-2xl border border-white/10">
             <button onClick={saveConfig} className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"><Save size={16} /> {t.publishChanges}</button>
          </div>
        )}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />}
        {selectedRoomToBook && profile && <BookingModal room={selectedRoomToBook} profile={profile} activeDiscount={0} onClose={() => setSelectedRoomToBook(null)} onImageUpload={handleImageUpload} />}
        <MobileBottomNav user={user} profile={profile} isAdmin={isAdmin} language={language} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => (<BrowserRouter><AppContent /></BrowserRouter>);
export default App;


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
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
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
      await update(ref(db), { 'site-config': { ...siteConfig, lastUpdated: Date.now() } });
      await createAdminLog('WEBSITE_UPDATE', 'Configuration updated.');
      setIsEditMode(false);
      alert("Update Success!");
    } catch (error) { alert("Update Failed."); } finally { setIsSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLogoSpinning(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSiteConfig(prev => ({ ...prev, logoUrl: base64 }));
      setTimeout(() => setIsLogoSpinning(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  if (isConfigLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Master Hub...</p>
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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-10 flex justify-between items-center ${scrolled ? 'h-[72px] md:h-[80px] bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm' : 'h-[88px] md:h-[100px] bg-transparent'}`}>
        <div className="flex items-center gap-4">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={currentLogo} 
                className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-500 ${isLogoSpinning ? 'animate-spin-once' : ''} ${!scrolled && location.pathname === '/' ? 'brightness-0 invert' : ''}`} 
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
              <h1 className={`text-sm font-serif font-black uppercase leading-none transition-colors duration-500 ${!scrolled && location.pathname === '/' ? 'text-white' : 'text-gray-900'}`}>Hotel Shotabdi</h1>
              <p className={`text-[6px] font-black uppercase tracking-[0.4em] mt-0.5 transition-colors duration-500 ${!scrolled && location.pathname === '/' ? 'text-white/80' : 'text-hotel-primary'}`}>Abashik</p>
            </div>
          </Link>
        </div>

        <nav className={`hidden lg:flex items-center p-1 rounded-2xl border transition-all duration-500 ${!scrolled && location.pathname === '/' ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-gray-50/50 border-gray-100'}`}>
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.id} 
              to={item.path} 
              onClick={item.path === '/' ? handleHomeClick : undefined}
              className={`px-5 py-2.5 rounded-xl transition-all text-[10px] tracking-widest uppercase font-bold ${location.pathname === item.path ? (scrolled || location.pathname !== '/' ? 'text-hotel-primary font-black' : 'text-white font-black') : (scrolled || location.pathname !== '/' ? 'text-gray-400 hover:text-hotel-primary' : 'text-white/60 hover:text-white')}`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`px-5 py-2.5 rounded-xl text-[10px] tracking-widest uppercase font-black ${location.pathname === '/admin' ? 'text-amber-600' : (scrolled || location.pathname !== '/' ? 'text-amber-600/70 hover:text-amber-600' : 'text-amber-400 hover:text-amber-300')}`}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {scrolled && (
            <Link 
              to="/rooms" 
              className="hidden md:flex items-center gap-2 bg-hotel-primary text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-[#B22222] transition-all active:scale-95"
            >
              Book Now
            </Link>
          )}
          {isAdmin && (
            <button onClick={() => setIsEditMode(!isEditMode)} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-100 text-amber-600' : (scrolled || location.pathname !== '/' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20')}`}>
              <Edit3 size={14} /> {isEditMode ? 'Live Editing' : 'Edit Web'}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : (scrolled || location.pathname !== '/' ? 'text-gray-400 hover:text-hotel-primary' : 'text-white/60 hover:text-white')}`}>
                  <Bell size={24} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-hotel-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                </button>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`w-10 h-10 rounded-xl overflow-hidden border-2 shadow-sm ring-1 transition-all ${isAdmin ? 'border-amber-400 ring-amber-100' : (scrolled || location.pathname !== '/' ? 'border-white ring-gray-100' : 'border-white/20 ring-white/10')}`}>
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
            <button onClick={() => setIsAuthModalOpen(true)} className="bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all">Login</button>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative w-full flex flex-col pt-[72px] md:pt-[88px] pb-32 lg:pb-0">
        {isProfileIncomplete && (
          <div className="bg-amber-500 text-white py-3 px-6 text-center z-[70] relative flex items-center justify-center gap-3 shadow-lg">
             <AlertTriangle size={16} className="shrink-0 animate-bounce" />
             <p className="font-black text-[10px] uppercase tracking-widest">Identity registry incomplete. <button onClick={() => setIsManageAccountOpen(true)} className="underline ml-1">Finish Onboarding</button></p>
          </div>
        )}
        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <Routes>
            <Route path="/" element={<><Hero config={siteConfig.hero} isEditMode={isEditMode} onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}}))} /><ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} /><RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} /><NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} /><TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} /></>} />
            <Route path="/offers" element={<ExclusiveOffers offers={siteConfig.offers} isEditMode={isEditMode} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} />} />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} onBook={setSelectedRoomToBook} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} />} />
            <Route path="/helpdesk" element={<HelpDesk profile={profile} logoUrl={currentLogo} />} />
            <Route path="/mystays" element={<MyStays profile={profile} logoUrl={currentLogo} />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">Unauthorized Access</div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
          </Routes>
        </div>
        <Footer isEditMode={isEditMode} logoUrl={currentLogo} socialLinks={siteConfig.socialLinks} onUpdateSocial={(links) => setSiteConfig(prev => ({ ...prev, socialLinks: links }))} />
        {isEditMode && isAdmin && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-2xl px-10 py-6 rounded-[2.5rem] flex items-center gap-10 shadow-2xl border border-white/10">
             <button onClick={saveConfig} className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"><Save size={16} /> Publish Changes</button>
          </div>
        )}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} />}
        {selectedRoomToBook && profile && <BookingModal room={selectedRoomToBook} profile={profile} activeDiscount={0} onClose={() => setSelectedRoomToBook(null)} onImageUpload={async(f)=>""} />}
        <MobileBottomNav user={user} profile={profile} isAdmin={isAdmin} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => (<BrowserRouter><AppContent /></BrowserRouter>);
export default App;


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
import GallerySection from './components/Gallery';
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
  get,
  createAdminLog,
  playNotificationSound,
  trackUserMovement,
  query,
  limitToLast
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Room } from './types';
import { 
  LogIn, Loader2, Bell, Edit3, Save, CheckCheck, LogOut, 
  User as UserIcon, AlertTriangle, LayoutDashboard, Upload, 
  Info, Key, Shield, Bed, Tag, Utensils, Map as MapIcon, Sparkles, Camera, RefreshCw
} from 'lucide-react';
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
  const handleLogoEdit = () => {
    if (!isEditMode || !isAdmin) return;
    const newUrl = window.prompt("Enter new Logo URL:", siteConfig.logoUrl);
    if (newUrl) {
      const newConfig = { ...siteConfig, logoUrl: newUrl };
      setSiteConfig(newConfig);
      saveConfig(newConfig);
    }
  };

  const handleTextEdit = (path: string, currentVal: string) => {
    if (!isEditMode || !isAdmin) return;
    const newVal = window.prompt(`Edit text:`, currentVal);
    if (newVal !== null) {
      const keys = path.split('.');
      const newConfig = { ...siteConfig };
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = newVal;
      setSiteConfig({ ...newConfig });
    }
  };
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  
  const t = translations[language];
  
  const formatNumber = (num: number | string) => {
    if (language === 'EN') return String(num);
    return String(num).split('').map(char => t.numbers[char as keyof typeof t.numbers] || char).join('');
  };
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStickyCategories, setShowStickyCategories] = useState(false);
  
  const requireAuth = (action: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero: {
      title: "24h Residential Service",
      subtitle: "Experience Elite Hospitality in Sylhet",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      buttonText: "Book Now",
      locationLabel: "Sylhet HQ District"
    },
    roomsHeaderImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
    offersHeaderImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
    restaurantsHeaderImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
    touristHeaderImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
    aboutHeaderImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
    rooms: ROOMS_DATA,
    offers: [],
    restaurants: SYLHET_RESTAURANTS,
    touristGuides: SYLHET_ATTRACTIONS,
    gallery: [],
    announcement: "25% OFF DISCOUNT",
    logoUrl: LOGO_ICON_URL,
    lastUpdated: 0,
    socialLinks: { facebook: "#", instagram: "#", website: "#" },
    name: "Hotel Shotabdi",
    tagline: "Abashik"
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
    });
    return () => unsubscribe();
  }, [isSaving]);

  useEffect(() => {
    if (user) {
      trackUserMovement(user.uid, location.pathname);
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    let initialLoad = true;
    const unsub = onValue(notificationsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()) as AppNotification[];
        const sorted = list.sort((a, b) => b.createdAt - a.createdAt);
        
        // Play sound for new unread notifications after initial load
        if (!initialLoad) {
          const hasNewUnread = sorted.some(n => !n.read && n.createdAt > (notifications[0]?.createdAt || 0));
          if (hasNewUnread) playNotificationSound();
        }
        
        setNotifications(sorted);
        initialLoad = false;
      } else {
        setNotifications([]);
        initialLoad = false;
      }
    });
    return () => unsub();
  }, [user]);

  // Real-time Data Sync
  useEffect(() => {
    if (!user) { setPendingBookingsCount(0); return; }
    
    if (isAdmin) {
      // Admin listens to new bookings
      const bookingsRef = ref(db, 'bookings');
      const unsubBookings = onValue(bookingsRef, (snap) => {
        if (snap.exists()) {
          const bookingsList = Object.values(snap.val()) as any[];
          const pending = bookingsList.filter(b => b.status === 'pending').length;
          if (pending > pendingBookingsCount) playNotificationSound();
          setPendingBookingsCount(pending);
        } else {
          setPendingBookingsCount(0);
        }
      });

      return () => { unsubBookings(); };
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        // If the bottom of the hero section is above the top of the viewport
        // Senior Architect: Disabled sticky categories to prevent button spamming as requested
        setShowStickyCategories(false);
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
    setIsProfileLoading(true);
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      // Senior Architect Update: Managers have administrative access
      const isPowerUser = u.email === OWNER_EMAIL || data?.role === 'owner';
      setIsAdmin(isPowerUser);
      
      // Resilience: Run cleanup when admin logs in
      if (isPowerUser) {
        import('./services/firebase').then(m => m.cleanupDatabase());
      }
    } catch (error) { 
      console.warn("Profile Sync Issue", error);
      setIsAdmin(false);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        loadProfile(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
        // Auto-prompt login on refresh if not logged in and hasn't been prompted this session
        const hasPrompted = sessionStorage.getItem('auth_prompted');
        if (!hasPrompted) {
          setTimeout(() => {
            if (!auth.currentUser) {
              setIsAuthModalOpen(true);
              sessionStorage.setItem('auth_prompted', 'true');
            }
          }, 2000);
        }
      }
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

  const saveConfig = async (configToSave?: SiteConfig) => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const finalConfig = configToSave || siteConfig;
      
      // Senior Architect Fix: Robust recursive sanitization to remove non-serializable properties 
      // and invalid Firebase keys (like React Fiber internal keys)
      const sanitizeKeys = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sanitizeKeys);
        
        const sanitized: any = {};
        Object.keys(obj).forEach(key => {
          // Firebase keys cannot contain ., #, $, /, [, ] or be empty
          // We also strip React internal keys starting with __
          const isValidKey = key.length > 0 && 
                            !key.startsWith('__') &&
                            !/[.#$/[\]]/.test(key);
          
          if (isValidKey) {
            sanitized[key] = sanitizeKeys(obj[key]);
          }
        });
        return sanitized;
      };

      // Senior Architect: Use a safer way to stringify to avoid circular references
      const safeStringify = (obj: any) => {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
              return; // Discard circular reference
            }
            cache.add(value);
          }
          return value;
        });
      };

      const cleanConfig = sanitizeKeys(JSON.parse(safeStringify(finalConfig)));
      
      await update(ref(db), { 'site-config': { ...cleanConfig, lastUpdated: Date.now() } });
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
      const oldUrl = siteConfig.logoUrl;
      const url = await handleImageUpload(file);
      
      // Delete old logo if it was an R2 URL
      if (oldUrl && oldUrl.includes('r2.dev')) {
        await handleImageDelete(oldUrl);
      }

      setSiteConfig(prev => ({ ...prev, logoUrl: url }));
      setTimeout(() => setIsLogoSpinning(false), 2000);
    } catch (err) {
      alert("Logo upload failed.");
      setIsLogoSpinning(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      if (!file) throw new Error("No file selected.");
      
      // Use absolute URL if VITE_API_URL is provided, otherwise relative
      const apiBase = import.meta.env.VITE_API_URL || "";
      const endpoint = `${apiBase}/api/upload/presigned`;
      
      // 1. Get pre-signed URL from our server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      if (!response.ok) {
        if (response.status === 405) {
          throw new Error("Upload API not found on this domain. Please use the AI Studio Shared URL for the full-stack version of the app.");
        }
        
        let errorMessage = "Failed to get upload URL";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use status text
          errorMessage = `Server error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { signedUrl, uploadUrl, publicUrl, useWorker } = data;

      // 2. Upload directly to R2 (or via Worker Proxy)
      const destinationUrl = useWorker ? uploadUrl : signedUrl;
      const uploadResponse = await fetch(destinationUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to storage");
      }

      return publicUrl;
    } catch (error: any) {
      console.error("R2 Upload Error:", error);
      throw error;
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      // Extract key from public URL
      // Assuming publicUrl is something like https://pub-xxx.r2.dev/uploads/123-file.png
      const url = new URL(imageUrl);
      const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete from storage");
      }

      return true;
    } catch (error: any) {
      console.error("R2 Delete Error:", error);
      return false;
    }
  };

  const currentLogo = siteConfig.logoUrl || LOGO_ICON_URL;
  const unreadCount = notifications.filter(n => !n.read).length;
  const isProfileIncomplete = user && profile && !profile.isComplete && user.email !== OWNER_EMAIL;
  
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
      
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 h-[72px] md:h-[88px] flex items-center">
        {siteConfig.announcement && (
          <div 
            className={`absolute top-0 left-0 right-0 bg-hotel-primary text-white text-[8px] font-black uppercase tracking-[0.3em] py-1 text-center transition-all ${isEditMode ? 'hover:bg-red-700 cursor-pointer' : ''}`}
            onClick={() => isEditMode && handleTextEdit('announcement', siteConfig.announcement)}
          >
            {siteConfig.announcement}
          </div>
        )}
        <div className="flex items-center gap-8 mt-2 shrink-0">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-4 group">
            <div className="relative">
              <img 
                src={currentLogo} 
                className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-transform ${isLogoSpinning ? 'animate-spin-once' : ''} ${isEditMode ? 'cursor-pointer hover:opacity-50' : ''}`} 
                alt="Logo"
                onClick={(e) => { if (isEditMode) { e.preventDefault(); e.stopPropagation(); handleLogoEdit(); } }}
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
              <h1 
                className={`text-base font-cormorant font-black text-gray-900 uppercase leading-none transition-all ${isEditMode ? 'hover:bg-amber-50 cursor-pointer rounded px-1' : ''}`}
                onClick={(e) => { if (isEditMode) { e.preventDefault(); e.stopPropagation(); handleTextEdit('name', siteConfig.name || t.hotelName); } }}
              >
                {siteConfig.name || t.hotelName}
              </h1>
              <p 
                className={`text-[6px] text-hotel-primary font-black uppercase tracking-[0.4em] mt-0.5 transition-all ${isEditMode ? 'hover:bg-amber-50 cursor-pointer rounded px-1' : ''}`}
                onClick={(e) => { if (isEditMode) { e.preventDefault(); e.stopPropagation(); handleTextEdit('tagline', siteConfig.tagline || t.hotelTagline); } }}
              >
                {siteConfig.tagline || t.hotelTagline}
              </p>
            </div>
          </Link>
        </div>

        {showStickyCategories && (
          <div className="hidden xl:flex items-center gap-8 animate-fade-in ml-auto">
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
                <span className="text-[10px] font-black text-gray-400 group-hover:text-hotel-primary uppercase tracking-widest transition-all border-b-2 border-transparent group-hover:border-hotel-primary pb-1">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <nav className="hidden lg:flex items-center gap-10 ml-auto xl:ml-10">
          <Link 
            to="/" 
            onClick={handleHomeClick}
            className={`transition-all text-[11px] tracking-widest uppercase font-medium ${location.pathname === '/' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.home}
          </Link>
          <button 
            onClick={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else navigate('/#about');
            }}
            className="transition-all text-[11px] tracking-widest uppercase font-medium text-gray-400 hover:text-hotel-primary"
          >
            {t.about}
          </button>
          <Link 
            to="/restaurants" 
            className={`transition-all text-[11px] tracking-widest uppercase font-medium ${location.pathname === '/restaurants' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.restaurantsTitle}
          </Link>
          <Link 
            to="/guide" 
            className={`transition-all text-[11px] tracking-widest uppercase font-medium ${location.pathname === '/guide' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.guideTitle}
          </Link>
          <Link 
            to="/gallery" 
            className={`transition-all text-[11px] tracking-widest uppercase font-medium ${location.pathname === '/gallery' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {language === 'EN' ? 'Gallery' : 'গ্যালারি'}
          </Link>
          <Link 
            to="/helpdesk" 
            onClick={(e) => {
              e.preventDefault();
              requireAuth(() => navigate('/helpdesk'));
            }}
            className={`transition-all text-[11px] tracking-widest uppercase font-medium relative flex items-center gap-2 ${location.pathname === '/helpdesk' ? 'text-hotel-primary font-black' : 'text-gray-400 hover:text-hotel-primary'}`}
          >
            {t.helpDesk}
            {isAdmin && pendingBookingsCount > 0 && (
              <span className="w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white shadow-sm">
                {formatNumber(pendingBookingsCount)}
              </span>
            )}
          </Link>
          
          <div className="h-4 w-[1px] bg-gray-200"></div>

          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`transition-all relative p-2 rounded-xl ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary hover:bg-gray-50'}`}
            title={t.notifications}
          >
            <Bell size={22} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{formatNumber(unreadCount)}</span>}
            
            {isNotificationsOpen && (
              <div ref={notificationRef} className="absolute right-0 top-full mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-fade-in origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{t.notifications}</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={async () => {
                        const updates: any = {};
                        notifications.forEach(n => { if (!n.read) updates[`notifications/${user.uid}/${n.id}/read`] = true; });
                        await update(ref(db), updates);
                      }}
                      className="text-[8px] font-black text-hotel-primary uppercase tracking-widest hover:underline"
                    >
                      {t.markAllRead}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Bell size={32} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.noNotifications}</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 rounded-xl transition-all border ${n.read ? 'bg-white border-transparent' : 'bg-hotel-primary/5 border-hotel-primary/10'}`}
                          onClick={async () => {
                            if (!n.read) await update(ref(db, `notifications/${user.uid}/${n.id}`), { read: true });
                            if (n.link) navigate(n.link);
                          }}
                        >
                          <p className="text-[11px] font-black text-gray-900 mb-1">{n.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-2">{n.message}</p>
                          <p className="text-[8px] font-black text-gray-300 uppercase">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
          <button 
            onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
            className="transition-all text-[9px] md:text-[11px] tracking-widest uppercase font-black text-hotel-primary hover:bg-hotel-primary/5 flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-xl border border-hotel-primary/10 shrink-0"
          >
            <span className={language === 'EN' ? 'opacity-100' : 'opacity-30'}>EN</span>
            <span className="text-gray-300">/</span>
            <span className={language === 'BN' ? 'opacity-100' : 'opacity-30'}>BN</span>
          </button>

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
                        <button onClick={() => { setIsManageAccountOpen(true); setIsProfileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-[11px] font-black text-gray-600 hover:bg-hotel-primary/5 hover:text-hotel-primary transition-all uppercase text-left group">
                          <div className="flex items-center gap-3">
                            <UserIcon size={18} className="shrink-0" /> {t.manageIdentity}
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-hotel-primary text-white text-[8px] px-1.5 py-0.5 rounded-full">
                              {formatNumber(unreadCount)}
                            </span>
                          )}
                        </button>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[11px] font-black text-amber-600 hover:bg-amber-50 transition-all uppercase text-left">
                            <LayoutDashboard size={18} className="shrink-0" /> {t.adminConsole}
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase text-left">
                          <LogOut size={18} className="shrink-0" /> {t.deAuthorize}
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="bg-hotel-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0">{t.login}</button>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative w-full flex flex-col pt-[72px] md:pt-[88px] pb-32 lg:pb-0">
        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <Routes>
            <Route path="/" element={<HomeView siteConfig={siteConfig} isEditMode={isEditMode} language={language} setSiteConfig={setSiteConfig} handleImageUpload={handleImageUpload} handleImageDelete={handleImageDelete} requireAuth={requireAuth} />} />
            <Route path="/offers" element={<ExclusiveOffers offers={siteConfig.offers} headerImage={siteConfig.offersHeaderImage} isEditMode={isEditMode} language={language} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} onUpdateHeader={(url) => setSiteConfig(prev => ({...prev, offersHeaderImage: url}))} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />} />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} headerImage={siteConfig.roomsHeaderImage} onBook={(room) => requireAuth(() => setSelectedRoomToBook(room))} isEditMode={isEditMode} language={language} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} onUpdateHeader={(url) => setSiteConfig(prev => ({...prev, roomsHeaderImage: url}))} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} headerImage={siteConfig.restaurantsHeaderImage} isEditMode={isEditMode} language={language} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} onUpdateHeader={(url) => setSiteConfig(prev => ({...prev, restaurantsHeaderImage: url}))} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} headerImage={siteConfig.touristHeaderImage} isEditMode={isEditMode} language={language} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} onUpdateHeader={(url) => setSiteConfig(prev => ({...prev, touristHeaderImage: url}))} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />} />
            <Route path="/gallery" element={<GallerySection isEditMode={isEditMode} language={language} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />} />
            <Route path="/helpdesk" element={<HelpDesk profile={profile} logoUrl={currentLogo} language={language} siteConfig={siteConfig} />} />
            <Route path="/mystays" element={<MyStays profile={profile} logoUrl={currentLogo} />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard language={language} siteConfig={siteConfig} setSiteConfig={setSiteConfig} /> : <div className="p-20 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">{t.unauthorized}</div>} />
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
        {isProfileLoading && (
          <div className="fixed inset-0 z-[2000] bg-white flex items-center justify-center">
            <div className="text-center">
               <Loader2 className="animate-spin text-hotel-primary mx-auto mb-4" size={48} />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Registry...</p>
            </div>
          </div>
        )}
        {isProfileIncomplete && <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />}
        {profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={() => setIsManageAccountOpen(false)} onUpdate={() => loadProfile(user)} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />}
        {selectedRoomToBook && profile && <BookingModal room={selectedRoomToBook} profile={profile} activeDiscount={0} onClose={() => setSelectedRoomToBook(null)} onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} />}
        <MobileBottomNav user={user} profile={profile} isAdmin={isAdmin} language={language} openAuth={() => setIsAuthModalOpen(true)} toggleProfile={() => setIsManageAccountOpen(true)} />
      </main>
    </div>
  );
};

const HomeView = ({ siteConfig, isEditMode, language, setSiteConfig, handleImageUpload, handleImageDelete, requireAuth }: any) => {
  const [activeCategories, setActiveCategories] = useState(['all']);
  const t = (translations as any)[language];
  
  const isVisible = (id: string) => activeCategories.includes('all') || activeCategories.includes(id);

  return (
    <>
      <Hero 
        config={siteConfig.hero} 
        rooms={siteConfig.rooms} 
        isEditMode={isEditMode} 
        language={language} 
        onUpdate={(h: any) => setSiteConfig((prev: any) => ({...prev, hero: {...prev.hero, ...h}}))} 
        onImageUpload={handleImageUpload} 
        onImageDelete={handleImageDelete}
        requireAuth={requireAuth}
        activeCategories={activeCategories}
        onCategoriesChange={setActiveCategories}
      />
      
      {isVisible('offers') && (
        <div id="offers">
          <ExclusiveOffers 
            offers={siteConfig.offers} 
            headerImage={siteConfig.offersHeaderImage}
            isEditMode={isEditMode} 
            language={language} 
            onUpdate={(o: any) => setSiteConfig((prev: any) => ({...prev, offers: o}))} 
            onUpdateHeader={(url: string) => setSiteConfig((prev: any) => ({...prev, offersHeaderImage: url}))}
            onImageUpload={handleImageUpload} 
            onImageDelete={handleImageDelete} 
          />
        </div>
      )}
      
      {isVisible('rooms') && (
        <div id="rooms">
          <RoomGrid 
            rooms={siteConfig.rooms} 
            headerImage={siteConfig.roomsHeaderImage}
            onBook={(room: any) => requireAuth(() => {})} 
            isEditMode={isEditMode} 
            language={language} 
            onUpdate={(r: any) => setSiteConfig((prev: any) => ({...prev, rooms: r}))} 
            onUpdateHeader={(url: string) => setSiteConfig((prev: any) => ({...prev, roomsHeaderImage: url}))}
            onImageUpload={handleImageUpload} 
            onImageDelete={handleImageDelete} 
          />
        </div>
      )}
      
      {isVisible('restaurants') && (
        <div id="restaurants">
          <NearbyRestaurants 
            restaurants={siteConfig.restaurants} 
            headerImage={siteConfig.restaurantsHeaderImage}
            isEditMode={isEditMode} 
            language={language} 
            onUpdate={(res: any) => setSiteConfig((prev: any) => ({...prev, restaurants: res}))} 
            onUpdateHeader={(url: string) => setSiteConfig((prev: any) => ({...prev, restaurantsHeaderImage: url}))}
            onImageUpload={handleImageUpload} 
            onImageDelete={handleImageDelete} 
          />
        </div>
      )}
      
      {isVisible('guide') && (
        <div id="guide">
          <TouristGuide 
            touristGuides={siteConfig.touristGuides} 
            headerImage={siteConfig.touristHeaderImage}
            isEditMode={isEditMode} 
            language={language} 
            onUpdate={(tg: any) => setSiteConfig((prev: any) => ({...prev, touristGuides: tg}))} 
            onUpdateHeader={(url: string) => setSiteConfig((prev: any) => ({...prev, touristHeaderImage: url}))}
            onImageUpload={handleImageUpload} 
            onImageDelete={handleImageDelete} 
          />
        </div>
      )}

      {isVisible('about') && (
        <section id="about" className="max-w-7xl mx-auto px-4 py-20 w-full animate-fade-in scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={siteConfig.aboutHeaderImage} className="w-full h-full object-cover" alt="About Hotel" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/10"></div>
                {isEditMode && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-all flex items-center gap-3">
                      <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          setSiteConfig((prev: any) => ({...prev, aboutHeaderImage: url}));
                        }
                      }} />
                      <Camera size={18} className="text-hotel-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-700">Change About Image</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 bg-hotel-primary text-white p-8 rounded-[2rem] shadow-2xl hidden md:block">
                <p className="text-4xl font-black mb-1">24/7</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Elite Service</p>
              </div>
            </div>
            <div>
              <span className="text-hotel-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Our Legacy</span>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                Defining Hospitality in <span className="text-hotel-primary">Sylhet</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 font-light italic">
                Hotel Shotabdi Residential is more than just a place to stay. It's a sanctuary of comfort and elegance, located in the heart of Sylhet's vibrant HQ district.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <p className="text-2xl font-black text-gray-900 mb-1">100%</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Safe & Secure</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <p className="text-2xl font-black text-gray-900 mb-1">Elite</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Guest Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isVisible('gallery') && (
        <div id="gallery">
          <GallerySection 
            isEditMode={isEditMode} 
            language={language} 
            onImageUpload={handleImageUpload} 
            onImageDelete={handleImageDelete}
          />
        </div>
      )}
    </>
  );
};

const App: React.FC = () => (<BrowserRouter><AppContent /></BrowserRouter>);
export default App;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  requestNotificationToken,
  onMessage
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Restaurant, Attraction, Offer, Booking, Room } from './types';
import { LogIn, Loader2, Bell, Edit3, Eye, Globe, RefreshCw, X, Info, MapPin, Phone, Mail, Tag, ShieldAlert, Languages, Megaphone, Download, Upload, ShieldCheck, Gavel } from 'lucide-react';
import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL } from './constants';

const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

const RouteMetadata = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const metaConfig: Record<string, { title: string; desc: string }> = {
      '/': { 
        title: 'Hotel Shotabdi Residential | Best Luxury Stay in Sylhet',
        desc: 'Book your stay at Hotel Shotabdi Residential, the premier luxury hotel in Sylhet. 24/7 service, free Wi-Fi, and prime location near Keane Bridge.'
      },
      '/offers': { 
        title: 'Exclusive Hotel Deals & Discounts | Hotel Shotabdi',
        desc: 'Discover seasonal offers and 25% discounts at Hotel Shotabdi Residential. Best residential rates in Sylhet for families and solo travelers.'
      },
      '/rooms': { 
        title: 'Luxury Rooms & Family Suites | Hotel Shotabdi Sylhet',
        desc: 'Explore our range of Deluxe Single, Double, and Super Deluxe rooms. Comfort and luxury residential experience at the heart of Sylhet.'
      },
      '/restaurants': { 
        title: 'Best Restaurants Near Hotel Shotabdi | Sylhet Dining Guide',
        desc: 'Explore the top eateries and traditional restaurants near Hotel Shotabdi. From Panshi to Sultan\'s Dine, discover the flavors of Sylhet.'
      },
      '/guide': { 
        title: 'Sylhet Tourist Attractions & Travel Guide | Hotel Shotabdi',
        desc: 'Plan your Sylhet trip with our local guide. Visit Keane Bridge, Shah Jalal Dargah, and tea gardens easily from Hotel Shotabdi.'
      },
      '/helpdex': { 
        title: 'Help Dex Live Assistance | Hotel Shotabdi Resident Support',
        desc: 'Connect with our 24/7 support registry for room services, laundry, and local assistance at Hotel Shotabdi Residential.'
      },
      '/privacypolicy': { 
        title: 'Privacy Policy | Hotel Shotabdi Residential',
        desc: 'Learn about how Hotel Shotabdi Residential handles guest data and privacy compliance for a secure stay.'
      },
      '/termsofservice': { 
        title: 'Terms of Service | Hotel Shotabdi Residential',
        desc: 'Review the terms and conditions for booking and staying at Hotel Shotabdi Residential, Sylhet.'
      },
      '/admin': { 
        title: 'Admin Dashboard | Hotel Shotabdi Registry Control',
        desc: 'Management portal for Hotel Shotabdi Residential registry and guest bookings.'
      }
    };

    const currentMeta = metaConfig[pathname] || metaConfig['/'];
    document.title = currentMeta.title;
    
    // Update SEO Meta Tags
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        if (name.includes('og:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateMeta('description', currentMeta.desc);
    updateMeta('og:title', currentMeta.title);
    updateMeta('og:description', currentMeta.desc);
    updateMeta('twitter:title', currentMeta.title);
    updateMeta('twitter:description', currentMeta.desc);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://hotelshotabdiabashik.com${pathname === '/' ? '' : pathname}`);
    }

  }, [pathname]);
  
  return null;
};

const AppContent = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFCMRequest, setShowFCMRequest] = useState(false);
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

  useEffect(() => {
    const configRef = ref(db, 'site-config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSiteConfig(prev => {
          if (!isSaving) {
            return { ...prev, ...data };
          }
          return prev;
        });
      }
      setIsConfigLoading(false);
    }, (error) => {
      console.error("Firebase sync error:", error);
      setIsConfigLoading(false);
    });

    return () => unsubscribe();
  }, [isSaving]);

  const validOffers = useMemo(() => {
    const now = Date.now();
    return (siteConfig.offers || []).filter(o => {
      if (!o.endDate) return true;
      const start = o.startDate || 0;
      const end = o.endDate;
      return now >= start && now <= end;
    });
  }, [siteConfig.offers]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setHasPendingBooking(false);
      return;
    }

    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const nUnsub = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data) as AppNotification[];
        setNotifications(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setNotifications([]);
      }
    });

    const bookingsRef = ref(db, `bookings`);
    const bUnsub = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allBookings = Object.values(snapshot.val()) as Booking[];
        const userPending = allBookings.some(b => b.userId === user.uid && b.status === 'pending');
        setHasPendingBooking(userPending);
      } else {
        setHasPendingBooking(false);
      }
    });

    if (Notification.permission === 'default') {
      setShowFCMRequest(true);
    } else if (Notification.permission === 'granted') {
      handleNotificationAccept();
    }

    return () => { nUnsub(); bUnsub(); };
  }, [user]);

  const handleNotificationAccept = async () => {
    setShowFCMRequest(false);
    const token = await requestNotificationToken();
    if (token && user) {
      await update(ref(db, `profiles/${user.uid}`), { fcmToken: token });
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const configRef = ref(db, 'site-config');
      const remoteSnapshot = await get(configRef);
      const remoteData = remoteSnapshot.exists() ? remoteSnapshot.val() : {};
      const updatedConfig = { ...remoteData, ...siteConfig, lastUpdated: Date.now() };
      await update(ref(db), { 'site-config': updatedConfig });
      fetch(`${CMS_WORKER_URL}/site-config.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': ADMIN_SECRET },
        body: JSON.stringify(updatedConfig)
      }).catch(() => {});
      alert("Website published live!");
      setIsEditMode(false);
    } catch (e) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadToR2 = async (file: File, folder: string): Promise<string> => {
    const cleanFolderName = (folder || "uploads").replace(/^\/|\/$/g, '').replace(/ /g, '_').toLowerCase();
    const filename = `${cleanFolderName}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const url = `${CMS_WORKER_URL}/${filename}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'Authorization': ADMIN_SECRET },
      body: file
    });
    if (!res.ok) throw new Error("Upload failed");
    const mediaId = Date.now().toString();
    update(ref(db, `media-library/${mediaId}`), {
      url, path: filename, folder: cleanFolderName, mimeType: file.type, uploadedAt: Date.now()
    }).catch(() => {});
    return url;
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
    updates[`notifications/${user.uid}`] = null; // Basic simplification for example
    await update(ref(db), updates);
  };

  const closeAllPopups = () => {
    setIsAuthModalOpen(false);
    setIsNotificationsOpen(false);
    setIsManageAccountOpen(false);
    setSelectedRoomToBook(null);
  };

  const toggleAuth = () => {
    closeAllPopups();
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  const toggleNotifications = () => {
    const nextState = !isNotificationsOpen;
    closeAllPopups();
    setIsNotificationsOpen(nextState);
    if (nextState) markAllAsRead();
  };

  const toggleManageAccount = () => {
    const nextState = !isManageAccountOpen;
    closeAllPopups();
    setIsManageAccountOpen(nextState);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLogoSpinning) return;
    setIsLogoSpinning(true);
    setTimeout(() => setIsLogoSpinning(false), 2000);
  };

  const handleClaimOffer = async (offer: Offer) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (hasPendingBooking) {
      alert("You have a booking request already under review.");
      return;
    }
    if (offer.isOneTime) {
      const claimed = profile?.claims || [];
      if (claimed.includes(offer.id)) {
        alert("Already redeemed.");
        return;
      }
      const newClaims = [...claimed, offer.id];
      await update(ref(db, `profiles/${user.uid}`), { claims: newClaims });
      setProfile(prev => prev ? { ...prev, claims: newClaims } : null);
    }
    setActiveDiscount(offer.discountPercent || 0);
    setClaimedOfferId(offer.id);
    alert(`Offer Claimed! ${offer.discountPercent}% active.`);
  };

  const handleRoomBookingInit = (room: Room) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (hasPendingBooking) {
      alert("System Lock: You have a pending booking.");
      return;
    }
    setSelectedRoomToBook(room);
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Restoring Hub Configuration...</p>
      </div>
    );
  }

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      {isOwner && (
        <div className="fixed bottom-24 right-6 z-[2000] flex flex-col items-end gap-3 pointer-events-auto">
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
              className="px-6 py-4 bg-green-600 text-white rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:scale-105 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
              Publish
            </button>
          )}
        </div>
      )}

      <Sidebar isAdmin={isAdmin || isOwner} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {(siteConfig.announcement || isEditMode) && (
          <div className="bg-hotel-primary text-white py-2.5 px-6 text-center z-[65] relative flex items-center justify-center gap-3 overflow-hidden">
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
            {isEditMode ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="bg-white/20 border-none outline-none text-center w-full font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-1 rounded-lg placeholder:text-white/40"
                  value={siteConfig.announcement}
                  onChange={(e) => setSiteConfig(prev => ({ ...prev, announcement: e.target.value }))}
                  placeholder="ANNOUNCEMENT TEXT"
                />
              </div>
            ) : (
              <p className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] truncate">{siteConfig.announcement}</p>
            )}
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
          </div>
        )}

        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 md:py-4 flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 md:gap-4 group">
              <div onClick={handleLogoClick} className="cursor-pointer select-none">
                <img src={LOGO_ICON_URL} className={`w-10 h-10 md:w-14 md:h-14 object-contain transition-transform group-hover:scale-110 ${isLogoSpinning ? 'animate-spin-once' : ''}`} alt="Hotel Shotabdi Residential Logo" />
              </div>
              <div className="flex flex-col select-none leading-none -space-y-1">
                <h1 className="text-lg md:text-xl font-serif font-black text-gray-900 tracking-tight">Hotel Shotabdi</h1>
                <p className="text-[8px] md:text-[9px] text-hotel-primary font-black uppercase tracking-[0.3em]">Residential</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasPendingBooking && (
              <div className="hidden lg:flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full border border-amber-100">
                 <ShieldAlert size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Pending Review</span>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4 relative">
                <button onClick={toggleNotifications} className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-hotel-primary/10 text-hotel-primary' : 'text-gray-400 hover:text-hotel-primary'}`}>
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={toggleManageAccount} className={`flex items-center gap-3 bg-gray-50 hover:bg-white border p-1.5 pr-4 rounded-2xl transition-all group ${isManageAccountOpen ? 'border-hotel-primary/30 ring-4 ring-hotel-primary/5' : 'border-gray-100'}`}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} className="w-full h-full object-cover" alt="User Profile" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] font-black text-gray-900 leading-tight">{profile?.username ? `@${profile.username}` : 'Guest'}</p>
                    {isOwner && <span className="text-[8px] font-black text-hotel-primary uppercase tracking-widest">Owner</span>}
                  </div>
                </button>
                {isNotificationsOpen && (
                  <div className="absolute top-16 right-0 w-[300px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-[2000]">
                    <div className="bg-[#B22222] p-6 text-white flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase tracking-widest">Alerts Hub</h3>
                      <button onClick={closeAllPopups} aria-label="Close Notifications"><X size={18} /></button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar p-4 space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-gray-50 opacity-60' : 'bg-red-50/50 border-hotel-primary/10'}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'booking_update' ? 'bg-[#B22222] text-white' : n.type === 'chat_message' ? 'bg-hotel-primary text-white' : 'bg-blue-500 text-white'}`}><Info size={14} /></div>
                              <div className="flex-1">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{n.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No alerts</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={toggleAuth} className="flex items-center gap-3 bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all">
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <article className="animate-fade-in">
                <Hero 
                  config={siteConfig.hero} 
                  isEditMode={isEditMode} 
                  onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}}))} 
                  onImageUpload={(f) => uploadToR2(f, 'hero')} 
                />
                <section aria-label="Exclusive Offers">
                  <ExclusiveOffers 
                    offers={validOffers} 
                    isEditMode={isEditMode} 
                    claimedOfferId={claimedOfferId} 
                    onClaim={handleClaimOffer} 
                    onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} 
                    onImageUpload={(f) => uploadToR2(f, 'offers')} 
                  />
                </section>
                <section aria-label="Available Rooms">
                  <RoomGrid 
                    rooms={siteConfig.rooms} 
                    isEditMode={isEditMode} 
                    activeDiscount={activeDiscount} 
                    isBookingDisabled={hasPendingBooking} 
                    onBook={handleRoomBookingInit} 
                    onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} 
                    onImageUpload={(f) => uploadToR2(f, 'rooms')} 
                  />
                </section>
                <section aria-label="Dining Options">
                  <NearbyRestaurants 
                    restaurants={siteConfig.restaurants} 
                    isEditMode={isEditMode} 
                    onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} 
                    onImageUpload={(f) => uploadToR2(f, 'restaurants')} 
                  />
                </section>
                <section aria-label="Tourist Information">
                  <TouristGuide 
                    touristGuides={siteConfig.touristGuides} 
                    isEditMode={isEditMode} 
                    onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} 
                    onImageUpload={(f) => uploadToR2(f, 'guide')} 
                  />
                </section>
              </article>
            } />
            <Route path="/offers" element={
              <article className="pt-10 animate-fade-in min-h-screen bg-gray-50/20">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                   <h1 className="text-4xl md:text-6xl font-sans font-black text-gray-900 tracking-tighter">Exclusive Promotions</h1>
                </div>
                <ExclusiveOffers 
                  offers={validOffers} 
                  isEditMode={isEditMode} 
                  claimedOfferId={claimedOfferId} 
                  onClaim={handleClaimOffer} 
                  onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o}))} 
                  onImageUpload={(f) => uploadToR2(f, 'offers')} 
                />
              </article>
            } />
            <Route path="/rooms" element={
              <article>
                <RoomGrid 
                  rooms={siteConfig.rooms} 
                  activeDiscount={activeDiscount} 
                  isBookingDisabled={hasPendingBooking} 
                  onBook={handleRoomBookingInit} 
                  isEditMode={isEditMode} 
                  onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r}))} 
                  onImageUpload={(f) => uploadToR2(f, 'rooms')} 
                />
              </article>
            } />
            <Route path="/offers/:offerId" element={<OfferPage offers={siteConfig.offers} onClaim={handleClaimOffer} />} />
            <Route path="/restaurants" element={
              <article>
                <NearbyRestaurants 
                  restaurants={siteConfig.restaurants} 
                  isEditMode={isEditMode} 
                  onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res}))} 
                  onImageUpload={(f) => uploadToR2(f, 'restaurants')} 
                />
              </article>
            } />
            <Route path="/guide" element={
              <article>
                <TouristGuide 
                  touristGuides={siteConfig.touristGuides} 
                  isEditMode={isEditMode} 
                  onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg}))} 
                  onImageUpload={(f) => uploadToR2(f, 'guide')} 
                />
              </article>
            } />
            <Route path="/helpdex" element={<HelpDex profile={profile} />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
            <Route path="/admin" element={(isAdmin || isOwner) ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen font-black text-gray-400 uppercase text-[10px] tracking-widest">Access Denied</div>} />
          </Routes>
        </div>

        <footer className="bg-white border-t border-gray-100 py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={LOGO_ICON_URL} className="w-12 h-12 grayscale opacity-40" alt="Hotel Shotabdi Logo" />
                  <div>
                    <p className="text-[12px] font-bold text-gray-900 uppercase tracking-[0.2em]">Hotel Shotabdi</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.1em] mt-0.5">Residential Service</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-normal leading-relaxed max-w-xs">
                  Premium hospitality and residential excellence in the heart of Sylhet. Fully indexed and ready for your next stay.
                </p>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Compliance</h4>
                 <nav className="flex flex-col gap-4">
                    <Link to="/privacypolicy" className="text-xs text-gray-500 font-normal hover:text-hotel-primary transition-colors flex items-center gap-2">
                       <ShieldCheck size={14} /> Privacy Policy
                    </Link>
                    <Link to="/termsofservice" className="text-xs text-gray-500 font-normal hover:text-hotel-primary transition-colors flex items-center gap-2">
                       <Gavel size={14} /> Terms of Service
                    </Link>
                 </nav>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Contact HQ</h4>
                 <address className="flex flex-col gap-3 not-italic">
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-2">
                      <Mail size={12}/> hotelshotabdiabashik@gmail.com
                    </p>
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-2">
                      <Phone size={12}/> +880 1717-425702
                    </p>
                    <p className="text-xs text-gray-500 font-normal flex items-start gap-2">
                      <MapPin size={12} className="mt-1 shrink-0" /> 
                      Kumargaon Bus Stand, Sunamganj Road, Sylhet, Bangladesh.
                    </p>
                 </address>
              </div>
            </div>
            
            <div className="pt-10 border-t border-gray-50 text-center">
               <p className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">© 2024 Hotel Shotabdi Residential. All Rights Reserved.</p>
            </div>
          </div>
        </footer>

        <AuthModal isOpen={isAuthModalOpen} onClose={closeAllPopups} />

        <MobileBottomNav user={user} isAdmin={isAdmin || isOwner} openAuth={toggleAuth} toggleProfile={toggleManageAccount} />
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
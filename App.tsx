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
import { 
  auth, 
  onAuthStateChanged, 
  syncUserProfile,
  OWNER_EMAIL,
  db,
  ref,
  onValue,
  update,
  set
} from './services/firebase';
import { UserProfile, SiteConfig, AppNotification, Restaurant, Attraction, Offer, Booking, Room } from './types';
import { LogIn, Loader2, Bell, Edit3, Eye, Globe, RefreshCw, X, Info, MapPin, Phone, Mail, Tag, ShieldAlert, Languages, Megaphone } from 'lucide-react';
import { ROOMS_DATA } from './constants';

const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";
const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev";
const ADMIN_SECRET = "kahar02";

const RouteMetadata = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      '/': 'Hotel Shotabdi Residential | Premium Stay in Sylhet',
      '/offers': 'Exclusive Offers & Promotions | Hotel Shotabdi',
      '/rooms': 'Our Luxury Rooms & Suites | Hotel Shotabdi',
      '/restaurants': 'Nearby Dining & Restaurants | Hotel Shotabdi',
      '/guide': 'Sylhet Tourist Guide & Landmarks | Hotel Shotabdi',
      '/privacypolicy': 'Privacy Policy | Hotel Shotabdi',
      '/termsofservice': 'Terms of Service | Hotel Shotabdi',
      '/admin': 'Admin Dashboard | Hotel Shotabdi'
    };
    if (pathname.startsWith('/offers/')) {
       document.title = 'Exclusive Offers | Hotel Shotabdi Residential';
    } else {
       document.title = titles[pathname] || 'Hotel Shotabdi Residential';
    }
  }, [pathname]);
  return null;
};

const AppContent = () => {
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
      title: "",
      subtitle: "Provides 24-hour front desk and room services, along with high-speed free Wi-Fi and free parking",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
      buttonText: "Book Now",
      locationLabel: "Sylhet HQ District"
    },
    rooms: ROOMS_DATA,
    offers: [],
    restaurants: [
      { 
        id: 101, 
        name: "Rutbah Hotel International", 
        cuisine: "Mid-range Hotel", 
        rating: 4.3, 
        time: "12m", 
        distance: "1.5 km", 
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80", 
        tag: "🏢 AC Rooms • Restaurant", 
        description: "An affordable, mid-range hotel with clean AC rooms, a restaurant, and helpful staff.",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Rutbah+Hotel+International+Sylhet" 
      },
      { 
        id: 102, 
        name: "SAUDIA RESIDENTIAL HOTEL", 
        cuisine: "Residential Hotel", 
        rating: 4.2, 
        time: "8m", 
        distance: "0.8 km", 
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80", 
        tag: "🧹 Clean • Friendly Staff", 
        description: "Praised for its clean environment, good location, and friendly staff. Some guests noted the absence of on-site food facilities.",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=SAUDIA+RESIDENTIAL+HOTEL+Sylhet" 
      },
      { 
        id: 103, 
        name: "Hotel Grand Brother's", 
        cuisine: "Budget Hotel", 
        rating: 3.5, 
        time: "10m", 
        distance: "1.2 km", 
        image: "https://images.unsplash.com/photo-1551882547-ff43c59fe4c2?auto=format&fit=crop&q=80", 
        tag: "💰 Budget Friendly", 
        description: "A budget-friendly option located close to the city center, noted for clean rooms and well-behaved staff.",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Grand+Brother's+Sylhet" 
      }
    ],
    touristGuides: [],
    announcement: "25% OFF DISCOUNT",
    lastUpdated: 0
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${CMS_WORKER_URL}/site-config.json`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSiteConfig(prev => {
             // Use server data if it's fresher than hardcoded defaults
             const merged = { ...prev, ...data };
             return (data.lastUpdated || 0) >= prev.lastUpdated ? merged : prev;
          });
        }
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

    return () => { nUnsub(); bUnsub(); };
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
        alert("Website published live!");
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
    const cleanFolderName = (folder || "uploads").replace(/^\/|\/$/g, '').replace(/ /g, '_').toLowerCase();
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

  const closeAllPopups = () => {
    setIsAuthModalOpen(false);
    setIsNotificationsOpen(false);
    setIsManageAccountOpen(false);
    setSelectedRoomToBook(null);
  };

  const toggleAuth = () => {
    const nextState = !isAuthModalOpen;
    closeAllPopups();
    setIsAuthModalOpen(nextState);
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
        alert("This exclusive offer has already been redeemed.");
        return;
      }
      const newClaims = [...claimed, offer.id];
      await update(ref(db, `profiles/${user.uid}`), { claims: newClaims });
      setProfile(prev => prev ? { ...prev, claims: newClaims } : null);
    }

    setActiveDiscount(offer.discountPercent || 0);
    setClaimedOfferId(offer.id);
    alert(`Offer Claimed! ${offer.discountPercent}% discount active.`);
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
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Configuration...</p>
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
        {/* Announcement Bar - Editable by Owner */}
        {(siteConfig.announcement || isEditMode) && (
          <div className="bg-hotel-primary text-white py-2.5 px-6 text-center z-[65] relative flex items-center justify-center gap-3 overflow-hidden">
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
            {isEditMode ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="bg-white/20 border-none outline-none text-center w-full font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-1 rounded-lg placeholder:text-white/40"
                  value={siteConfig.announcement}
                  onChange={(e) => setSiteConfig(prev => ({ ...prev, announcement: e.target.value, lastUpdated: Date.now() }))}
                  placeholder="ENTER ANNOUNCEMENT TEXT (E.G. 25% OFF DISCOUNT)"
                />
              </div>
            ) : (
              <p className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] truncate">
                {siteConfig.announcement}
              </p>
            )}
            <Megaphone size={14} className="shrink-0 animate-pulse hidden md:block" />
          </div>
        )}

        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-3 md:py-4 flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 md:gap-4 group">
              <div onClick={handleLogoClick} className="cursor-pointer select-none">
                <img src={LOGO_ICON_URL} className={`w-10 h-10 md:w-14 md:h-14 object-contain transition-transform group-hover:scale-110 ${isLogoSpinning ? 'animate-spin-once' : ''}`} alt="Logo" />
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
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E53935&color=fff`} className="w-full h-full object-cover" alt="User" />
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
                      <button onClick={closeAllPopups}><X size={18} /></button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar p-4 space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-gray-50 opacity-60' : 'bg-red-50/50 border-hotel-primary/10'}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'booking_update' ? 'bg-[#B22222] text-white' : 'bg-blue-500 text-white'}`}><Info size={14} /></div>
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
              <div className="animate-fade-in">
                <Hero config={siteConfig.hero} isEditMode={isEditMode} onUpdate={(h) => setSiteConfig(prev => ({...prev, hero: {...prev.hero, ...h}, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'hero')} />
                <ExclusiveOffers offers={validOffers} isEditMode={isEditMode} claimedOfferId={claimedOfferId} onClaim={handleClaimOffer} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'offers')} />
                <RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} activeDiscount={activeDiscount} isBookingDisabled={hasPendingBooking} onBook={handleRoomBookingInit} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'rooms')} />
                <NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'restaurants')} />
              </div>
            } />
            <Route path="/offers" element={
              <div className="pt-10 animate-fade-in min-h-screen bg-gray-50/20">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                   <h1 className="text-4xl md:text-6xl font-sans font-black text-gray-900 tracking-tighter">Promotions</h1>
                   <p className="text-gray-500 mt-4 max-w-2xl font-light">Explore our latest exclusive deals.</p>
                </div>
                <ExclusiveOffers offers={validOffers} isEditMode={isEditMode} claimedOfferId={claimedOfferId} onClaim={handleClaimOffer} onUpdate={(o) => setSiteConfig(prev => ({...prev, offers: o, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'offers')} />
              </div>
            } />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} activeDiscount={activeDiscount} isBookingDisabled={hasPendingBooking} onBook={handleRoomBookingInit} isEditMode={isEditMode} onUpdate={(r) => setSiteConfig(prev => ({...prev, rooms: r, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'rooms')} />} />
            <Route path="/offers/:offerId" element={<OfferPage offers={siteConfig.offers} onClaim={handleClaimOffer} />} />
            <Route path="/restaurants" element={<NearbyRestaurants restaurants={siteConfig.restaurants} isEditMode={isEditMode} onUpdate={(res) => setSiteConfig(prev => ({...prev, restaurants: res, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'restaurants')} />} />
            <Route path="/guide" element={<TouristGuide touristGuides={siteConfig.touristGuides} isEditMode={isEditMode} onUpdate={(tg) => setSiteConfig(prev => ({...prev, touristGuides: tg, lastUpdated: Date.now()}))} onImageUpload={(f) => uploadToR2(f, 'guide')} />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
            <Route path="/admin" element={(isAdmin || isOwner) ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen">Denied</div>} />
          </Routes>
        </div>

        <footer className="bg-white border-t border-gray-50 py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={LOGO_ICON_URL} className="w-12 h-12 grayscale opacity-40" alt="Logo" />
                  <div>
                    <p className="text-[12px] font-black text-gray-900 uppercase tracking-[0.4em]">Hotel Shotabdi</p>
                    <p className="text-[10px] text-hotel-primary font-black uppercase tracking-[0.2em] mt-0.5">Residential Service</p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-400 font-medium leading-relaxed max-sm">Experience world-class hospitality at the heart of Sylhet.</p>
              </div>
              <div className="space-y-4">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] mb-4">Address</p>
                  <p className="text-[11px] text-gray-500">Kumar Gaon Bus Stand, Sunamganj Road, Sylhet</p>
              </div>
              <div className="space-y-4">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] mb-4">Contact</p>
                  <p className="text-[11px] text-gray-500">hotelshotabdiabashik@gmail.com</p>
              </div>
            </div>
          </div>
        </footer>

        {/* AUTHORIZED POPUPS (Z-LEVELS handled within individual Portal components) */}
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAllPopups} />
        {selectedRoomToBook && profile && (
          <BookingModal 
            room={selectedRoomToBook} 
            profile={profile} 
            activeDiscount={activeDiscount} 
            onClose={closeAllPopups} 
            onImageUpload={(f) => uploadToR2(f, `bookings/${profile.uid}`)}
          />
        )}
        {user && profile && !profile.isComplete && <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />}
        {user && profile && isManageAccountOpen && <ManageAccount profile={profile} onClose={closeAllPopups} onUpdate={() => loadProfile(user)} />}

        <MobileBottomNav user={user} isAdmin={isAdmin || isOwner} openAuth={toggleAuth} toggleProfile={toggleManageAccount} />
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <RouteMetadata />
    <AppContent />
  </BrowserRouter>
);

export default App;
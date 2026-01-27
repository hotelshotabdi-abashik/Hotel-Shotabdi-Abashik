
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
import { UserProfile, AppNotification, SiteConfig } from './types';
import { LogOut, LayoutDashboard, Loader2, Edit3, Save, Eye, Globe, RefreshCw } from 'lucide-react';
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // CMS States
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero: {
      title: "Luxury Reimagined in Sylhet",
      subtitle: "Experience world-class hospitality at the heart of the city's heritage.",
      backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
      buttonText: "Check Availability"
    },
    rooms: ROOMS_DATA,
    announcement: "25% OFF SEASONAL DISCOUNT",
    lastUpdated: Date.now()
  });

  // Load Config from R2
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${CMS_WORKER_URL}/site-config.json`);
        if (res.ok) {
          const data = await res.json();
          setSiteConfig(data);
        }
      } catch (e) {
        console.warn("Using default local configuration.");
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${CMS_WORKER_URL}/site-config.json`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': ADMIN_SECRET 
        },
        body: JSON.stringify({ ...siteConfig, lastUpdated: Date.now() })
      });
      if (res.ok) {
        alert("Website published live!");
        setIsEditMode(false);
      } else {
        throw new Error("Publish failed");
      }
    } catch (e) {
      alert("Error publishing: Check ADMIN_SECRET and Worker status.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadToR2 = async (file: File, folder: string): Promise<string> => {
    // Format: /Folder Name/filename
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
      console.warn("Background Sync Warning:", error);
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

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      {isOwner && (
        <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-3">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-6 py-4 rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest ${
              isEditMode ? 'bg-hotel-primary text-white' : 'bg-white text-gray-900 border border-gray-100'
            }`}
          >
            {isEditMode ? <><Eye size={18} /> Exit Design</> : <><Edit3 size={18} /> Design Mode</>}
          </button>
          
          {isEditMode && (
            <button 
              onClick={saveConfig}
              disabled={isSaving}
              className="px-6 py-4 bg-green-600 text-white rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:scale-105"
            >
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
              Publish Live
            </button>
          )}
        </div>
      )}

      <Sidebar isAdmin={isAdmin || isOwner} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full">
        {/* Pass user/profile/etc to Header as before */}
        <Routes>
          <Route path="/" element={
            <div className="bg-white">
              <Hero 
                config={siteConfig.hero} 
                isEditMode={isEditMode}
                onUpdate={(newHero) => setSiteConfig({...siteConfig, hero: {...siteConfig.hero, ...newHero}})}
                onImageUpload={(file) => uploadToR2(file, 'Hero Section')}
              />
              <div className="mt-10">
                <RoomGrid 
                  rooms={siteConfig.rooms}
                  isEditMode={isEditMode}
                  onUpdate={(newRooms) => setSiteConfig({...siteConfig, rooms: newRooms})}
                  onImageUpload={(file) => uploadToR2(file, 'Rooms Images')}
                />
              </div>
              <div className="mt-8"><NearbyRestaurants /></div>
            </div>
          } />
          <Route path="/rooms" element={<div className="py-10 bg-white"><RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} onUpdate={(newRooms) => setSiteConfig({...siteConfig, rooms: newRooms})} onImageUpload={(file) => uploadToR2(file, 'Rooms Images')} /></div>} />
          <Route path="/restaurants" element={<div className="py-10 bg-white min-h-screen"><NearbyRestaurants /></div>} />
          <Route path="/guide" element={<div className="py-10 bg-white"><TouristGuide /></div>} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/admin" element={(isAdmin || isOwner) ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen">Restricted</div>} />
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

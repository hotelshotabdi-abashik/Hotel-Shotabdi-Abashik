
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
import AdminDashboard from './components/AdminDashboard';
import { 
  auth, db, onAuthStateChanged, signOut, syncUserProfile, ref, get, update, OWNER_EMAIL 
} from './services/firebase';
import { UserProfile, SiteConfig } from './types';
import { Loader2, Save, Edit3, Eye, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { ROOMS_DATA } from './constants';

const CMS_WORKER_URL = "https://hotel-cms-worker.hotelshotabdiabashik.workers.dev"; 
const ADMIN_SECRET = "kahar02"; 

const AppContent = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
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

  // Load Site Config from R2
  const loadConfig = useCallback(async () => {
    setIsConfigLoading(true);
    try {
      const res = await fetch(`${CMS_WORKER_URL}/site-config.json`);
      if (res.ok) {
        const data = await res.json();
        setSiteConfig(data);
      }
    } catch (e) {
      console.warn("Could not load remote config, using defaults.");
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Handle Auth
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ownerStatus = u.email === OWNER_EMAIL;
        setIsOwner(ownerStatus);
        const p = await syncUserProfile(u);
        setProfile(p);
      } else {
        setIsOwner(false);
        setProfile(null);
      }
    });
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
        alert("Success: Website updated live for all users!");
        setIsEditMode(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      alert("Error: Access denied or Worker down. Check ADMIN_SECRET.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    // folder: 'Hero Section', 'Rooms Images', etc.
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
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

  return (
    <div className="flex min-h-screen bg-white font-sans w-full overflow-x-hidden">
      {/* Designer Toolbar (Only for Owner) */}
      {isOwner && (
        <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-3 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto scale-90 md:scale-100 origin-bottom-right">
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border border-white/20 backdrop-blur-xl ${
                isEditMode ? 'bg-hotel-primary text-white' : 'bg-white/90 text-gray-900'
              }`}
            >
              {isEditMode ? <><Eye size={18} /> Finish Design</> : <><Edit3 size={18} /> Design Mode</>}
            </button>
            
            {isEditMode && (
              <button 
                onClick={saveConfig}
                disabled={isSaving}
                className="px-6 py-4 bg-green-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(22,163,74,0.3)] transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:scale-105 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
                Publish Live Changes
              </button>
            )}
          </div>
        </div>
      )}

      <Sidebar isAdmin={isOwner} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full">
        {isConfigLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching Global Config...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <>
                <Hero 
                  config={siteConfig.hero} 
                  isEditMode={isEditMode}
                  onUpdate={(newHero) => setSiteConfig({...siteConfig, hero: {...siteConfig.hero, ...newHero}})}
                  onImageUpload={(file) => uploadImage(file, 'Hero Section')}
                />
                <RoomGrid 
                  rooms={siteConfig.rooms}
                  isEditMode={isEditMode}
                  onUpdate={(newRooms) => setSiteConfig({...siteConfig, rooms: newRooms})}
                  onImageUpload={(file) => uploadImage(file, 'Rooms Images')}
                />
                <NearbyRestaurants />
              </>
            } />
            <Route path="/rooms" element={<RoomGrid rooms={siteConfig.rooms} isEditMode={isEditMode} onUpdate={(newRooms) => setSiteConfig({...siteConfig, rooms: newRooms})} onImageUpload={(file) => uploadImage(file, 'Rooms Images')} />} />
            <Route path="/restaurants" element={<NearbyRestaurants />} />
            <Route path="/guide" element={<TouristGuide />} />
            <Route path="/admin" element={isOwner ? <AdminDashboard /> : <div className="p-20 text-center">Unauthorized</div>} />
          </Routes>
        )}
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

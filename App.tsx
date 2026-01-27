
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
  onAuthStateChanged, 
  syncUserProfile,
  OWNER_EMAIL
} from './services/firebase';
import { UserProfile } from './types';
import { LogIn, User, Loader2, ShieldCheck, Bell } from 'lucide-react';
import { ROOMS_DATA } from './constants';

const LOGO_ICON_URL = "https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/Fuad%20Editing%20Zone%20Assets/ICON-01.png";

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadProfile = useCallback(async (u: any) => {
    if (!u) return;
    try {
      const data = await syncUserProfile(u);
      setProfile(data);
      if (u.email === OWNER_EMAIL) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.warn("Sync Warning:", error);
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
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadProfile]);

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-hotel-primary/10 text-hotel-text w-full max-w-full overflow-x-hidden">
      <Sidebar isAdmin={isAdmin} />
      
      <main className="lg:ml-72 flex-1 relative pb-32 lg:pb-0 w-full flex flex-col">
        {/* Restored Sticky Header */}
        <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={LOGO_ICON_URL} className="w-8 h-8 lg:hidden" alt="Shotabdi Logo" />
            <div className="hidden md:block">
              <h2 className="text-sm font-black text-gray-900 tracking-tight">Shotabdi Residential</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Sylhet Station Area</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthLoading ? (
              <Loader2 className="animate-spin text-gray-300" size={18} />
            ) : user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2.5 text-gray-400 hover:text-hotel-primary transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-hotel-primary rounded-full border-2 border-white"></span>
                </button>
                <button 
                  onClick={() => setIsManageAccountOpen(true)}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-hotel-primary/30 p-1.5 pr-4 rounded-2xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] font-black text-gray-900 leading-tight">
                      {profile?.username ? `@${profile.username}` : 'Resident'}
                    </p>
                    {isAdmin && <span className="text-[8px] font-black text-hotel-primary uppercase tracking-widest">Admin Access</span>}
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-3 bg-hotel-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="animate-fade-in">
                <Hero />
                <RoomGrid rooms={ROOMS_DATA} />
                <NearbyRestaurants />
              </div>
            } />
            <Route path="/rooms" element={<div className="py-10"><RoomGrid rooms={ROOMS_DATA} /></div>} />
            <Route path="/restaurants" element={<div className="py-10 min-h-screen"><NearbyRestaurants /></div>} />
            <Route path="/guide" element={<div className="py-10"><TouristGuide /></div>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center min-h-screen">Unauthorized</div>} />
          </Routes>
        </div>

        {/* Restored Original Footer */}
        <footer className="bg-white border-t border-gray-50 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <img src={LOGO_ICON_URL} className="w-8 h-8 opacity-20 grayscale" alt="Logo" />
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Shotabdi Residential</p>
                <p className="text-[9px] text-gray-200 font-bold uppercase tracking-widest mt-0.5">Premium Housing • Sylhet</p>
              </div>
            </div>
            
            <div className="flex gap-10">
              <Link to="/privacypolicy" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-hotel-primary transition-colors">Privacy Policy</Link>
              <Link to="/termsofservice" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-hotel-primary transition-colors">Terms of Service</Link>
            </div>

            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
              © 2024 • All Rights Reserved
            </p>
          </div>
        </footer>

        {/* Support Components */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
        
        {user && profile && !profile.isComplete && (
          <ProfileOnboarding user={user} onComplete={() => loadProfile(user)} />
        )}

        {user && profile && isManageAccountOpen && (
          <ManageAccount 
            profile={profile} 
            onClose={() => setIsManageAccountOpen(false)} 
            onUpdate={() => loadProfile(user)} 
          />
        )}

        <MobileBottomNav 
          user={user} 
          isAdmin={isAdmin} 
          openAuth={() => setIsAuthModalOpen(true)} 
          toggleProfile={() => setIsManageAccountOpen(!isManageAccountOpen)} 
        />
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

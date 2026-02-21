
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Shield, Key, LayoutDashboard, X } from 'lucide-react';
import { UserProfile } from '../types';

interface SplitLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  isAdmin: boolean;
  profile: UserProfile | null;
  onOpenAdmin: () => void;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ 
  leftContent, 
  rightContent, 
  isAdmin, 
  profile,
  onOpenAdmin
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [securityGate, setSecurityGate] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityGate === 'kahar02') {
      setIsAuthorized(true);
      onOpenAdmin();
      setIsDrawerOpen(false);
      setSecurityGate('');
    } else {
      alert("Access Denied: Invalid Security Key");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden bg-white">
      {/* Left Pane: Visual Discovery */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-[#0A192F] overflow-hidden">
        {leftContent}
      </div>

      {/* Right Pane: Functional Core */}
      <div className="w-full md:w-1/2 min-h-screen bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-10">
        {rightContent}
      </div>

      {/* Floating Management Shortcut */}
      {isAdmin && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-8 right-8 z-[200] w-14 h-14 bg-hotel-primary text-white rounded-2xl shadow-[0_10px_30px_rgba(229,57,53,0.4)] flex items-center justify-center border border-white/20"
        >
          <Shield size={24} />
        </motion.button>
      )}

      {/* 3D Slide-in Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%', rotateY: -20 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: '100%', rotateY: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col origin-right border-l border-gray-100"
            style={{ perspective: '1000px' }}
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-serif font-black text-gray-900 uppercase">Management</h2>
                <p className="text-[10px] text-hotel-primary font-black uppercase tracking-widest">Security Gate</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 mb-8">
                <div className="w-12 h-12 bg-hotel-primary/10 rounded-2xl flex items-center justify-center text-hotel-primary mb-6">
                  <Key size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase mb-2">Access Required</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">Enter the management security key to access the administrative console.</p>
                
                <form onSubmit={handleSecurityCheck} className="space-y-4">
                  <input
                    type="password"
                    value={securityGate}
                    onChange={(e) => setSecurityGate(e.target.value)}
                    placeholder="Security Key"
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-hotel-primary focus:ring-4 focus:ring-hotel-primary/10 outline-none transition-all font-mono text-center tracking-widest"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-hotel-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Shield size={16} /> Authenticate
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Role</p>
                  <p className="text-sm font-black text-gray-900 uppercase">{profile?.role || 'Admin'}</p>
                </div>
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-black text-gray-900 uppercase">Verified</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">Hotel Shotabdi Residential © 2026</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SplitLayout;

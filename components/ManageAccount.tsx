
import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Calendar, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { db, ref, set, get, checkUsernameUnique, serverTimestamp } from '../services/firebase';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: () => void;
}

const ManageAccount: React.FC<Props> = ({ profile, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pendingDays, setPendingDays] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  const [form, setForm] = useState({ ...profile });

  useEffect(() => {
    const lastUpdate = profile.lastUpdated || 0;
    const now = Date.now();
    const diff = now - lastUpdate;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    if (diff < thirtyDays) {
      setPendingDays(Math.ceil((thirtyDays - diff) / (1000 * 60 * 60 * 24)));
      setIsLocked(true);
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (form.username !== profile.username) {
        const isUnique = await checkUsernameUnique(form.username, profile.uid);
        if (!isUnique) throw new Error('Username already taken');
      }

      const normalizedUsername = form.username.toLowerCase().trim();
      
      // Update data
      const finalProfile = {
        ...form,
        username: normalizedUsername,
        lastUpdated: serverTimestamp()
      };

      await set(ref(db, `profiles/${profile.uid}`), finalProfile);
      
      // Handle username registry change
      if (normalizedUsername !== profile.username) {
        await set(ref(db, `usernames/${normalizedUsername}`), profile.uid);
      }

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-serif font-black text-gray-900">Manage Identity</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Shotabdi Verified User</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {isLocked && (
            <div className="mb-8 p-5 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-amber-800 uppercase tracking-tight mb-1">Account Locked</p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Identity profiles can only be modified once every 30 days. You have <span className="font-black underline">{pendingDays} days</span> remaining before your next allowed update.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm outline-none transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.legalName}
                  onChange={e => setForm({...form, legalName: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm outline-none transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Phone</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm outline-none transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Phone</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm outline-none transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.guardianPhone}
                  onChange={e => setForm({...form, guardianPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Information</label>
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-hotel-primary">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">NID: {profile.nidNumber}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified 17-Digit ID</p>
                  </div>
                </div>
                <div className="w-16 h-10 rounded-lg overflow-hidden border border-white shadow-sm">
                  <img src={profile.nidImageUrl} className="w-full h-full object-cover" alt="NID" />
                </div>
              </div>
            </div>

            {!isLocked && (
              <div className="pt-4">
                <button 
                  disabled={loading || success}
                  className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                    success ? 'bg-green-500 text-white shadow-green-100' : 'bg-hotel-primary text-white shadow-red-100 hover:bg-hotel-secondary'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : success ? <ShieldCheck /> : <Save size={18} />}
                  {success ? 'Profile Secured' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageAccount;

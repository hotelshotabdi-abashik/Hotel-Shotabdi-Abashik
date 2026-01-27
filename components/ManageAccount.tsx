
import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Calendar, Loader2, ShieldCheck, IdCard, Camera, CheckCircle2, History, Trash2, UserX } from 'lucide-react';
import { db, ref, set, get, checkUsernameUnique, serverTimestamp, deleteUserProfile, signOut, auth } from '../services/firebase';
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
  const [nidPreview, setNidPreview] = useState(profile.nidImageUrl);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [form, setForm] = useState({ 
    legalName: profile.legalName,
    username: profile.username,
    phone: profile.phone,
    guardianPhone: profile.guardianPhone,
    nidNumber: profile.nidNumber,
  });

  useEffect(() => {
    const lastUpdate = profile.lastUpdated || profile.createdAt || 0;
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const diff = now - lastUpdate;
    
    if (diff < thirtyDaysMs) {
      const remainingMs = thirtyDaysMs - diff;
      const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      setPendingDays(days);
      setIsLocked(true);
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setLoading(true);
    setError('');
    
    try {
      const normalizedUsername = form.username.toLowerCase().trim().replace(/\s/g, '');
      
      if (normalizedUsername !== profile.username) {
        const isUnique = await checkUsernameUnique(normalizedUsername, profile.uid);
        if (!isUnique) throw new Error('Username already claimed');
      }

      if (form.nidNumber.length !== 17) {
        throw new Error(`Invalid NID: ${form.nidNumber.length}/17 digits`);
      }

      const timestamp = Date.now();
      const finalProfile = {
        ...profile,
        ...form,
        username: normalizedUsername,
        nidImageUrl: nidPreview,
        lastUpdated: timestamp
      };

      await set(ref(db, `profiles/${profile.uid}`), finalProfile);
      
      if (normalizedUsername !== profile.username) {
        await set(ref(db, `usernames/${normalizedUsername}`), profile.uid);
      }

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelf = async () => {
    setDeleting(true);
    try {
      await deleteUserProfile(profile.uid, profile.username);
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      setError("Failed to delete profile. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[90vh] border border-white/40 ring-1 ring-black/5">
        
        {/* Memory Header */}
        <div className="p-8 md:p-10 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/40">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img src={profile.photoURL} className="w-full h-full object-cover" alt="User" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">Account Vault</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <History size={10} className="text-hotel-primary" /> Member since {new Date(profile.createdAt).getFullYear()}
                </p>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={10} className="text-green-500" />
                  <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 no-scrollbar space-y-8">
          {isLocked && (
            <div className="p-6 bg-hotel-primary/5 rounded-[2.5rem] border border-hotel-primary/10 flex items-start gap-5 group animate-pulse-slow">
              <div className="bg-hotel-primary text-white p-3.5 rounded-2xl shrink-0 shadow-lg shadow-red-100">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-hotel-primary uppercase tracking-[0.2em] mb-1">Account Locked</p>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  To protect your identity, data is frozen for 30 days after an update. <br />
                  Next modification available in <span className="text-hotel-primary font-black underline decoration-2">{pendingDays} days</span>.
                </p>
              </div>
            </div>
          )}

          <form id="manage-profile-form" onSubmit={handleUpdate} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-hotel-primary text-[10px] font-black text-center uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Identity</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-semibold outline-none transition-all ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.legalName}
                  onChange={e => setForm({...form, legalName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Handle</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-6 text-sm font-semibold outline-none transition-all ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Phone</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-semibold outline-none transition-all ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Phone</label>
                <input 
                  type="text" 
                  disabled={isLocked}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-semibold outline-none transition-all ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:bg-white focus:border-hotel-primary'}`}
                  value={form.guardianPhone}
                  onChange={e => setForm({...form, guardianPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Government ID Details</label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className={`relative ${isLocked ? 'opacity-40' : ''}`}>
                    <IdCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      maxLength={17}
                      disabled={isLocked}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-mono tracking-widest outline-none"
                      value={form.nidNumber}
                      onChange={e => setForm({...form, nidNumber: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                  {!isLocked && (
                    <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:border-hotel-primary/30 transition-all cursor-pointer overflow-hidden">
                      <input type="file" accept="image/*" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => setNidPreview(reader.result as string);
                           reader.readAsDataURL(file);
                         }
                      }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Camera size={16} className="text-hotel-primary" /> Replace Document
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-1 ring-black/5 aspect-video bg-gray-100 group">
                  <img src={nidPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="NID Document" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </form>

          {/* Dangerous Zone */}
          <div className="pt-10 border-t border-gray-50">
             <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-hotel-primary transition-colors mx-auto"
             >
                <Trash2 size={14} /> Clear My Identity Data
             </button>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-gray-50/50 border-t border-gray-100/50">
          {!isLocked ? (
            <button 
              form="manage-profile-form"
              type="submit"
              disabled={loading || success}
              className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] ${
                success ? 'bg-green-500 text-white' : 'bg-hotel-primary text-white hover:bg-hotel-secondary'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={20} /> : <Save size={18} />}
              {success ? 'Vault Updated' : 'Authorize Update'}
            </button>
          ) : (
            <div className="text-center py-2">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-hotel-primary" /> Secure Profile Registry
              </p>
              <p className="text-[9px] text-gray-300 font-bold mt-1">LOCKED UNTIL {formattedDate((profile.lastUpdated || profile.createdAt) + (30 * 24 * 60 * 60 * 1000))}</p>
            </div>
          )}
        </div>
      </div>

      {/* Internal Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 bg-red-50 text-hotel-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserX size={32} />
              </div>
              <h3 className="text-2xl font-serif font-black mb-2">Forget Me?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">
                This action is irreversible. All your profile information, NID documents, and username claim will be wiped from our secure servers.
              </p>
              <div className="space-y-3">
                 <button 
                    disabled={deleting}
                    onClick={handleDeleteSelf}
                    className="w-full bg-hotel-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                 >
                    {deleting ? <Loader2 className="animate-spin" size={16} /> : "Yes, Purge My Data"}
                 </button>
                 <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-4 text-[10px] font-black uppercase text-gray-400"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccount;


import React, { useState } from 'react';
import { ShieldCheck, User, Phone, IdCard, Camera, Loader2, AlertCircle, CheckCircle2, Maximize2, X } from 'lucide-react';
import { db, setDoc, doc, checkUsernameUnique } from '../services/firebase';

interface Props {
  user: any;
  onComplete: () => void;
  onImageUpload: (file: File) => Promise<string>;
  onImageDelete?: (url: string) => Promise<boolean>;
}

const ProfileOnboarding: React.FC<Props> = ({ user, onComplete, onImageUpload, onImageDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nidPreview, setNidPreview] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({
    legalName: '',
    username: '',
    phone: '',
    guardianPhone: '',
    nidNumber: '',
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setIsUploading(true);
      setError('');
      try {
        const url = await onImageUpload(file);
        setNidPreview(url);
      } catch (err: any) {
        setError('Image upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImageRemove = async () => {
    if (nidPreview && onImageDelete && nidPreview.includes('r2.dev')) {
      try {
        await onImageDelete(nidPreview);
      } catch (err) {
        console.error("Failed to delete from R2:", err);
      }
    }
    setNidPreview('');
  };

  const validate = async () => {
    const { legalName, username, phone, guardianPhone, nidNumber } = form;
    if (!legalName || !username || !phone || !guardianPhone || !nidNumber || !nidPreview) {
      throw new Error('All identity fields and NID photo are required');
    }
    if (username.includes(' ')) throw new Error('Username cannot contain spaces');
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) throw new Error('Format: +[CountryCode][Number] (e.g. +88017XXXXXXXX)');
    if (!phoneRegex.test(guardianPhone)) throw new Error('Guardian Phone must be in international format');
    if (nidNumber.length < 10 || nidNumber.length > 17) {
      throw new Error(`NID must be between 10 to 17 digits. Currently: ${nidNumber.length}`);
    }
    const isUnique = await checkUsernameUnique(username, user.uid);
    if (!isUnique) throw new Error('This username is already claimed by another member');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await validate();
      const normalizedUsername = form.username.toLowerCase().trim();
      const timestamp = Date.now();
      const profileData = {
        ...form,
        username: normalizedUsername,
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        nidImageUrl: nidPreview,
        isComplete: true,
        lastUpdated: timestamp,
        createdAt: timestamp,
      };
      await setDoc(doc(db, 'profiles', user.uid), profileData);
      await setDoc(doc(db, 'usernames', normalizedUsername), { uid: user.uid });
      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-12 md:py-20 animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-hotel-primary/10 rounded-[2rem] flex items-center justify-center text-hotel-primary mx-auto mb-6 shadow-inner ring-1 ring-hotel-primary/20">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-serif font-black text-gray-900 mb-2 tracking-tight">Identity Verification</h1>
            <p className="text-sm text-gray-500 font-medium">To maintain security, please provide your legal credentials.</p>
            <div className="mt-6 p-4 bg-amber-50/80 backdrop-blur rounded-2xl border border-amber-100/50 flex items-start gap-4 text-left">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                Caution: Identity data is locked for 30 minutes after submission. Double-check all digits.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-hotel-primary text-[11px] font-black text-center uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name (full name)</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                  <input type="text" placeholder="Official NID Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5" value={form.legalName} onChange={e => setForm({...form, legalName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique Username</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black group-focus-within:text-hotel-primary transition-colors">@</span>
                  <input type="text" placeholder="no_spaces" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5" value={form.username} onChange={e => setForm({...form, username: e.target.value.replace(/\s/g, '').toLowerCase()})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                  <input type="text" placeholder="+88017XXXXXXXX" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                  <input type="text" placeholder="+880XXXXXXXXXX" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5" value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NID Number (10-17 digits)</label>
                <span className={`text-[9px] font-bold ${(form.nidNumber.length >= 10 && form.nidNumber.length <= 17) ? 'text-green-500' : 'text-gray-300'}`}>
                  {form.nidNumber.length} / 17
                </span>
              </div>
              <div className="relative group">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                <input type="text" maxLength={17} placeholder="NID Digits" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5 font-mono tracking-widest" value={form.nidNumber} onChange={e => setForm({...form, nidNumber: e.target.value.replace(/\D/g, '')})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Front Side Photo</label>
              <div className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all ${nidPreview ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}>
                {!nidPreview && <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                {nidPreview ? (
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                        <img src={nidPreview} className="w-24 h-16 rounded-xl object-contain border-2 border-white shadow-xl bg-gray-100" alt="NID Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center">
                          <Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={12} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-green-700">Digital Copy Linked</p>
                        <p className="text-[10px] text-green-600/60 font-medium">Verified Aspect Ratio</p>
                      </div>
                    </div>
                    <button onClick={handleImageRemove} className="p-3 bg-white rounded-xl text-red-500 shadow-sm border border-gray-100 hover:bg-red-50 transition-all"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3 shadow-sm border border-gray-50">
                      {isUploading ? <Loader2 size={24} className="animate-spin text-hotel-primary" /> : <Camera size={24} />}
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{isUploading ? 'Uploading Scan...' : 'Upload NID Front Side'}</p>
                    <p className="text-[9px] text-gray-400/60 mt-1 font-medium italic">Full Document View Required</p>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-hotel-primary text-white py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-red-100 hover:bg-hotel-secondary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Verify & Unlock Stay</>}
            </button>
          </form>
        </div>
      </div>

      {isLightboxOpen && nidPreview && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-10 right-10 text-white/60 hover:text-white p-4">
            <X size={32} />
          </button>
          <img src={nidPreview} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="Full NID Scan" referrerPolicy="no-referrer" />
        </div>
      )}
    </>
  );
};

export default ProfileOnboarding;

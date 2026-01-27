
import React, { useState } from 'react';
import { ShieldCheck, User, Phone, IdCard, Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, set, ref, checkUsernameUnique, serverTimestamp } from '../services/firebase';

interface Props {
  user: any;
  onComplete: () => void;
}

const ProfileOnboarding: React.FC<Props> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nidPreview, setNidPreview] = useState('');
  
  const [form, setForm] = useState({
    legalName: '',
    username: '',
    phone: '',
    guardianPhone: '',
    nidNumber: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Image size must be under 1MB for secure processing');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNidPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = async () => {
    const { legalName, username, phone, guardianPhone, nidNumber } = form;
    
    if (!legalName || !username || !phone || !guardianPhone || !nidNumber || !nidPreview) {
      throw new Error('All identity fields and NID photo are required');
    }
    
    if (username.includes(' ')) throw new Error('Username cannot contain spaces');
    
    // Validate Phone Format: +[Country Code][11 Digits]
    const phoneRegex = /^\+\d{11,15}$/;
    if (!phoneRegex.test(phone)) throw new Error('Format: +[CountryCode][11 Digits] (e.g. +8801712345678)');
    if (!phoneRegex.test(guardianPhone)) throw new Error('Guardian Phone must be in international format');
    
    // Strict 17-Digit NID Validation
    if (nidNumber.length !== 17) {
      throw new Error(`NID must be exactly 17 digits. Currently: ${nidNumber.length}`);
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

      await set(ref(db, `profiles/${user.uid}`), profileData);
      await set(ref(db, `usernames/${normalizedUsername}`), user.uid);
      
      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
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
              Caution: Identity data is locked for 30 days after submission. Double-check all digits.
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Official NID Name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5"
                  value={form.legalName}
                  onChange={e => setForm({...form, legalName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black group-focus-within:text-hotel-primary transition-colors">@</span>
                <input 
                  type="text" 
                  placeholder="no_spaces"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value.replace(/\s/g, '').toLowerCase()})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Phone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="+8801712345678"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Phone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="+8801312345678"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5"
                  value={form.guardianPhone}
                  onChange={e => setForm({...form, guardianPhone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">17-Digit NID Number</label>
              <span className={`text-[9px] font-bold ${form.nidNumber.length === 17 ? 'text-green-500' : 'text-gray-300'}`}>
                {form.nidNumber.length} / 17
              </span>
            </div>
            <div className="relative group">
              <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={18} />
              <input 
                type="text" 
                maxLength={17}
                placeholder="1990XXXXXXXXXXXXX"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5 font-mono tracking-widest"
                value={form.nidNumber}
                onChange={e => setForm({...form, nidNumber: e.target.value.replace(/\D/g, '')})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Front Side Photo</label>
            <div className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all ${nidPreview ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {nidPreview ? (
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={nidPreview} className="w-24 h-16 rounded-xl object-cover border-2 border-white shadow-xl" alt="NID Preview" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                      <CheckCircle2 size={12} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700">Digital Copy Linked</p>
                    <p className="text-[10px] text-green-600/60 font-medium">Click to replace photo</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3 shadow-sm border border-gray-50">
                    <Camera size={24} />
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Upload NID Front Side</p>
                  <p className="text-[9px] text-gray-400/60 mt-1 font-medium italic">Supports JPG, PNG up to 1MB</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-hotel-primary text-white py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-red-100 hover:bg-hotel-secondary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Verify & Unlock Stay <ShieldCheck size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileOnboarding;

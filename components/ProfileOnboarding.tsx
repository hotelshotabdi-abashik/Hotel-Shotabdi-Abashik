
import React, { useState } from 'react';
import { ShieldCheck, User, Phone, IdentificationCard, Camera, Loader2, AlertCircle } from 'lucide-react';
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
        setError('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNidPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = async () => {
    if (!form.legalName || !form.username || !form.phone || !form.guardianPhone || !form.nidNumber || !nidPreview) {
      throw new Error('All fields are mandatory');
    }
    if (form.username.includes(' ')) throw new Error('Username cannot contain spaces');
    if (!/^\+\d{11,15}$/.test(form.phone)) throw new Error('Phone must start with + and include country code');
    if (!/^\+\d{11,15}$/.test(form.guardianPhone)) throw new Error('Guardian Phone must start with + and include country code');
    if (form.nidNumber.length !== 17) throw new Error('NID must be exactly 17 digits');
    
    const isUnique = await checkUsernameUnique(form.username, user.uid);
    if (!isUnique) throw new Error('Username is already taken');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await validate();
      
      const updates: any = {};
      const normalizedUsername = form.username.toLowerCase().trim();
      
      // Update profile
      await set(ref(db, `profiles/${user.uid}`), {
        ...form,
        username: normalizedUsername,
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        nidImageUrl: nidPreview,
        isComplete: true,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Claim username
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
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-hotel-primary/10 rounded-3xl flex items-center justify-center text-hotel-primary mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Security Verification</h1>
          <p className="text-sm text-gray-500 font-medium">Please complete your identity profile to unlock luxury bookings.</p>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3 text-[10px] text-amber-700 font-bold uppercase tracking-widest justify-center">
            <AlertCircle size={14} /> Only one edit allowed every 30 days
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-hotel-primary text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="As per NID"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all"
                  value={form.legalName}
                  onChange={e => setForm({...form, legalName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">@</span>
                <input 
                  type="text" 
                  placeholder="unique_id"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value.replace(/\s/g, '')})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="+88017..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="+88013..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all"
                  value={form.guardianPhone}
                  onChange={e => setForm({...form, guardianPhone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">17-Digit NID Number</label>
            <div className="relative">
              <IdentificationCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                maxLength={17}
                placeholder="19901234567890123"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all"
                value={form.nidNumber}
                onChange={e => setForm({...form, nidNumber: e.target.value.replace(/\D/g, '')})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Front Side Photo</label>
            <div className={`relative border-2 border-dashed rounded-3xl p-6 transition-all ${nidPreview ? 'border-green-100 bg-green-50/30' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {nidPreview ? (
                <div className="flex items-center gap-4">
                  <img src={nidPreview} className="w-20 h-14 rounded-lg object-cover border border-white shadow-md" alt="NID Preview" />
                  <div>
                    <p className="text-xs font-black text-green-700">Image Uploaded</p>
                    <p className="text-[10px] text-green-600/70">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-xs font-bold text-gray-400">Tap to upload NID front photo</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-hotel-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-hotel-secondary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileOnboarding;

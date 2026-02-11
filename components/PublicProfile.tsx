
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Calendar, Star, Hotel, ArrowRight, Loader2 } from 'lucide-react';
import { db, ref, get, onValue } from '../services/firebase';
import { UserProfile } from '../types';
import { LOGO_ICON_URL } from '../constants';

const PublicProfile: React.FC = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    
    const usernamesRef = ref(db, `usernames/${username.toLowerCase()}`);
    get(usernamesRef).then(async (snap) => {
      if (snap.exists()) {
        const uid = snap.val();
        const profileRef = ref(db, `profiles/${uid}`);
        const pSnap = await get(profileRef);
        if (pSnap.exists()) {
          setProfile(pSnap.val());
          // Update Page Metadata for SEO
          const name = pSnap.val().legalName || username;
          document.title = `${name} | Verified Resident at Hotel Shotabdi Residential Sylhet`;
        }
      }
      setLoading(false);
    });
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-hotel-primary" size={32} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Resident Not Found</h2>
      <p className="text-gray-400 mb-8">This registry record is either private or does not exist.</p>
      <Link to="/" className="bg-hotel-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Back to Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
        <div className="bg-hotel-primary p-12 text-white text-center relative">
          <div className="absolute top-8 left-8">
            <img src={LOGO_ICON_URL} className="w-10 h-10 object-contain brightness-0 invert opacity-20" />
          </div>
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl mx-auto mb-6">
             <img src={profile.photoURL} className="w-full h-full object-cover" alt={`${profile.legalName} Resident`} />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight">{profile.legalName}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mt-2">Verified Hotel Resident</p>
        </div>

        <div className="p-10 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-hotel-primary" /> Identity Badge
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-sm font-black text-gray-900 leading-none">@{profile.username}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">Residential ID Registry</p>
                  </div>
               </div>

               <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={14} className="text-hotel-primary" /> Current Hub
                  </h3>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-hotel-primary/5 rounded-xl flex items-center justify-center text-hotel-primary">
                        <Hotel size={24} />
                     </div>
                     <div>
                        <p className="text-sm font-black text-gray-900">Hotel Shotabdi Residential</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Sylhet, Bangladesh</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col justify-center bg-hotel-primary/[0.02] p-10 rounded-[2.5rem] border border-hotel-primary/5 text-center">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                 <Star size={32} className="text-amber-400 fill-amber-400" />
               </div>
               <h4 className="text-xl font-black text-gray-900 mb-2">Book Your Stay</h4>
               <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">Join verified residents at Sylhet's premier destination.</p>
               <Link to="/rooms" className="bg-hotel-primary text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-100 flex items-center justify-center gap-3 hover:scale-105 transition-all">
                 View Luxury Rooms <ArrowRight size={16} />
               </Link>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-gray-50 text-center border-t border-gray-100">
           <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Digital Registry Record • Non-Transferable</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

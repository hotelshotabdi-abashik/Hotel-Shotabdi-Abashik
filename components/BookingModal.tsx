
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, Users, ShieldCheck, Loader2, CheckCircle2, 
  Camera, IdCard, Info, AlertTriangle, ArrowRight, UserPlus,
  Clock, User as UserIcon, Phone, MessageSquare, PhoneCall,
  ChevronRight, Maximize2
} from 'lucide-react';
import { db, collection, onSnapshot, query, where, setDoc, doc } from '../services/firebase';
import { sendGuestEmail, notifyOwnerOfBooking } from '../services/emailService';
import { Room, UserProfile, GuestInfo, Booking } from '../types';

interface Props {
  room: Room;
  profile: UserProfile;
  activeDiscount: number;
  onClose: () => void;
  onImageUpload: (file: File) => Promise<string>;
  onImageDelete?: (url: string) => Promise<boolean>;
}

const BookingModal: React.FC<Props> = ({ room, profile, onClose, onImageUpload, onImageDelete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [totalGuests, setTotalGuests] = useState(room.id.includes('single') ? 1 : 2);
  const [uploadingGuestIndex, setUploadingGuestIndex] = useState<number | null>(null);
  const [hasExistingPending, setHasExistingPending] = useState(false);
  const [activeNumberChoice, setActiveNumberChoice] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const contactNumbers = [
    { value: "+880 1717-425702", clean: "8801717425702" },
    { value: "+880 1334-935566", clean: "8801334935566" }
  ];

  const [guests, setGuests] = useState<GuestInfo[]>(() => {
    return [
      { 
        legalName: profile.legalName, 
        age: profile.age || '', 
        nidNumber: profile.nidNumber, 
        phone: profile.phone, 
        guardianPhone: profile.guardianPhone,
        nidImageUrl: profile.nidImageUrl 
      }
    ];
  });

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', profile.uid), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      setHasExistingPending(!snap.empty);
    });
    return () => unsub();
  }, [profile.uid]);

  useEffect(() => {
    setGuests(prev => {
      const current = [...prev];
      if (current.length < totalGuests) {
        for (let i = current.length; i < totalGuests; i++) {
          current.push({ legalName: '', age: '', nidNumber: '', phone: '', guardianPhone: '', nidImageUrl: '' });
        }
      } else if (current.length > totalGuests) {
        return current.slice(0, totalGuests);
      }
      return current;
    });
  }, [totalGuests]);

  const finalPrice = room.discountPrice || room.price || "Price on Request";

  const handleGuestChange = (idx: number, field: keyof GuestInfo, val: string) => {
    const updated = [...guests];
    updated[idx] = { ...updated[idx], [field]: val };
    setGuests(updated);
  };

  const handleNidUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingGuestIndex(idx);
      try {
        const oldUrl = guests[idx].nidImageUrl;
        const url = await onImageUpload(file);
        
        // Delete old NID if it was an R2 URL
        if (oldUrl && onImageDelete && oldUrl.includes('r2.dev')) {
          await onImageDelete(oldUrl);
        }

        handleGuestChange(idx, 'nidImageUrl', url);
      } catch (err) {
        alert("ID upload failed.");
      } finally {
        setUploadingGuestIndex(null);
      }
    }
  };

  const handleNidDelete = async (idx: number) => {
    const url = guests[idx].nidImageUrl;
    if (url && onImageDelete && url.includes('r2.dev')) {
      await onImageDelete(url);
    }
    handleGuestChange(idx, 'nidImageUrl', '');
  };

  const submitBooking = async () => {
    if (hasExistingPending) {
      alert("Policy Restriction: You already have a pending booking request.");
      return;
    }
    setLoading(true);
    try {
      const bookingId = `book_${Date.now()}`;
      const bookingData: Booking = {
        id: bookingId,
        userId: profile.uid,
        userName: profile.legalName,
        userEmail: profile.email,
        roomTitle: room.title,
        roomId: room.id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        totalGuests: totalGuests,
        guests: guests,
        price: finalPrice,
        status: 'pending',
        hasEdited: false,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'bookings', bookingId), bookingData);
      
      // Senior Architect Fix: Sync to user_registry for guest-side persistence
      await setDoc(doc(db, 'user_registry', profile.uid, 'bookings', bookingId), bookingData);
      
      sendGuestEmail({
        to_name: profile.legalName,
        to_email: profile.email,
        subject: "Stay Request Logged - Hotel Shotabdi",
        message: `Your booking request for ${room.title} has been successfully submitted to our registry.`,
        booking_id: bookingId
      });
      notifyOwnerOfBooking(bookingData);
      setSuccess(true);
    } catch (err) {
      alert("System registry error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = dates.checkIn && dates.checkOut;
  const isStep2Valid = guests.every((g, idx) => {
     if (idx === 0) return g.legalName.trim().length > 2 && g.nidNumber && g.nidImageUrl;
     return g.legalName.trim().length > 2;
  });

  const modalContent = (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        
        <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20 animate-fade-in">
          
          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-20 text-center bg-white overflow-y-auto no-scrollbar">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-100 animate-bounce">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-2xl md:text-5xl font-serif font-black text-gray-900 tracking-tighter mb-4 px-4">Booking Logged</h2>
               <p className="text-gray-500 text-xs md:text-lg max-w-md mx-auto leading-relaxed mb-10 font-medium italic">
                 Your Booking submitted successfully, please contacts us for faster response.
               </p>

               <div className="w-full max-w-md space-y-4">
                  {contactNumbers.map((num) => (
                     <div key={num.value} className="relative">
                        <button 
                          onClick={() => setActiveNumberChoice(activeNumberChoice === num.value ? null : num.value)}
                          className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group active:scale-95 ${activeNumberChoice === num.value ? 'bg-hotel-primary border-hotel-primary text-white shadow-xl shadow-red-100' : 'bg-gray-50 border-gray-100 text-gray-900 hover:bg-white hover:border-hotel-primary/30'}`}
                        >
                           <div className="flex items-center gap-4">
                              <Phone size={24} className={activeNumberChoice === num.value ? 'text-white' : 'text-hotel-primary'} />
                              <span className="text-sm md:text-xl font-black tracking-tight">{num.value}</span>
                           </div>
                           <ChevronRight size={24} className={`transition-transform duration-300 ${activeNumberChoice === num.value ? 'rotate-90' : ''}`} />
                        </button>

                        {activeNumberChoice === num.value && (
                          <div className="flex gap-4 mt-4 animate-fade-in">
                             <a href={`tel:${num.clean}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                <PhoneCall size={18} /> Direct Call
                             </a>
                             <a href={`https://wa.me/${num.clean}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                <MessageSquare size={18} /> WhatsApp
                             </a>
                          </div>
                        )}
                     </div>
                  ))}
               </div>

               <button onClick={onClose} className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-hotel-primary transition-colors">
                  Return to Overview
               </button>
            </div>
          ) : (
            <>
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                      <Calendar size={22} />
                   </div>
                   <div>
                      <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-none">Stay Reservation</h3>
                      <p className="text-[9px] font-black text-hotel-primary uppercase tracking-[0.2em] mt-1.5 font-sans">{room.title} • ৳{finalPrice}/night</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white rounded-xl text-gray-400 hover:text-hotel-primary transition-all border border-gray-100 shadow-sm active:scale-95"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-white">
                 {hasExistingPending && (
                   <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-5 animate-pulse">
                      <ShieldCheck className="text-hotel-primary shrink-0" size={24} />
                      <div>
                         <p className="text-[11px] font-black text-hotel-primary uppercase tracking-widest mb-1">Pending Request Active</p>
                         <p className="text-xs text-red-600 font-medium leading-relaxed">
                           Our policy permits only one pending booking at a time per resident.
                         </p>
                      </div>
                   </div>
                 )}

                 <div className="flex items-center justify-center gap-4 mb-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${step === 1 ? 'bg-hotel-primary border-hotel-primary text-white scale-110 shadow-lg shadow-red-100' : 'border-gray-200 text-gray-300'}`}>1</div>
                    <div className="w-12 h-[2px] bg-gray-100"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${step === 2 ? 'bg-hotel-primary border-hotel-primary text-white scale-110 shadow-lg shadow-red-100' : 'border-gray-200 text-gray-300'}`}>2</div>
                 </div>

                 {step === 1 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                      <div className="space-y-6">
                         <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3"><Clock size={16} className="text-hotel-primary"/> Schedule</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Check In</label>
                               <input type="date" value={dates.checkIn} onChange={e => setDates({...dates, checkIn: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Check Out</label>
                               <input type="date" value={dates.checkOut} onChange={e => setDates({...dates, checkOut: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary transition-all" />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3"><Users size={16} className="text-hotel-primary"/> Occupants</h4>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Guests</label>
                            <select 
                              value={totalGuests} 
                              onChange={e => setTotalGuests(parseInt(e.target.value))}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer"
                            >
                               {Array.from({length: room.capacity}, (_, i) => i + 1).map(num => (
                                 <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-10 animate-fade-in pb-4">
                      {guests.map((guest, idx) => (
                        <div key={idx} className="space-y-6 border-b border-gray-100 pb-10 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                 {idx < 2 ? <ShieldCheck size={16} className="text-hotel-primary"/> : <UserPlus size={16} className="text-gray-400"/>}
                                 Guest {idx + 1}
                              </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                                   <input 
                                      placeholder="Full Name as per ID" 
                                      className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary ${idx === 0 ? 'opacity-70 cursor-not-allowed' : ''}`} 
                                      value={guest.legalName}
                                      disabled={idx === 0}
                                      onChange={e => handleGuestChange(idx, 'legalName', e.target.value)}
                                   />
                                </div>

                                {idx < 2 ? (
                                  <div className="space-y-1.5">
                                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Number</label>
                                     <input 
                                        placeholder="NID Number" 
                                        className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary font-mono ${idx === 0 ? 'opacity-70 cursor-not-allowed' : ''}`} 
                                        value={guest.nidNumber}
                                        disabled={idx === 0}
                                        onChange={e => handleGuestChange(idx, 'nidNumber', e.target.value.replace(/\D/g, ''))}
                                     />
                                  </div>
                                ) : null}
                             </div>

                             {idx < 2 ? (
                                <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Registry Scan</label>
                                   <div 
                                      onClick={() => guest.nidImageUrl && setLightboxUrl(guest.nidImageUrl)}
                                      className={`relative border-2 border-dashed rounded-[2rem] p-6 transition-all h-full min-h-[120px] flex items-center justify-center group ${guest.nidImageUrl ? 'border-green-200 bg-green-50/10 cursor-zoom-in' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}
                                   >
                                      {idx !== 0 && !guest.nidImageUrl && (
                                         <input type="file" accept="image/*" onChange={e => handleNidUpload(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                      )}
                                      {guest.nidImageUrl ? (
                                         <div className="flex flex-col items-center gap-2">
                                            <div className="w-24 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gray-100 relative">
                                               <img src={guest.nidImageUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={14} />
                                               </div>
                                            </div>
                                            {idx !== 0 && (
                                              <button onClick={(e) => { e.stopPropagation(); handleNidDelete(idx); }} className="text-[8px] font-black text-red-500 uppercase mt-1">Replace</button>
                                            )}
                                         </div>
                                      ) : (
                                         <div className="text-center">
                                            {uploadingGuestIndex === idx ? <Loader2 className="animate-spin text-hotel-primary mx-auto" size={16}/> : <Camera size={16} className="text-gray-300 mx-auto mb-1" />}
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Attach ID Photo</p>
                                         </div>
                                      )}
                                   </div>
                                </div>
                             ) : (
                                <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 p-8 flex flex-col items-center justify-center opacity-40">
                                   <UserIcon size={32} className="text-gray-300 mb-2" />
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Identity Waived</p>
                                </div>
                             )}
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                 {step === 2 && (
                   <button onClick={() => setStep(1)} className="px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all">Back</button>
                 )}
                 {step === 1 ? (
                   <button 
                      onClick={() => setStep(2)} 
                      disabled={!isStep1Valid}
                      className="flex-1 bg-gray-900 text-white py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                   >
                      Verify Guests <ArrowRight size={18} />
                 </button>
                 ) : (
                   <button 
                      onClick={submitBooking}
                      disabled={loading || !isStep2Valid || hasExistingPending}
                      className="flex-1 bg-hotel-primary text-white py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-red-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                      {loading ? <Loader2 className="animate-spin" size={20}/> : <React.Fragment><CheckCircle2 size={18}/> Finalize Booking</React.Fragment>}
                   </button>
                 )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox for NID during booking */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-10 right-10 text-white/60 hover:text-white p-4">
            <X size={32} />
          </button>
          <img src={lightboxUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="Full NID Scan" referrerPolicy="no-referrer" />
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default BookingModal;

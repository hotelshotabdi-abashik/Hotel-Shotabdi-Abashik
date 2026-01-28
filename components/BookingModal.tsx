
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, Users, ShieldCheck, Loader2, CheckCircle2, 
  Camera, IdCard, Info, AlertTriangle, ArrowRight, UserPlus,
  Clock, User
} from 'lucide-react';
import { db, ref, set } from '../services/firebase';
import { Room, UserProfile, GuestInfo, Booking } from '../types';

interface Props {
  room: Room;
  profile: UserProfile;
  activeDiscount: number;
  onClose: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

const BookingModal: React.FC<Props> = ({ room, profile, activeDiscount, onClose, onImageUpload }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [totalGuests, setTotalGuests] = useState(room.id.includes('single') ? 1 : 2);
  const [uploadingGuestIndex, setUploadingGuestIndex] = useState<number | null>(null);

  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

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

  const finalPrice = room.discountPrice;

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
        const url = await onImageUpload(file);
        handleGuestChange(idx, 'nidImageUrl', url);
      } catch (err) {
        alert("NID upload failed. Try a smaller image.");
      } finally {
        setUploadingGuestIndex(null);
      }
    }
  };

  const submitBooking = async () => {
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

      await set(ref(db, `bookings/${bookingId}`), bookingData);
      alert("Booking Request Logged! Our registry will verify all guest details shortly.");
      onClose();
    } catch (err) {
      alert("System registry error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = dates.checkIn && dates.checkOut;
  const isStep2Valid = guests.every((g, idx) => {
    if (idx < 2) {
      return g.legalName.trim().length > 2 && g.nidNumber && g.nidImageUrl;
    }
    return g.legalName.trim().length > 2 && g.age;
  });

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20 animate-fade-in">
        
        {/* Sticky Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                <Calendar size={22} />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-none">Stay Reservation</h3>
                <p className="text-[9px] font-black text-hotel-primary uppercase tracking-[0.2em] mt-1.5">{room.title} • ৳{finalPrice}/night</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-xl text-gray-400 hover:text-hotel-primary transition-all border border-gray-100 shadow-sm active:scale-95"><X size={20} /></button>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-white">
           {/* Step Indicator */}
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
                   <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex gap-4">
                      <Info size={18} className="text-blue-600 shrink-0" />
                      <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-wider">
                         Standard check-in is 12:00 PM. Early check-in subject to registry clearance.
                      </p>
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
                   <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex gap-4">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-wider">
                         Max occupancy limit of {room.capacity} is strictly enforced.
                      </p>
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
                           Guest {idx + 1} {idx === 0 ? '(Primary)' : idx === 1 ? '(Companion)' : '(Additional)'}
                        </h4>
                        {idx === 0 && <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 uppercase tracking-widest">Verified Linked</span>}
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
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Digits</label>
                               <input 
                                  placeholder="NID Number" 
                                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary font-mono ${idx === 0 ? 'opacity-70 cursor-not-allowed' : ''}`} 
                                  value={guest.nidNumber}
                                  disabled={idx === 0}
                                  onChange={e => handleGuestChange(idx, 'nidNumber', e.target.value.replace(/\D/g, ''))}
                               />
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                               <input 
                                  type="number"
                                  placeholder="Guest Age" 
                                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary" 
                                  value={guest.age}
                                  onChange={e => handleGuestChange(idx, 'age', e.target.value)}
                               />
                            </div>
                          )}
                       </div>

                       {idx < 2 ? (
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">NID Registry Scan</label>
                             <div className={`relative border-2 border-dashed rounded-[2rem] p-6 transition-all h-full min-h-[120px] flex items-center justify-center ${guest.nidImageUrl ? 'border-green-200 bg-green-50/10' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}>
                                {idx !== 0 && (
                                   <input type="file" accept="image/*" onChange={e => handleNidUpload(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                )}
                                {guest.nidImageUrl ? (
                                   <div className="flex flex-col items-center gap-2">
                                      <div className="w-24 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gray-200">
                                         <img src={guest.nidImageUrl} className="w-full h-full object-cover" />
                                      </div>
                                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Linked</p>
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
                             <User size={32} className="text-gray-300 mb-2" />
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center leading-relaxed">Full Identity Verification<br/>Waived for Addl. Guests</p>
                          </div>
                       )}
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all">Back</button>
           )}
           {step === 1 ? (
             <button 
                onClick={() => setStep(2)} 
                disabled={!isStep1Valid}
                className="flex-1 bg-gray-900 text-white py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
             >
                Verify Identities <ArrowRight size={18} />
             </button>
           ) : (
             <button 
                onClick={submitBooking}
                disabled={loading || !isStep2Valid}
                className="flex-1 bg-hotel-primary text-white py-4 md:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-red-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all"
             >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={18}/> Book Now</>}
             </button>
           )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BookingModal;

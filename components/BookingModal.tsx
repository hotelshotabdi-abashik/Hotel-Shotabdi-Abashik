
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, ShieldCheck, Loader2, CheckCircle2, 
  Camera, IdCard, Info, AlertTriangle, ArrowRight, UserPlus,
  Clock // Added missing Clock icon import
} from 'lucide-react';
import { db, ref, push, set } from '../services/firebase';
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

  const [guests, setGuests] = useState<GuestInfo[]>([
    { 
      legalName: profile.legalName, 
      age: profile.age || '', 
      nidNumber: profile.nidNumber, 
      phone: profile.phone, 
      guardianPhone: profile.guardianPhone,
      nidImageUrl: profile.nidImageUrl 
    },
    { legalName: '', age: '', nidNumber: '', phone: '', guardianPhone: '', nidImageUrl: '' }
  ]);

  const numericPrice = parseFloat(room.price.replace(/[^0-9.]/g, ''));
  const discount = activeDiscount > 25 ? activeDiscount : 25;
  const finalPrice = Math.round(numericPrice - (numericPrice * (discount / 100)));

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
        guests: guests.slice(0, room.id.includes('single') ? 1 : 2),
        price: finalPrice.toString(),
        status: 'pending',
        hasEdited: false,
        createdAt: Date.now()
      };

      await set(ref(db, `bookings/${bookingId}`), bookingData);
      alert("Booking Request Logged! Our registry will verify your NID details shortly.");
      onClose();
    } catch (err) {
      alert("System registry error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = dates.checkIn && dates.checkOut;
  const isStep2Valid = guests[0].legalName && guests[0].nidNumber && guests[0].nidImageUrl && (room.id.includes('single') || (guests[1].legalName && guests[1].nidImageUrl));

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Calendar size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Stay Reservation</h3>
                <p className="text-[9px] font-black text-hotel-primary uppercase tracking-widest">{room.title} • ৳{finalPrice}/night</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-xl text-gray-400 hover:text-hotel-primary transition-all border border-gray-100 shadow-sm"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
           {/* Step Indicator */}
           <div className="flex items-center justify-center gap-4 mb-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${step === 1 ? 'bg-hotel-primary border-hotel-primary text-white scale-110 shadow-lg shadow-red-100' : 'border-gray-200 text-gray-300'}`}>1</div>
              <div className="w-12 h-[2px] bg-gray-100"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${step === 2 ? 'bg-hotel-primary border-hotel-primary text-white scale-110 shadow-lg shadow-red-100' : 'border-gray-200 text-gray-300'}`}>2</div>
           </div>

           {step === 1 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                <div className="space-y-6">
                   <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><Clock size={16} className="text-hotel-primary"/> Schedule</h4>
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
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed uppercase tracking-wider">
                         Standard check-in is 12:00 PM. Early check-in subject to registry clearance.
                      </p>
                   </div>
                </div>
                <div className="space-y-6">
                   <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><Users size={16} className="text-hotel-primary"/> Occupants</h4>
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
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed uppercase tracking-wider">
                         Occupancy exceeds fire-safety limit of {room.capacity} is strictly prohibited.
                      </p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                {/* Guest 1 (Main Verified) */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-green-500"/> Guest 1 (Primary)</h4>
                      <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 uppercase">Verified Identity</span>
                   </div>
                   <div className="space-y-4 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Legal Name</p>
                         <p className="text-xs font-black text-gray-900">{guests[0].legalName}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">NID Digits</p>
                         <p className="text-xs font-mono font-black text-gray-700">{guests[0].nidNumber}</p>
                      </div>
                      <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-200">
                         <img src={guests[0].nidImageUrl} className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>

                {/* Guest 2 (If applicable) */}
                {!room.id.includes('single') ? (
                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><UserPlus size={16} className="text-hotel-primary"/> Guest 2 (Identity Required)</h4>
                      <div className="space-y-4">
                         <input 
                            placeholder="Companion Legal Name" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary" 
                            value={guests[1].legalName}
                            onChange={e => handleGuestChange(1, 'legalName', e.target.value)}
                         />
                         <input 
                            placeholder="Companion NID Number" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-hotel-primary font-mono" 
                            value={guests[1].nidNumber}
                            onChange={e => handleGuestChange(1, 'nidNumber', e.target.value.replace(/\D/g, ''))}
                         />
                         <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${guests[1].nidImageUrl ? 'border-green-200 bg-green-50/20' : 'border-gray-100 bg-gray-50 hover:border-hotel-primary/30'}`}>
                            <input type="file" accept="image/*" onChange={e => handleNidUpload(1, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {guests[1].nidImageUrl ? (
                               <div className="flex items-center gap-4">
                                  <img src={guests[1].nidImageUrl} className="w-16 h-10 rounded-lg object-cover border-2 border-white shadow-md" />
                                  <p className="text-[10px] font-black text-green-600 uppercase">NID Attached</p>
                               </div>
                            ) : (
                               <div className="text-center">
                                  {uploadingGuestIndex === 1 ? <Loader2 className="animate-spin text-hotel-primary mx-auto" size={16}/> : <Camera size={16} className="text-gray-300 mx-auto mb-1" />}
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Attach Companion NID</p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                ) : (
                  <div className="flex items-center justify-center h-full opacity-40">
                     <div className="text-center">
                        <IdCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deluxe Single Policy<br/>Maximum 1 Occupant</p>
                     </div>
                  </div>
                )}
             </div>
           )}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all">Back</button>
           )}
           {step === 1 ? (
             <button 
                onClick={() => setStep(2)} 
                disabled={!isStep1Valid}
                className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
             >
                Verify Identities <ArrowRight size={18} />
             </button>
           ) : (
             <button 
                onClick={submitBooking}
                disabled={loading || !isStep2Valid}
                className="flex-1 bg-hotel-primary text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-red-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all"
             >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={18}/> Authorize Reservation</>}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

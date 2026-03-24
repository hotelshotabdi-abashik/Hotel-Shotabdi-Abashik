
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, Users, ShieldCheck, Loader2, CheckCircle2, 
  Camera, IdCard, Info, AlertTriangle, ArrowRight, UserPlus,
  Clock, User as UserIcon, Phone, MessageSquare, PhoneCall,
  ChevronRight, Maximize2
} from 'lucide-react';
import { rtdb as db, ref, onValue, rtdbQuery, orderByChild, equalTo, set } from '../services/firebase';
import { sendGuestEmail, notifyOwnerOfBooking } from '../services/emailService';
import { Room, UserProfile, GuestInfo, Booking, BookingMode } from '../types';
import { translations } from '../translations';

interface Props {
  room: Room;
  profile: UserProfile;
  activeDiscount: number;
  onClose: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageDelete?: (imageUrl: string) => Promise<boolean>;
}

const BookingModal: React.FC<Props> = ({ room, profile, activeDiscount, onClose, onImageUpload, onImageDelete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeNumberChoice, setActiveNumberChoice] = useState<string | null>(null);
  const [hasExistingPending, setHasExistingPending] = useState(false);
  
  // Get language from context or parent if needed, but for now we'll use a simple detection
  // or just default to EN as the translations are available
  const language = (window as any).__APP_LANGUAGE__ || 'EN';
  const t = translations[language as keyof typeof translations] || translations.EN;

  const contactNumbers = [
    { value: "+880 1717-425702", clean: "8801717425702" },
    { value: "+880 1334-935566", clean: "8801334935566" }
  ];

  const isProfileComplete = !!(profile.legalName && profile.phone && profile.nidNumber);

  useEffect(() => {
    if (!profile.uid) return;
    const bookingsRef = ref(db, 'bookings');
    const q = rtdbQuery(bookingsRef, orderByChild('userId'), equalTo(profile.uid));
    const unsub = onValue(q, (snap) => {
      let hasPending = false;
      snap.forEach(child => {
        if (child.val().status === 'pending') {
          hasPending = true;
        }
      });
      setHasExistingPending(hasPending);
    }, (err) => {
      console.error("Booking check error:", err);
    });
    return () => unsub();
  }, [profile.uid]);

  const finalPrice = room.discountPrice || room.price || t.priceOnRequest;

  const initiateCallBooking = async () => {
    if (!isProfileComplete) {
      alert(t.identityIncomplete || "Please complete your profile first.");
      return;
    }
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
        userName: profile.legalName || profile.username || 'Resident',
        userEmail: profile.email,
        roomTitle: room.title,
        roomId: room.id,
        checkIn: 'TBD (Call)',
        checkOut: 'TBD (Call)',
        totalGuests: room.capacity || 1,
        guests: [
          { 
            legalName: profile.legalName || '', 
            age: profile.age || '', 
            nidNumber: profile.nidNumber || '', 
            phone: profile.phone || '', 
            guardianName: profile.guardianName || '',
            guardianPhone: profile.guardianPhone || '',
            nidImageUrl: profile.nidImageUrl || '' 
          }
        ],
        price: finalPrice,
        status: 'pending',
        bookingMode: 'direct_call',
        hasEdited: false,
        createdAt: Date.now()
      };
      await set(ref(db, `bookings/${bookingId}`), bookingData);
      await set(ref(db, `user_registry/${profile.uid}/bookings/${bookingId}`), bookingData);
      
      try {
        notifyOwnerOfBooking(bookingData);
      } catch (e) {
        console.warn("Notification failed but booking saved", e);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      alert("System registry error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        
        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20 animate-fade-in">
          
          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-16 text-center bg-white overflow-y-auto no-scrollbar">
               <div className="w-20 h-20 bg-green-500 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-100 animate-bounce">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-2xl md:text-4xl font-serif font-black text-gray-900 tracking-tighter mb-4 px-4">{language === 'EN' ? 'Request Logged' : 'অনুরোধ নথিভুক্ত করা হয়েছে'}</h2>
               <p className="text-gray-500 text-xs md:text-base max-w-md mx-auto leading-relaxed mb-10 font-medium italic">
                 {language === 'EN' 
                   ? `Your interest in ${room.title} has been notified to our reception. Please call us now to finalize your stay.`
                   : `${room.title}-এর প্রতি আপনার আগ্রহ আমাদের রিসেপশনে জানানো হয়েছে। আপনার অবস্থান নিশ্চিত করতে দয়া করে এখনই আমাদের কল করুন।`}
               </p>

               <div className="w-full max-w-md space-y-4">
                  {contactNumbers.map((num) => (
                     <div key={num.value} className="relative">
                        <button 
                          onClick={() => setActiveNumberChoice(activeNumberChoice === num.value ? null : num.value)}
                          className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group active:scale-95 ${activeNumberChoice === num.value ? 'bg-hotel-primary border-hotel-primary text-white shadow-xl shadow-red-100' : 'bg-gray-50 border-gray-100 text-gray-900 hover:bg-white hover:border-hotel-primary/30'}`}
                        >
                           <div className="flex items-center gap-4">
                              <Phone size={20} className={activeNumberChoice === num.value ? 'text-white' : 'text-hotel-primary'} />
                              <span className="text-sm md:text-lg font-black tracking-tight">{num.value}</span>
                           </div>
                           <ChevronRight size={20} className={`transition-transform duration-300 ${activeNumberChoice === num.value ? 'rotate-90' : ''}`} />
                        </button>

                        {activeNumberChoice === num.value && (
                          <div className="flex gap-3 mt-3 animate-fade-in">
                             <a href={`tel:${num.clean}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                <PhoneCall size={16} /> {language === 'EN' ? 'Direct Call' : 'সরাসরি কল'}
                             </a>
                             <a href={`https://wa.me/${num.clean}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                <MessageSquare size={16} /> WhatsApp
                             </a>
                          </div>
                        )}
                     </div>
                  ))}
               </div>

               <button onClick={onClose} className="mt-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-hotel-primary transition-colors">
                  {t.backToHome}
               </button>
            </div>
          ) : (
            <>
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                      <PhoneCall size={22} />
                   </div>
                   <div>
                      <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-none">{language === 'EN' ? 'Help Desk Booking' : 'হেল্প ডেস্ক বুকিং'}</h3>
                      <p className="text-[9px] font-black text-hotel-primary uppercase tracking-[0.2em] mt-1.5 font-sans">{room.title} • ৳{finalPrice}/{t.night}</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white rounded-xl text-gray-400 hover:text-hotel-primary transition-all border border-gray-100 shadow-sm active:scale-95"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-white">
                 {hasExistingPending && (
                   <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4 animate-pulse">
                      <ShieldCheck className="text-hotel-primary shrink-0" size={20} />
                      <div>
                         <p className="text-[10px] font-black text-hotel-primary uppercase tracking-widest mb-1">{t.pending}</p>
                         <p className="text-xs text-red-600 font-medium leading-relaxed">
                           {language === 'EN' 
                             ? 'Our policy permits only one pending booking at a time. Please call us to resolve your current request.'
                             : 'আমাদের নীতি অনুযায়ী একবারে কেবল একটি পেন্ডিং বুকিং অনুমোদিত। আপনার বর্তমান অনুরোধটি সমাধান করতে দয়া করে আমাদের কল করুন।'}
                         </p>
                      </div>
                   </div>
                 )}

                 <div className="space-y-8">
                    <div className="text-center">
                       <h4 className="text-xl md:text-3xl font-serif font-black text-gray-900 tracking-tighter mb-2">{language === 'EN' ? 'Direct Call Reservation' : 'সরাসরি কল রিজার্ভেশন'}</h4>
                       <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{language === 'EN' ? 'Skip the forms and speak with our reception' : 'ফর্ম বাদ দিন এবং আমাদের রিসেপশনের সাথে কথা বলুন'}</p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-left">
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Info size={14} /> {language === 'EN' ? 'How it works' : 'এটি যেভাবে কাজ করে'}
                       </h4>
                       <p className="text-xs text-blue-800 font-medium leading-relaxed">
                         {language === 'EN'
                           ? 'Click the button below to notify our staff of your interest. Then, call any of the numbers provided to finalize your check-in dates and guest details.'
                           : 'আমাদের কর্মীদের আপনার আগ্রহ জানাতে নিচের বাটনে ক্লিক করুন। তারপর, আপনার চেক-ইন তারিখ এবং গেস্ট ডিটেইলস চূড়ান্ত করতে প্রদত্ত নম্বরগুলোর যেকোনো একটিতে কল করুন।'}
                       </p>
                    </div>

                    <div className="space-y-4">
                       <button 
                          onClick={initiateCallBooking}
                          disabled={loading || hasExistingPending}
                          className="w-full bg-gray-900 text-white p-8 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                       >
                          <div className="flex items-center justify-between mb-4">
                             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-hotel-primary transition-all">
                                {loading ? <Loader2 className="animate-spin" size={28} /> : <Phone size={28} />}
                             </div>
                             <ArrowRight className="text-white/20 group-hover:text-white transition-all" />
                          </div>
                          <h5 className="text-xl font-black text-white tracking-tight mb-1">{language === 'EN' ? 'Notify Reception & Call' : 'রিসেপশনকে জানান এবং কল করুন'}</h5>
                          <p className="text-xs text-white/60 font-medium">{language === 'EN' ? 'Log your request and get contact numbers instantly.' : 'আপনার অনুরোধ নথিভুক্ত করুন এবং তাৎক্ষণিকভাবে কন্টাক্ট নম্বর পান।'}</p>
                       </button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default BookingModal;

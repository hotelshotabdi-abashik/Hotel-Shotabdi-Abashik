
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  History, Calendar, Info, ShieldCheck, Download, 
  Eye, Loader2, ArrowRight, X, User, Phone, IdCard, Database, ClipboardCheck,
  CheckCircle2, Printer, MapPin, Clock, Tag, Shield
} from 'lucide-react';
import { db, auth, ref, onValue } from '../services/firebase';
import { Booking, UserProfile } from '../types';
import { LOGO_ICON_URL } from '../constants';

interface MyStaysProps {
  profile: UserProfile | null;
}

const MyStays: React.FC<MyStaysProps> = ({ profile }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const bookingsRef = ref(db, 'bookings');
    const unsub = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Booking[];
        const userStays = data
          .filter(b => b.userId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        setBookings(userStays);
      } else {
        setBookings([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    
    const content = (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 animate-fade-in overflow-hidden print:bg-white print:p-0">
         <div id="print-record" className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col max-h-[100vh] md:max-h-[95vh] border border-white/20 overflow-hidden relative print:block print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
            
            {/* Header for Receipt */}
            <div className="px-8 md:px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0 print:bg-white print:border-black/10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100 print:bg-black print:shadow-none">
                     <ClipboardCheck size={32} />
                  </div>
                  <div>
                     <h2 className="text-2xl md:text-3xl font-serif font-black text-gray-900 tracking-tighter leading-none uppercase">Stay Submission Record</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Database size={12} /> SYNC ID: {selectedBooking.id}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-4 print:hidden">
                 <button onClick={handlePrint} className="p-4 bg-white rounded-2xl text-hotel-primary hover:bg-hotel-primary hover:text-white transition-all shadow-sm border border-gray-100 active:scale-95 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                   <Download size={20}/>
                   <span className="hidden md:inline">Download Record</span>
                 </button>
                 <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                   <X size={24}/>
                 </button>
               </div>
            </div>

            <div id="print-record-scroll" className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar print:overflow-visible">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Summary Sidebar */}
                  <div className="lg:col-span-4 space-y-8 print:col-span-12 print:grid print:grid-cols-2 print:gap-8 print:space-y-0">
                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">Stay Details</h4>
                      <div className="space-y-4">
                         <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Room Type</p>
                           <p className="text-base font-black text-gray-900">{selectedBooking.roomTitle}</p>
                           {selectedBooking.roomNumber && (
                             <div className="mt-3 pt-3 border-t border-gray-200">
                               <p className="text-[9px] font-black text-hotel-primary uppercase tracking-widest mb-1">Assigned Room</p>
                               <p className="text-xl font-black text-gray-900">Room {selectedBooking.roomNumber}</p>
                             </div>
                           )}
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                             <p className="text-xs font-black text-gray-900">{selectedBooking.checkIn}</p>
                           </div>
                           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                             <p className="text-xs font-black text-gray-900">{selectedBooking.checkOut}</p>
                           </div>
                         </div>
                      </div>
                    </section>

                    <div className="space-y-8">
                      <section className="space-y-4">
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">Financial Info</h4>
                        <div className="bg-[#B22222]/5 p-6 rounded-3xl border border-[#B22222]/10 flex items-center justify-between print:bg-gray-50 print:border-black/10">
                           <p className="text-[10px] font-black text-[#B22222] uppercase tracking-widest print:text-black">Grand Total</p>
                           <p className="text-3xl font-serif font-black text-[#B22222] print:text-black">৳{selectedBooking.price}</p>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${selectedBooking.status === 'accepted' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                            {selectedBooking.status === 'accepted' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Registry Status</p>
                              <p className="text-sm font-black uppercase tracking-tight">{selectedBooking.status}</p>
                              {selectedBooking.arrivedAt && (
                                <p className="text-[8px] font-black uppercase mt-1 opacity-70">Entry: {formatTime(selectedBooking.arrivedAt)}</p>
                              )}
                            </div>
                        </div>
                      </section>
                    </div>
                  </div>

                  {/* Identity Records */}
                  <div className="lg:col-span-8 space-y-10 print:col-span-12">
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">Guest Identity Submissions</h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1">
                        {selectedBooking.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col border-l-4 border-l-hotel-primary/20 print:border print:border-black/10 print:rounded-2xl print:page-break-inside-avoid">
                             <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4 print:bg-white">
                                <User size={20} className="text-hotel-primary" />
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Guest {idx + 1}</p>
                                   <h5 className="text-sm font-black text-gray-900 truncate uppercase">{guest.legalName}</h5>
                                </div>
                             </div>
                             <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-[11px] font-black text-gray-600">
                                   <Phone size={14} className="text-hotel-primary" /> {guest.phone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-mono font-black text-gray-900">
                                   <IdCard size={14} className="text-hotel-primary" /> ID: {guest.nidNumber}
                                </div>
                                {guest.nidImageUrl && (
                                   <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col items-center">
                                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-2">Verified ID Copy</p>
                                      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                         <img src={guest.nidImageUrl} className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all print:grayscale-0 print:opacity-100" />
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-10 mt-12 print:border-black/20 print:bg-white print:rounded-2xl print:page-break-inside-avoid">
                        <div>
                           <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Official Registry Seal</h5>
                           <p className="text-[10px] text-gray-400 font-medium max-w-xs leading-relaxed">Verified by Hotel Shotabdi Abashik Registry Portal. Authenticated Digital Record for Resident Identity.</p>
                        </div>
                        <div className="flex gap-10 shrink-0">
                           <div className="text-center">
                              <div className="w-24 h-12 border-b border-gray-900 mb-2 flex items-center justify-center">
                                 <img src={LOGO_ICON_URL} className="w-10 h-10 object-contain opacity-20" />
                              </div>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Registry Vault</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-center print:hidden">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">End of Stay Registry Record</p>
            </div>
         </div>
      </div>
    );
    return createPortal(content, document.body);
  };

  if (!auth.currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-6">
          <History size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Stay History Locked</h2>
        <p className="text-sm text-gray-400 max-w-xs font-medium leading-relaxed">Please authorize your account to view your past stay records and digital identity vault.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Your Vault...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 lg:pb-12 animate-fade-in relative z-10 print:hidden">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 tracking-tighter">My Stay History</h1>
            <p className="text-gray-400 text-xs md:text-lg mt-2 font-light">Access your verified identity submissions and reservation history.</p>
         </div>
         {bookings.length > 0 && (
           <div className="px-6 py-3 bg-hotel-primary/5 rounded-2xl border border-hotel-primary/10 flex items-center gap-3">
              <ShieldCheck size={20} className="text-hotel-primary" />
              <p className="text-[10px] font-black text-hotel-primary uppercase tracking-widest">{bookings.length} Records Synchronized</p>
           </div>
         )}
      </div>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {bookings.map((booking) => (
             <div 
               key={booking.id} 
               onClick={() => setSelectedBooking(booking)}
               className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-500 border-l-8 border-l-hotel-primary/10 hover:border-l-hotel-primary"
             >
                <div className="flex justify-between items-start mb-6">
                   <div className="p-4 bg-gray-50 rounded-2xl text-hotel-primary group-hover:bg-hotel-primary group-hover:text-white transition-colors">
                      {booking.status === 'accepted' ? <ShieldCheck size={24} /> : <Calendar size={24} />}
                   </div>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                     booking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                     booking.status === 'accepted' ? 'bg-green-100 text-green-600' :
                     booking.status === 'rejected' ? 'bg-red-100 text-red-600' :
                     'bg-gray-100 text-gray-400'
                   }`}>
                     {booking.status === 'accepted' ? 'Verified Entry' : booking.status}
                   </span>
                </div>
                
                <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-hotel-primary transition-colors">{booking.roomTitle}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">{booking.checkIn} — {booking.checkOut}</p>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                   <div>
                     <p className="text-xl font-serif font-black text-gray-900">৳{booking.price}</p>
                     {booking.roomNumber && <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Room {booking.roomNumber}</p>}
                   </div>
                   <div className="flex items-center gap-2 text-hotel-primary font-black text-[10px] uppercase tracking-widest">
                      View Record <Eye size={14} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[3rem] p-20 text-center border border-gray-100 border-dashed">
           <History className="mx-auto mb-6 text-gray-300" size={64} />
           <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Vault is Empty</h3>
           <p className="text-sm text-gray-400 mb-10 max-w-sm mx-auto font-medium">You haven't submitted any stay requests yet. Explore our luxury rooms to begin your journey.</p>
           <Link to="/rooms" className="inline-flex items-center gap-3 bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all">
              Browse Rooms <ArrowRight size={16} />
           </Link>
        </div>
      )}

      {renderBookingDetails()}
    </div>
  );
};

export default MyStays;

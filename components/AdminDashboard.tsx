
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus, ShieldAlert,
  MapPin, UserCheck, LogOut, ArrowRight, Info, UserPlus, Database, Download, RefreshCw, Layers, Link2, Tag, FileText, Printer, ClipboardCheck
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile, get } from '../services/firebase';
import { UserProfile, Booking } from '../types';
import { LOGO_ICON_URL } from '../constants';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'data'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Registry verification failed');

  useEffect(() => {
    const profilesRef = ref(db, 'profiles');
    const bookingsRef = ref(db, 'bookings');

    const uUnsub = onValue(profilesRef, (snapshot) => {
      if (snapshot.exists()) setUsers(Object.values(snapshot.val()));
      else setUsers([]);
      setLoading(false);
    });

    const bUnsub = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Booking[];
        setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setBookings([]);
      }
    });

    return () => { uUnsub(); bUnsub(); };
  }, []);

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected', meta?: string) => {
    try {
      const updates: any = {
        status,
        roomNumber: status === 'accepted' ? meta : null,
        rejectionReason: status === 'rejected' ? meta : null
      };

      await update(ref(db, `bookings/${booking.id}`), updates);

      const title = `Stay ${status === 'accepted' ? 'Confirmed' : 'Rejected'}`;
      const message = status === 'accepted' 
        ? `Your booking for ${booking.roomTitle} is confirmed! Room No: ${meta}.` 
        : `Booking rejected: ${meta}. Please update your registry info.`;

      await createNotification(booking.userId, {
        title,
        message,
        type: 'booking_update'
      });

      setAcceptingBookingId(null);
      setRejectingBookingId(null);
      setRoomNumberInput('');
      if (selectedBooking?.id === booking.id) {
         setSelectedBooking({ ...selectedBooking, ...updates });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (bookingId: string, status: 'accepted' | 'completed', timestampField: 'arrivedAt' | 'leftAt') => {
    try {
      const timestamp = Date.now();
      const updates = { status, [timestampField]: timestamp };
      await update(ref(db, `bookings/${bookingId}`), updates);
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, ...updates } as any);
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.roomTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guests?.[0]?.phone?.includes(searchQuery)
  );

  const renderSelectedBooking = () => {
    if (!selectedBooking) return null;
    const content = (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 animate-fade-in overflow-hidden">
         <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[100vh] md:max-h-[90vh] border border-white/20 overflow-hidden relative">
            
            {/* Unified Registry Header */}
            <div className="px-8 md:px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                     <ClipboardCheck size={32} />
                  </div>
                  <div>
                     <h2 className="text-xl md:text-3xl font-serif font-black text-gray-900 tracking-tighter leading-none">Stay Entry Record</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Database size={12} /> ID: {selectedBooking.id}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedBooking(null)} className="p-3 md:p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                   <XCircle size={28}/>
                 </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar bg-white">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Info Sidebar */}
                  <div className="lg:col-span-4 space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                        <Calendar size={16} className="text-hotel-primary"/> Schedule
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                          <p className="text-sm font-black text-gray-900">{selectedBooking.checkIn}</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                          <p className="text-sm font-black text-gray-900">{selectedBooking.checkOut}</p>
                        </div>
                      </div>
                      <div className="bg-hotel-primary/5 p-6 rounded-3xl border border-hotel-primary/10">
                         <p className="text-[9px] font-black text-hotel-primary uppercase tracking-widest mb-1">Room Type</p>
                         <p className="text-xl font-black text-gray-900 leading-tight">{selectedBooking.roomTitle}</p>
                         {selectedBooking.roomNumber && (
                           <div className="mt-4 pt-4 border-t border-hotel-primary/10">
                              <p className="text-[9px] font-black text-hotel-primary uppercase tracking-widest mb-1">Assigned</p>
                              <p className="text-2xl font-black text-gray-900">Room {selectedBooking.roomNumber}</p>
                           </div>
                         )}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                        <Tag size={16} className="text-hotel-primary"/> Financials
                      </h4>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</p>
                         </div>
                         <p className="text-3xl font-serif font-black text-[#B22222]">৳{selectedBooking.price}</p>
                      </div>
                    </section>
                  </div>

                  {/* Main Guest Content */}
                  <div className="lg:col-span-8 space-y-10">
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                       <Users size={16} className="text-hotel-primary"/> Guests ({selectedBooking.totalGuests})
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedBooking.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all border-l-4 border-l-hotel-primary/20">
                             <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm shrink-0 border border-gray-100">
                                   <User size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[9px] font-black text-hotel-primary uppercase tracking-widest">Guest {idx + 1}</p>
                                   <h5 className="text-base font-black text-gray-900 truncate uppercase">{guest.legalName || 'Name Missing'}</h5>
                                </div>
                             </div>
                             
                             <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                   <div className="flex items-center gap-2 text-[11px] font-black text-gray-600">
                                     <Phone size={12} className="text-hotel-primary" /> {guest.phone || 'No Phone'}
                                   </div>
                                   <div className="flex items-center gap-2 text-[11px] font-mono font-black text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                      <IdCard size={12} className="text-hotel-primary" /> ID: {guest.nidNumber || 'MISSING'}
                                   </div>
                                </div>

                                {guest.nidImageUrl && (
                                  <div className="mt-4">
                                     <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-lg aspect-video bg-gray-100">
                                        <img src={guest.nidImageUrl} className="w-full h-full object-cover" alt="ID Registry" />
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    selectedBooking.status === 'accepted' ? 'bg-green-600 text-white' :
                    selectedBooking.status === 'rejected' ? 'bg-red-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    Registry Status: {selectedBooking.status}
                  </div>
               </div>

               <div className="flex gap-4">
                  {selectedBooking.status === 'pending' && (
                    <>
                       <button 
                        onClick={() => { setRejectingBookingId(selectedBooking.id); setSelectedBooking(null); }}
                        className="px-6 md:px-8 py-4 bg-white text-gray-400 hover:text-red-600 border border-gray-200 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all"
                       >
                         Reject
                       </button>
                       <button 
                        onClick={() => { setAcceptingBookingId(selectedBooking.id); setSelectedBooking(null); }}
                        className="px-8 md:px-12 py-4 bg-[#B22222] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
                       >
                         Approve Entry
                       </button>
                    </>
                  )}
                  {selectedBooking.status === 'accepted' && (
                    <button 
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed', 'leftAt')}
                      className="px-12 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                    >
                      Process Check-out
                    </button>
                  )}
               </div>
            </div>
         </div>
      </div>
    );
    return createPortal(content, document.body);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Guest Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 lg:pb-10 animate-fade-in relative z-10 print:hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Management Panel</h1>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {['bookings', 'users', 'data'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab as any); setSearchQuery(''); }} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-md text-[#B22222]' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B22222] transition-colors" size={20} />
        <input type="text" placeholder={`Search ${activeTab}...`} className="w-full bg-white border border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-semibold outline-none focus:border-[#B22222] shadow-xl shadow-gray-100/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="space-y-5">
        {activeTab === 'bookings' && filteredBookings.map(booking => (
          <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:shadow-2xl transition-all duration-500 group relative">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-50 flex items-center justify-center">
                {booking.guests?.[0]?.nidImageUrl ? (
                   <img src={booking.guests[0].nidImageUrl} className="w-full h-full object-cover" />
                ) : (
                   <User className="text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{booking.userName}</h3>
                <p className="text-[9px] font-black text-[#B22222] uppercase tracking-widest">{booking.roomTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end lg:self-center">
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : booking.status === 'accepted' ? 'bg-green-50 text-green-600' : 'text-gray-400'}`}>
                  {booking.status === 'pending' ? 'Review Needed' : booking.status}
                </span>
                <Eye size={20} className="text-gray-300 group-hover:text-hotel-primary transition-colors ml-4" />
            </div>
          </div>
        ))}
      </div>

      {renderSelectedBooking()}

      {acceptingBookingId && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-fade-in relative z-[10000]">
            <h2 className="text-2xl font-serif font-black mb-8 text-center">Assign Room</h2>
            <input autoFocus type="text" placeholder="Room No" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-black text-sm outline-none mb-8 focus:bg-white focus:border-hotel-primary transition-all" value={roomNumberInput} onChange={(e) => setRoomNumberInput(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setAcceptingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Back</button>
              <button disabled={!roomNumberInput} onClick={() => { const b = bookings.find(x => x.id === acceptingBookingId); if (b) handleBookingAction(b, 'accepted', roomNumberInput); }} className="flex-1 bg-[#B22222] text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:brightness-110">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {rejectingBookingId && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-fade-in relative z-[10000]">
            <h2 className="text-2xl font-serif font-black mb-8 text-center">Reject Stay</h2>
            <div className="space-y-4 mb-8">
              {['Identity verification failed', 'Room unavailable', 'Policy violation'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`w-full p-4 rounded-xl text-left text-[10px] font-black uppercase tracking-widest border transition-all ${rejectionReason === reason ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setRejectingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Back</button>
              <button onClick={() => { const b = bookings.find(x => x.id === rejectingBookingId); if (b) handleBookingAction(b, 'rejected', rejectionReason); }} className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:brightness-110">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

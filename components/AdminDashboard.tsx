
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus, ShieldAlert,
  MapPin, UserCheck, LogOut, ArrowRight, Info, UserPlus, Database, Download, RefreshCw, Layers, Link2, Tag
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile, get } from '../services/firebase';
import { UserProfile, Booking } from '../types';
import { LOGO_ICON_URL } from '../constants';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'data'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('NID verification failed');
  
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const profilesRef = ref(db, 'profiles');
    const bookingsRef = ref(db, 'bookings');
    const mediaRef = ref(db, 'media-library');

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

    const mUnsub = onValue(mediaRef, (snapshot) => {
      if (snapshot.exists()) {
        setMediaLibrary(Object.values(snapshot.val()));
      } else {
        setMediaLibrary([]);
      }
    });

    return () => { uUnsub(); bUnsub(); mUnsub(); };
  }, []);

  const sendPushNotification = async (userId: string, title: string, body: string) => {
    try {
      const userProfileRef = ref(db, `profiles/${userId}`);
      const snapshot = await get(userProfileRef);
      if (snapshot.exists() && snapshot.val().fcmToken) {
        const token = snapshot.val().fcmToken;
        console.log(`[Push Trigger] Sending to ${token}: ${title} - ${body}`);
      }
    } catch (e) {
      console.warn("Push trigger failed:", e);
    }
  };

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
        : `Booking rejected: ${meta}. Please update your registry.`;

      await createNotification(booking.userId, {
        title,
        message,
        type: 'booking_update'
      });

      await sendPushNotification(booking.userId, title, message);

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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUserProfile(userToDelete.uid, userToDelete.username);
      setUserToDelete(null);
    } catch (err) {
      console.error("Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredUsers = users.filter(u => 
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.roomTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guests?.[0]?.phone?.includes(searchQuery)
  );

  const renderSelectedBooking = () => {
    if (!selectedBooking) return null;
    const content = (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-hidden">
         <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh] border border-white/20 overflow-hidden relative">
            <div className="px-8 md:px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-hotel-primary/10 rounded-2xl flex items-center justify-center text-hotel-primary shadow-inner">
                     <Building2 size={32} />
                  </div>
                  <div>
                     <h2 className="text-2xl md:text-3xl font-serif font-black text-gray-900 tracking-tighter leading-none">Registry Stay Record</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Database size={12} /> ID: {selectedBooking.id}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                 <XCircle size={28}/>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left Column: Reservation Meta */}
                  <div className="lg:col-span-1 space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                        <Calendar size={16} className="text-hotel-primary"/> Schedule & Room
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                          <p className="text-sm font-black text-gray-900">{selectedBooking.checkIn}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                          <p className="text-sm font-black text-gray-900">{selectedBooking.checkOut}</p>
                        </div>
                      </div>
                      <div className="bg-hotel-primary/5 p-5 rounded-2xl border border-hotel-primary/10">
                         <p className="text-[8px] font-bold text-hotel-primary uppercase tracking-widest mb-1">Requested Category</p>
                         <p className="text-lg font-black text-gray-900 leading-tight">{selectedBooking.roomTitle}</p>
                      </div>
                      {selectedBooking.roomNumber && (
                        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                           <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest mb-1">Assigned Room</p>
                           <p className="text-2xl font-black text-gray-900">Room {selectedBooking.roomNumber}</p>
                        </div>
                      )}
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                        <Tag size={16} className="text-hotel-primary"/> Financials
                      </h4>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agreed Rate</p>
                         <p className="text-xl font-black text-[#B22222]">৳{selectedBooking.price}</p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                        <Clock size={16} className="text-hotel-primary"/> Timeline
                      </h4>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-bold">
                           <span className="text-gray-400 uppercase">Created</span>
                           <span className="text-gray-900">{formatTime(selectedBooking.createdAt)}</span>
                         </div>
                         {selectedBooking.arrivedAt && (
                           <div className="flex justify-between text-[10px] font-bold">
                             <span className="text-green-500 uppercase">Arrival</span>
                             <span className="text-gray-900">{formatTime(selectedBooking.arrivedAt)}</span>
                           </div>
                         )}
                         {selectedBooking.leftAt && (
                           <div className="flex justify-between text-[10px] font-bold">
                             <span className="text-blue-500 uppercase">Departure</span>
                             <span className="text-gray-900">{formatTime(selectedBooking.leftAt)}</span>
                           </div>
                         )}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Guest Registry */}
                  <div className="lg:col-span-2 space-y-8">
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                       <Users size={16} className="text-hotel-primary"/> Verified Guests ({selectedBooking.totalGuests})
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedBooking.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:border-hotel-primary/30 transition-all">
                             <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-300 shadow-sm shrink-0 border border-gray-100">
                                   {/* Fixed missing User import error */}
                                   <User size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[8px] font-black text-hotel-primary uppercase tracking-widest mb-1">Guest {idx + 1}</p>
                                   <h5 className="text-sm font-black text-gray-900 truncate uppercase">{guest.legalName || 'N/A'}</h5>
                                </div>
                             </div>
                             
                             <div className="p-6 space-y-4 flex-1">
                                <div className="grid grid-cols-1 gap-3">
                                   {guest.phone && (
                                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                       <Phone size={12} className="text-gray-400" /> {guest.phone}
                                     </div>
                                   )}
                                   {guest.guardianPhone && (
                                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                       <ShieldCheck size={12} className="text-gray-400" /> Guardian: {guest.guardianPhone}
                                     </div>
                                   )}
                                   {guest.age && (
                                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                       <Calendar size={12} className="text-gray-400" /> Age: {guest.age}
                                     </div>
                                   )}
                                   <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      <IdCard size={12} className="text-gray-400" /> {guest.nidNumber || 'NO NID PROVIDED'}
                                   </div>
                                </div>

                                {guest.nidImageUrl && (
                                  <div className="mt-4 relative group/nid">
                                     <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2">Digital NID Registry</p>
                                     <div className="relative rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg aspect-video bg-gray-100">
                                        <img src={guest.nidImageUrl} className="w-full h-full object-cover" alt="Guest ID" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/nid:opacity-100 transition-opacity flex items-center justify-center">
                                           <a href={guest.nidImageUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                                              <Download size={12} /> Full Resolution
                                           </a>
                                        </div>
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
            
            <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    selectedBooking.status === 'accepted' ? 'bg-green-100 text-green-600' :
                    selectedBooking.status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    Status: {selectedBooking.status}
                  </span>
                  {selectedBooking.rejectionReason && (
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                      Reason: {selectedBooking.rejectionReason}
                    </p>
                  )}
               </div>

               <div className="flex gap-4">
                  {selectedBooking.status === 'pending' && (
                    <>
                       <button 
                        onClick={() => { setSelectedBooking(null); setRejectingBookingId(selectedBooking.id); }}
                        className="px-8 py-4 bg-white text-gray-400 hover:text-red-600 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                       >
                         Reject Stay
                       </button>
                       <button 
                        onClick={() => { setSelectedBooking(null); setAcceptingBookingId(selectedBooking.id); }}
                        className="px-10 py-4 bg-[#B22222] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
                       >
                         Assign & Approve
                       </button>
                    </>
                  )}
                  {selectedBooking.status === 'accepted' && (
                    <button 
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed', 'leftAt')}
                      className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                    >
                      Mark Departure / Complete
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
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Hub...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 lg:pb-10 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Registry Control</h1>
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
        <input type="text" placeholder={`Filter ${activeTab}...`} className="w-full bg-white border border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-semibold outline-none focus:border-[#B22222] shadow-xl shadow-gray-100/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="space-y-5">
        {activeTab === 'bookings' && filteredBookings.map(booking => (
          <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:shadow-2xl transition-all duration-500 group relative">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-50">
                <img src={booking.guests?.[0]?.nidImageUrl || LOGO_ICON_URL} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{booking.userName}</h3>
                <p className="text-[9px] font-black text-[#B22222] uppercase tracking-widest">{booking.roomTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end lg:self-center">
                {booking.status === 'pending' ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setRejectingBookingId(booking.id); }} className="p-4 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-2xl"><XCircle size={22} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setAcceptingBookingId(booking.id); }} className="bg-[#B22222] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 transition-all">Approve Stay</button>
                  </>
                ) : (
                  <span className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'accepted' ? 'text-green-600' : 'text-gray-400'}`}>{booking.status}</span>
                )}
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
              {['NID verification failed', 'Incomplete guest info', 'Room unavailable', 'Policy violation'].map(reason => (
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

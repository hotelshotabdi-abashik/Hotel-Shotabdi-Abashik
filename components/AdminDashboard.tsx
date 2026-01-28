
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus, ShieldAlert,
  MapPin, UserCheck, LogOut, ArrowRight, Info
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile } from '../services/firebase';
import { UserProfile, Booking } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

      const message = status === 'accepted' 
        ? `Your booking for ${booking.roomTitle} is confirmed! Room No: ${meta}.` 
        : `Booking rejected: ${meta}. Please update your registry.`;

      await createNotification(booking.userId, {
        title: `Stay ${status === 'accepted' ? 'Confirmed' : 'Rejected'}`,
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
      const updates = {
        status,
        [timestampField]: timestamp
      };
      await update(ref(db, `bookings/${bookingId}`), updates);
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, ...updates });
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Hub...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 lg:pb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Registry Control</h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">Residential Authority Panel</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {['bookings', 'users'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab as any); setSearchQuery(''); }} 
              className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-md text-[#B22222]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab} {tab === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-2 bg-[#B22222] text-white px-2 py-0.5 rounded-full text-[7px] animate-pulse">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B22222] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={`Filter ${activeTab} by name, phone...`} 
          className="w-full bg-white border border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-semibold outline-none focus:border-[#B22222] shadow-xl shadow-gray-100/50 transition-all" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      <div className="space-y-5">
        {activeTab === 'users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div key={user.uid} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-gray-100">
                    <img src={user.photoURL} className="w-full h-full object-cover" alt={user.legalName} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-none">{user.legalName}</h3>
                    <p className="text-[10px] font-bold text-[#B22222] mt-1.5">@{user.username}</p>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5 uppercase tracking-widest">{user.phone || 'No Phone'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 z-10">
                  <button onClick={() => setSelectedUser(user)} className="p-3 text-gray-400 hover:text-[#B22222] transition-colors bg-gray-50 rounded-xl"><Eye size={18} /></button>
                  <button onClick={() => setUserToDelete(user)} className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map(booking => (
              <div 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className={`bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:shadow-2xl hover:border-[#B22222]/10 transition-all duration-500 group relative ${booking.status === 'pending' ? 'ring-1 ring-[#B22222]/10 shadow-xl' : 'opacity-90'}`}
              >
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl ring-1 ring-gray-100 bg-gray-50">
                      <img src={booking.guests?.[0]?.nidImageUrl || `https://ui-avatars.com/api/?name=${booking.userName}&background=f8f8f8&color=B22222`} className="w-full h-full object-cover" alt="Guest" />
                    </div>
                    {booking.status === 'accepted' && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[13px] md:text-base font-black text-gray-900 leading-tight">{booking.userName}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : (booking.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5"><Phone size={10} className="text-[#B22222]" /> {booking.guests?.[0]?.phone || 'Unknown'}</p>
                      <p className="text-[9px] font-black text-[#B22222] uppercase tracking-widest">{booking.roomTitle} {booking.roomNumber && <span className="bg-[#B22222] text-white px-1.5 rounded-sm ml-1">#{booking.roomNumber}</span>}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center">
                    {booking.status === 'pending' ? (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRejectingBookingId(booking.id); }} 
                          className="p-4 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-2xl"
                        >
                          <XCircle size={22} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAcceptingBookingId(booking.id); }} 
                          className="bg-[#B22222] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 transition-all"
                        >
                          Approve Stay
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                         {!booking.arrivedAt && booking.status === 'accepted' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, 'accepted', 'arrivedAt'); }}
                              className="bg-green-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2"
                            >
                              <UserCheck size={14} /> Mark Arrived
                            </button>
                         )}
                         {booking.arrivedAt && !booking.leftAt && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, 'completed', 'leftAt'); }}
                             className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                           >
                             <LogOut size={14} /> Mark Left
                           </button>
                         )}
                         <div className="w-12 h-12 flex items-center justify-center text-gray-300 bg-gray-50 rounded-2xl">
                            <Eye size={20} />
                         </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HIGH Z-INDEX ADMIN POPUPS (Overlay everything) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] flex flex-col border border-white/20 max-h-[92vh] overflow-hidden">
              <div className="px-8 md:px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#B22222]/10 rounded-2xl flex items-center justify-center text-[#B22222]">
                       <Building2 size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tighter">Stay Record Overview</h2>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{selectedBooking.status}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {selectedBooking.id}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-[#B22222] transition-all shadow-sm border border-gray-100 active:scale-95">
                   <XCircle size={24}/>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-50 pb-2">Logistics</h4>
                         <div className="grid grid-cols-1 gap-3">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                               <p className="text-[8px] font-black text-gray-400 uppercase">Unit</p>
                               <p className="text-sm font-black text-gray-900">{selectedBooking.roomTitle}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                               <p className="text-[8px] font-black text-gray-400 uppercase">Room No.</p>
                               <p className="text-sm font-black text-[#B22222]">{selectedBooking.roomNumber || 'N/A'}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-50 pb-2">Audits</h4>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl">
                               <Clock size={14} className="text-blue-600" />
                               <p className="text-[10px] font-bold text-blue-900">Booked: {formatTime(selectedBooking.createdAt)}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-2 space-y-12">
                      {selectedBooking.guests.map((guest, idx) => guest.legalName && (
                         <div key={idx} className="space-y-6">
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{idx === 0 ? 'Primary' : 'Companion'} Registry</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                               <div className="space-y-4">
                                  <p className="text-sm font-black text-gray-900">{guest.legalName}</p>
                                  <p className="text-xs font-mono font-black text-[#B22222]">{guest.nidNumber}</p>
                                  <p className="text-xs font-bold text-gray-500">{guest.phone}</p>
                               </div>
                               <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-200 aspect-video">
                                  <img src={guest.nidImageUrl} className="w-full h-full object-cover" />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                 <button onClick={() => setSelectedBooking(null)} className="px-10 py-5 bg-white border border-gray-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all">Dismiss Panel</button>
              </div>
           </div>
        </div>
      )}

      {acceptingBookingId && (
        <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-serif font-black mb-8 text-center">Assign Room</h2>
            <input autoFocus type="text" placeholder="Room No (e.g. 104)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-black text-sm outline-none mb-8" value={roomNumberInput} onChange={(e) => setRoomNumberInput(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setAcceptingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Back</button>
              <button disabled={!roomNumberInput} onClick={() => { const b = bookings.find(x => x.id === acceptingBookingId); if (b) handleBookingAction(b, 'accepted', roomNumberInput); }} className="flex-1 bg-[#B22222] text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
              <h3 className="text-2xl font-serif font-black mb-2">Ban Resident?</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-8">Permanently erase <strong>{userToDelete.legalName}</strong> from the hub.</p>
              <div className="flex gap-4">
                 <button onClick={() => setUserToDelete(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400">Cancel</button>
                 <button onClick={handleDeleteUser} disabled={deleting} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl">
                    {deleting ? <Loader2 className="animate-spin" size={16}/> : 'Confirm Ban'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

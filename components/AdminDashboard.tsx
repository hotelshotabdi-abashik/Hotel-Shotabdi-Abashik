
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
          placeholder={`Filter ${activeTab} by name, phone, or room...`} 
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

                <div className="flex items-center gap-8 lg:gap-12 px-2">
                   <div className="flex flex-col items-center">
                     <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                     <p className="text-[11px] font-black text-gray-700">{booking.checkIn}</p>
                   </div>
                   <div className="flex flex-col items-center">
                     <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                     <p className="text-[11px] font-black text-gray-700">{booking.checkOut}</p>
                   </div>
                   <div className="hidden md:flex flex-col items-center">
                     <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Guests</p>
                     <p className="text-[11px] font-black text-[#B22222]">{booking.totalGuests}</p>
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
                          className="bg-[#B22222] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:scale-105 active:scale-95 transition-all"
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

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] flex flex-col border border-white/20 my-10 overflow-hidden">
              <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#B22222]/10 rounded-3xl flex items-center justify-center text-[#B22222]">
                       <Building2 size={32} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-serif font-black text-gray-900 tracking-tighter">Stay Record Overview</h2>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {selectedBooking.status}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {selectedBooking.id}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100"><XCircle size={24}/></button>
              </div>

              <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                 {/* Column 1: Core Details */}
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Booking Info</h4>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="bg-gray-50 p-4 rounded-2xl">
                             <p className="text-[8px] font-black text-gray-400 uppercase">Category</p>
                             <p className="text-sm font-black text-gray-900">{selectedBooking.roomTitle}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl">
                             <p className="text-[8px] font-black text-gray-400 uppercase">Room Number</p>
                             <p className="text-sm font-black text-[#B22222]">{selectedBooking.roomNumber || 'Not Assigned'}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl">
                             <p className="text-[8px] font-black text-gray-400 uppercase">Total Bill</p>
                             <p className="text-sm font-black text-gray-900">৳{selectedBooking.price}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Temporal Logs</h4>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl">
                             <Clock size={14} className="text-blue-600" />
                             <div>
                                <p className="text-[8px] font-black text-blue-400 uppercase">Requested On</p>
                                <p className="text-[10px] font-bold text-blue-900">{formatTime(selectedBooking.createdAt)}</p>
                             </div>
                          </div>
                          {selectedBooking.arrivedAt && (
                            <div className="flex items-center gap-3 bg-green-50/50 p-3 rounded-xl">
                               <UserCheck size={14} className="text-green-600" />
                               <div>
                                  <p className="text-[8px] font-black text-green-400 uppercase">Arrival Log</p>
                                  <p className="text-[10px] font-bold text-green-900">{formatTime(selectedBooking.arrivedAt)}</p>
                               </div>
                            </div>
                          )}
                          {selectedBooking.leftAt && (
                            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl">
                               <LogOut size={14} className="text-gray-600" />
                               <div>
                                  <p className="text-[8px] font-black text-gray-400 uppercase">Departure Log</p>
                                  <p className="text-[10px] font-bold text-gray-900">{formatTime(selectedBooking.leftAt)}</p>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Column 2 & 3: Guest Identity Registry */}
                 <div className="lg:col-span-2 space-y-10">
                    {selectedBooking.guests.map((guest, idx) => guest.legalName && (
                       <div key={idx} className="space-y-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-[#B22222] text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                             <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Guest Identity: {idx === 0 ? 'Primary' : 'Companion'}</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                             <div className="space-y-5">
                                <div>
                                   <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Legal Name</p>
                                   <p className="text-sm font-black text-gray-900">{guest.legalName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Age</p>
                                      <p className="text-xs font-bold">{guest.age || 'N/A'}</p>
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">NID No.</p>
                                      <p className="text-xs font-mono font-black text-[#B22222]">{guest.nidNumber}</p>
                                   </div>
                                </div>
                                <div className="space-y-3">
                                   <a href={`tel:${guest.phone}`} className="flex items-center gap-2 text-[10px] font-black text-[#B22222] hover:underline">
                                      <Phone size={12}/> Phone: {guest.phone}
                                   </a>
                                   <a href={`tel:${guest.guardianPhone}`} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:underline">
                                      <ShieldCheck size={12}/> Guardian: {guest.guardianPhone}
                                   </a>
                                </div>
                             </div>
                             <div className="space-y-3">
                                <p className="text-[9px] font-black text-gray-400 uppercase">Government ID Scan</p>
                                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-200 aspect-video group">
                                   <img src={guest.nidImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="NID Scan" />
                                   <a href={guest.nidImageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="text-white" size={32} />
                                   </a>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4">
                 <button onClick={() => setSelectedBooking(null)} className="px-10 py-5 bg-white border border-gray-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">Close Entry</button>
                 <div className="flex-1"></div>
                 {selectedBooking.status === 'pending' && (
                   <>
                      <button onClick={() => setRejectingBookingId(selectedBooking.id)} className="px-8 py-5 rounded-[2rem] border border-red-100 text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-50">Reject Entry</button>
                      <button onClick={() => setAcceptingBookingId(selectedBooking.id)} className="px-12 py-5 bg-[#B22222] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-red-100">Confirm Reservation</button>
                   </>
                 )}
                 {selectedBooking.status === 'accepted' && (
                    <div className="flex gap-4">
                       {!selectedBooking.arrivedAt && (
                          <button onClick={() => handleStatusChange(selectedBooking.id, 'accepted', 'arrivedAt')} className="px-12 py-5 bg-green-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-green-100 flex items-center gap-3">
                             <UserCheck size={18} /> Confirm Arrival
                          </button>
                       )}
                       {!selectedBooking.leftAt && (
                          <button onClick={() => handleStatusChange(selectedBooking.id, 'completed', 'leftAt')} className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                             <LogOut size={18} /> Confirm Departure
                          </button>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Existing Assignment Modals */}
      {acceptingBookingId && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-serif font-black mb-1 text-center">Assign Room</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-8 text-center tracking-widest">Final Registry Verification</p>
            <div className="relative mb-8">
               <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B22222]" size={18} />
               <input autoFocus type="text" placeholder="Room No (e.g. 104)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-6 font-black text-sm outline-none shadow-inner focus:bg-white focus:border-[#B22222] transition-all" value={roomNumberInput} onChange={(e) => setRoomNumberInput(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setAcceptingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Back</button>
              <button disabled={!roomNumberInput} onClick={() => { const b = bookings.find(x => x.id === acceptingBookingId); if (b) handleBookingAction(b, 'accepted', roomNumberInput); }} className="flex-1 bg-[#B22222] text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2">Proceed <ArrowRight size={14}/></button>
            </div>
          </div>
        </div>
      )}

      {rejectingBookingId && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-serif font-black mb-1 text-center">Decline Registry</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-8 text-center tracking-widest">Select Authority Reason</p>
            <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 text-xs font-bold outline-none appearance-none cursor-pointer" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}>
               <option>Identity registry mismatch</option>
               <option>Invalid NID scan quality</option>
               <option>Requested category sold out</option>
               <option>Security policy violation</option>
               <option>Suspicious user history</option>
            </select>
            <div className="flex gap-4">
              <button onClick={() => setRejectingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Cancel</button>
              <button onClick={() => { const b = bookings.find(x => x.id === rejectingBookingId); if (b) handleBookingAction(b, 'rejected', rejectionReason); }} className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* User Record Detail */}
      {selectedUser && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-5">
                <img src={selectedUser.photoURL} className="w-14 h-14 rounded-2xl border-2 border-white shadow-md" alt="User" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedUser.legalName}</h3>
                  <p className="text-[9px] font-black text-[#B22222] uppercase tracking-[0.2em]">Authority Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-gray-50 p-4 rounded-2xl">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Registry NID</p>
                   <p className="text-sm font-mono font-black text-gray-700">{selectedUser.nidNumber}</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Age</p>
                   <p className="text-sm font-black text-gray-700">{selectedUser.age || 'N/A'}</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Registry</p>
                 <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl aspect-video bg-gray-100">
                    <img src={selectedUser.nidImageUrl} className="w-full h-full object-cover" alt="NID Document" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-serif font-black mb-2">Ban Resident?</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-8">This will permanently erase <strong>{userToDelete.legalName}</strong> from the residential hub and revoke all access.</p>
              <div className="flex gap-4">
                 <button onClick={() => setUserToDelete(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400">Cancel</button>
                 <button onClick={handleDeleteUser} disabled={deleting} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center">
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

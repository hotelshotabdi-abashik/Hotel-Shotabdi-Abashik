
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus, ShieldAlert,
  MapPin, UserCheck, LogOut, ArrowRight, Info, UserPlus, Database, Download, RefreshCw, Layers, Link2, Tag, FileText, Printer, ClipboardCheck, Key, Shield, X, Maximize2, UserCog, MoreHorizontal
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile, get, set, OWNER_EMAIL, auth } from '../services/firebase';
import { sendGuestEmail } from '../services/emailService';
import { UserProfile, Booking } from '../types';

const AdminDashboard: React.FC = () => {
  const currentUser = auth.currentUser;
  const isOwner = currentUser?.email === OWNER_EMAIL;
  
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'data'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Registry verification failed');
  const [actionLoading, setActionLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Manager Role State
  const [managerGateUid, setManagerGateUid] = useState<string | null>(null);
  const [managerPassword, setManagerPassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [roleUpdatingUid, setRoleUpdatingUid] = useState<string | null>(null);

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

  const triggerRoleNotification = async (uid: string, newRole: string) => {
    const targetUser = users.find(u => u.uid === uid);
    if (!targetUser) return;

    const roleName = newRole.toUpperCase();
    const message = `Your account access level has been updated to: ${roleName}. This change is effective immediately for the Hotel Shotabdi Residential Hub.`;

    // 1. Internal Notification
    await createNotification(uid, {
      title: 'Registry Access Updated',
      message: message,
      type: 'system'
    });

    // 2. EmailJS Notification
    sendGuestEmail({
      to_name: targetUser.legalName || 'Resident',
      to_email: targetUser.email,
      subject: `Registry Status: Account Role Updated to ${roleName}`,
      message: message,
      booking_id: "ROLE-AUTH"
    });
  };

  const handleUpdateRole = async (uid: string, newRole: 'guest' | 'staff' | 'manager') => {
    if (!isOwner && newRole === 'manager') {
       alert("Access Denied: Only the Owner can authorize Managers.");
       return;
    }
    
    setRoleUpdatingUid(uid);
    try {
      await update(ref(db), {
        [`roles/${uid}`]: newRole,
        [`profiles/${uid}/role`]: newRole
      });
      
      await triggerRoleNotification(uid, newRole);
      
    } catch (err) {
      alert("Role update failed. Connection error.");
    } finally {
      setRoleUpdatingUid(null);
    }
  };

  const handleMakeManager = async () => {
    if (managerPassword !== 'kahar02') {
      setGateError('Unauthorized Access Code');
      return;
    }
    if (!managerGateUid) return;

    try {
      await update(ref(db), {
        [`roles/${managerGateUid}`]: 'manager',
        [`profiles/${managerGateUid}/role`]: 'manager'
      });
      
      await triggerRoleNotification(managerGateUid, 'manager');
      
      alert("Role Authorized: User is now a Manager.");
      setManagerGateUid(null);
      setManagerPassword('');
      setGateError('');
    } catch (err) {
      alert("Authorization failed.");
    }
  };

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected', meta?: string) => {
    setActionLoading(true);
    try {
      const updates: any = {
        status,
        roomNumber: status === 'accepted' ? meta : null,
        rejectionReason: status === 'rejected' ? meta : null
      };

      await update(ref(db, `bookings/${booking.id}`), updates);

      const message = status === 'accepted' 
        ? `Your booking for ${booking.roomTitle} is confirmed! Room No: ${meta}. Please proceed to the hotel for check-in.` 
        : `Booking rejected: ${meta}. Please check your registry details and resubmit if necessary.`;

      await createNotification(booking.userId, {
        title: `Stay ${status === 'accepted' ? 'Confirmed' : 'Rejected'}`,
        message,
        type: 'booking_update'
      });

      sendGuestEmail({
        to_name: booking.userName,
        to_email: booking.userEmail,
        subject: status === 'accepted' ? "Stay Verified - Hotel Shotabdi Residential" : "Registry Update Required",
        message: message,
        booking_id: booking.id
      });

      setSelectedBooking(null);
      setRoomNumberInput('');
      setRejectionReason('Registry verification failed');
    } catch (err) { 
      console.error(err);
      alert("Action failed. Check database connection.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Master Data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 lg:pb-10 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Registry Control</h1>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Authenticated Management Access</p>
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
          <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-2xl transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-50 flex items-center justify-center">
                {booking.guests?.[0]?.nidImageUrl ? <img src={booking.guests[0].nidImageUrl} className="w-full h-full object-cover" /> : <User className="text-gray-300" />}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{booking.userName}</h3>
                <p className="text-[9px] font-black text-[#B22222] uppercase tracking-widest">{booking.roomTitle}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{booking.checkIn} to {booking.checkOut}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                 booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                 booking.status === 'accepted' ? 'bg-green-50 text-green-600' :
                 'bg-red-50 text-red-600'
               }`}>
                 {booking.status}
               </span>
               <Eye size={20} className="text-gray-300 group-hover:text-hotel-primary" />
            </div>
          </div>
        ))}

        {activeTab === 'users' && filteredUsers.map(user => (
          <div key={user.uid} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between group overflow-hidden">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.legalName} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-gray-900 truncate">{user.legalName || 'New Resident'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                     user.role === 'owner' ? 'bg-hotel-primary text-white border-hotel-primary' :
                     user.role === 'manager' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                     user.role === 'staff' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                     'bg-gray-50 text-gray-500 border-gray-100'
                   }`}>
                     {user.role || 'guest'}
                   </span>
                   <span className="text-[9px] font-bold text-gray-400 truncate opacity-60">ID: {user.uid.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {isOwner && user.role !== 'owner' ? (
                 <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100 gap-1">
                    <button 
                      onClick={() => handleUpdateRole(user.uid, 'guest')}
                      disabled={roleUpdatingUid === user.uid}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${user.role === 'guest' || !user.role ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Guest
                    </button>
                    <button 
                      onClick={() => handleUpdateRole(user.uid, 'staff')}
                      disabled={roleUpdatingUid === user.uid}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${user.role === 'staff' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Staff
                    </button>
                    <button 
                      onClick={() => setManagerGateUid(user.uid)}
                      disabled={roleUpdatingUid === user.uid}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${user.role === 'manager' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Manager
                    </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-2">
                    {user.role === 'owner' && <span className="text-[9px] font-black text-hotel-primary uppercase tracking-widest flex items-center gap-1.5 pr-4"><Key size={12}/> Owner</span>}
                    {user.role === 'manager' && !isOwner && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 pr-4"><Shield size={12}/> Manager</span>}
                 </div>
               )}
               
               {roleUpdatingUid === user.uid && <Loader2 className="animate-spin text-hotel-primary" size={16} />}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Details Modal - Restoring all guest info */}
      {selectedBooking && createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-none md:rounded-[3rem] shadow-2xl flex flex-col max-h-[100vh] md:max-h-[95vh] border border-white/20 overflow-hidden relative">
            
            <div className="px-6 md:px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                     <ClipboardCheck size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl md:text-2xl font-serif font-black text-gray-900 tracking-tighter leading-none uppercase">Submission Audit</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Database size={12} /> Registry ID: {selectedBooking.id}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                 <X size={24}/>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                     <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={12} className="text-hotel-primary" /> Stay Request</h4>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Room Category</p>
                              <p className="text-lg font-black text-gray-900">{selectedBooking.roomTitle}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Check In</p>
                                 <p className="text-xs font-black text-gray-800">{selectedBooking.checkIn}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Check Out</p>
                                 <p className="text-xs font-black text-gray-800">{selectedBooking.checkOut}</p>
                              </div>
                           </div>
                           <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                              <p className="text-[10px] font-black text-hotel-primary uppercase tracking-widest">Total Price</p>
                              <p className="text-xl font-sans font-black text-gray-900 tracking-tighter">৳{selectedBooking.price}</p>
                           </div>
                        </div>
                     </section>

                     <section className="bg-white p-6 rounded-[2rem] border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><UserCheck size={12} className="text-hotel-primary" /> Submitter Info</h4>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-xs font-bold text-gray-600 truncate">{selectedBooking.userEmail}</span>
                           </div>
                           <p className="text-[10px] text-gray-400 font-medium italic">Applied on {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                        </div>
                     </section>

                     {selectedBooking.status === 'pending' && (
                       <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4">
                          <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Registry Action</h4>
                          <div className="space-y-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">Assign Room No</label>
                                <input 
                                  placeholder="e.g. 302"
                                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-hotel-primary"
                                  value={roomNumberInput}
                                  onChange={e => setRoomNumberInput(e.target.value)}
                                />
                             </div>
                             <button 
                               onClick={() => handleBookingAction(selectedBooking, 'accepted', roomNumberInput)}
                               disabled={!roomNumberInput || actionLoading}
                               className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                             >
                               {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Verify & Accept</>}
                             </button>
                             <div className="h-[1px] bg-amber-200"></div>
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">Rejection Reason</label>
                                <textarea 
                                  placeholder="Reason..."
                                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs font-bold outline-none resize-none h-20"
                                  value={rejectionReason}
                                  onChange={e => setRejectionReason(e.target.value)}
                                />
                             </div>
                             <button 
                               onClick={() => handleBookingAction(selectedBooking, 'rejected', rejectionReason)}
                               disabled={actionLoading}
                               className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                             >
                               Reject Submission
                             </button>
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                        <Users size={16} className="text-hotel-primary" /> Submitted Guest Identities ({selectedBooking.totalGuests})
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedBooking.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-hotel-primary/30 transition-all">
                             <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-primary shadow-sm">
                                   <User size={20} />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Guest {idx + 1}</p>
                                   <h5 className="text-sm font-black text-gray-900 truncate uppercase">{guest.legalName}</h5>
                                </div>
                             </div>
                             <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="flex items-center gap-2 text-[11px] font-black text-gray-600">
                                      <Phone size={14} className="text-hotel-primary" /> {guest.phone || 'No Phone'}
                                   </div>
                                   <div className="flex items-center gap-2 text-[11px] font-black text-gray-600">
                                      <Calendar size={14} className="text-hotel-primary" /> Age: {guest.age || 'N/A'}
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-mono font-black text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                   <IdCard size={14} className="text-hotel-primary" /> NID: {guest.nidNumber || 'UNSUBMITTED'}
                                </div>
                                {guest.nidImageUrl ? (
                                   <div className="mt-4">
                                      <div 
                                        onClick={() => setLightboxUrl(guest.nidImageUrl)}
                                        className="w-full aspect-video rounded-[1.5rem] overflow-hidden shadow-md border-2 border-white bg-gray-100 relative group cursor-zoom-in"
                                      >
                                         <img src={guest.nidImageUrl} className="w-full h-full object-contain" />
                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={24} />
                                         </div>
                                         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black uppercase shadow-sm">Digital Document</div>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="p-8 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-center opacity-40">
                                      <AlertTriangle className="mx-auto mb-2 text-gray-300" size={24} />
                                      <p className="text-[9px] font-black uppercase">Document Waived</p>
                                   </div>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-center shrink-0">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Hotel Shotabdi Residential • Registry Hub</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-10 right-10 text-white/60 hover:text-white p-4 transition-colors">
            <X size={32} />
          </button>
          <img src={lightboxUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="Document Full View" />
        </div>
      )}

      {/* Role Gate Modal */}
      {managerGateUid && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-fade-in">
              <div className="w-16 h-16 bg-hotel-primary/10 text-hotel-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-serif font-black mb-2">Security Gate</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Enter Master Admin Key</p>
              <input 
                type="password" 
                autoFocus
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 font-black text-center text-lg outline-none mb-4 focus:border-hotel-primary"
                value={managerPassword}
                onChange={e => setManagerPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMakeManager()}
              />
              {gateError && <p className="text-[9px] text-hotel-primary font-black uppercase mb-4">{gateError}</p>}
              <div className="flex gap-4">
                 <button onClick={() => {setManagerGateUid(null); setManagerPassword('');}} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Cancel</button>
                 <button onClick={handleMakeManager} className="flex-1 bg-hotel-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Verify</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

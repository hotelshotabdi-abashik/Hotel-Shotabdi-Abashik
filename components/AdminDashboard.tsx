
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus, ShieldAlert,
  MapPin, UserCheck, LogOut, ArrowRight, Info, UserPlus, Database, Download, RefreshCw, Layers, Link2, Tag, FileText, Printer, ClipboardCheck, Key, Shield
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile, get, set, OWNER_EMAIL } from '../services/firebase';
import { sendGuestEmail } from '../services/emailService';
import { UserProfile, Booking } from '../types';

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

  // Manager Role State
  const [managerGateUid, setManagerGateUid] = useState<string | null>(null);
  const [managerPassword, setManagerPassword] = useState('');
  const [gateError, setGateError] = useState('');

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
      alert("Role Authorized: User is now a Manager.");
      setManagerGateUid(null);
      setManagerPassword('');
      setGateError('');
    } catch (err) {
      alert("Authorization failed.");
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

      const message = status === 'accepted' 
        ? `Your booking for ${booking.roomTitle} is confirmed! Room No: ${meta}.` 
        : `Booking rejected: ${meta}. Please update your registry info.`;

      await createNotification(booking.userId, {
        title: `Stay ${status === 'accepted' ? 'Confirmed' : 'Rejected'}`,
        message,
        type: 'booking_update'
      });

      sendGuestEmail({
        to_name: booking.userName,
        to_email: booking.userEmail,
        subject: status === 'accepted' ? "Stay Verified - Hotel Shotabdi" : "Registry Update Required",
        message: message,
        booking_id: booking.id
      });

      setAcceptingBookingId(null);
      setRejectingBookingId(null);
      if (selectedBooking?.id === booking.id) setSelectedBooking({ ...selectedBooking, ...updates });
    } catch (err) { console.error(err); }
  };

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Management Panel</h1>
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
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{booking.status}</span>
               <Eye size={20} className="text-gray-300 group-hover:text-hotel-primary" />
            </div>
          </div>
        ))}

        {activeTab === 'users' && filteredUsers.map(user => (
          <div key={user.uid} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                <img src={user.photoURL} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{user.legalName || 'New User'}</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {user.role === 'manager' ? (
                 <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Shield size={14} /> Manager Authorized
                 </span>
               ) : user.role === 'owner' ? (
                 <span className="bg-hotel-primary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Key size={14} /> Owner
                 </span>
               ) : (
                 <button 
                  onClick={() => setManagerGateUid(user.uid)}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-hotel-primary transition-all active:scale-95"
                 >
                   Make Manager
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

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

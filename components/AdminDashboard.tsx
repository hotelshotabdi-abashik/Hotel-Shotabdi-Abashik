
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Search, Filter, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ExternalLink, ShieldCheck, 
  ChevronRight, ArrowLeft, Clock, Building2, Eye
} from 'lucide-react';
import { db, ref, onValue, update, createNotification } from '../services/firebase';
import { UserProfile, Booking } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');

  useEffect(() => {
    const usersUnsub = onValue(ref(db, 'profiles'), (snapshot) => {
      if (snapshot.exists()) {
        setUsers(Object.values(snapshot.val()));
      }
      setLoading(false);
    });

    const bookingsUnsub = onValue(ref(db, 'bookings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Booking[];
        setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
      }
    });

    return () => {
      usersUnsub();
      bookingsUnsub();
    };
  }, []);

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected', roomNo?: string) => {
    try {
      await update(ref(db, `bookings/${booking.id}`), {
        status,
        roomNumber: roomNo || null
      });

      const message = status === 'accepted' 
        ? `Your stay in ${booking.roomTitle} has been accepted! Assigned Room: ${roomNo}.` 
        : `We regret to inform you that your booking request for ${booking.roomTitle} has been declined.`;

      await createNotification(booking.userId, {
        title: `Booking ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
        message,
        type: 'booking_update'
      });

      setAcceptingBookingId(null);
      setRoomNumberInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.roomTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing HQ Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-gray-900 tracking-tight">HQ Command</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Shotabdi Residential Management</p>
        </div>

        <div className="flex items-center bg-gray-50/50 p-1.5 rounded-[1.5rem] border border-gray-100">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-white shadow-sm text-hotel-primary border border-gray-100' : 'text-gray-400'}`}
          >
            <Calendar size={14} /> Bookings {bookings.filter(b => b.status === 'pending').length > 0 && <span className="bg-hotel-primary text-white w-2 h-2 rounded-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-hotel-primary border border-gray-100' : 'text-gray-400'}`}
          >
            <Users size={14} /> Users
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'users' ? 'names, usernames, emails' : 'bookings, guests'}...`}
            className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-semibold outline-none focus:border-hotel-primary focus:ring-4 focus:ring-hotel-primary/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-[1.5rem] p-5 flex flex-col justify-center shadow-sm">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total {activeTab}</span>
            <span className="text-2xl font-black text-gray-900">{activeTab === 'users' ? users.length : bookings.length}</span>
          </div>
          <div className="bg-hotel-primary/5 border border-hotel-primary/10 rounded-[1.5rem] p-5 flex flex-col justify-center shadow-sm">
            <span className="text-[8px] font-black text-hotel-primary uppercase tracking-widest mb-1">{activeTab === 'users' ? 'Active Today' : 'Pending Tasks'}</span>
            <span className="text-2xl font-black text-hotel-primary">{activeTab === 'users' ? users.filter(u => Date.now() - u.lastLogin < 86400000).length : bookings.filter(b => b.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-hotel-primary/10 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100">
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 group-hover:text-hotel-primary transition-colors">{user.legalName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-hotel-primary uppercase tracking-widest">@{user.username}</span>
                    <ShieldCheck size={10} className="text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-semibold">
                  <Mail size={14} className="text-gray-300" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-semibold">
                  <Phone size={14} className="text-gray-300" /> {user.phone}
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(user)}
                className="w-full bg-gray-50 text-gray-400 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-hotel-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                View Documentation <IdCard size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <div key={booking.id} className={`bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${booking.status === 'pending' ? 'border-l-4 border-l-hotel-primary ring-1 ring-hotel-primary/5 shadow-red-50' : ''}`}>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-hotel-primary shrink-0 border border-gray-100">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-black text-gray-900">{booking.roomTitle}</h3>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      booking.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-400">
                    <span className="flex items-center gap-1.5"><Users size={12} className="text-hotel-primary" /> {booking.guests}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Inbound</p>
                  <p className="text-[11px] font-black text-gray-700">{booking.checkIn}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Outbound</p>
                  <p className="text-[11px] font-black text-gray-700">{booking.checkOut}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                  <p className="text-[11px] font-black text-hotel-primary truncate max-w-[100px]">{booking.userName}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Room No.</p>
                  <p className="text-[11px] font-black text-green-600">{booking.roomNumber || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleBookingAction(booking, 'rejected')}
                      className="p-4 rounded-xl text-gray-300 hover:text-hotel-primary hover:bg-red-50 transition-all"
                    >
                      <XCircle size={24} />
                    </button>
                    <button 
                      onClick={() => setAcceptingBookingId(booking.id)}
                      className="bg-hotel-primary text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:scale-105 transition-all flex items-center gap-3"
                    >
                      Accept Stay <CheckCircle2 size={16} />
                    </button>
                  </>
                ) : (
                  <button className="p-4 rounded-xl text-gray-200 cursor-not-allowed">
                    <Eye size={24} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
               <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching records found in registry</p>
            </div>
          )}
        </div>
      )}

      {/* Accept Booking Modal */}
      {acceptingBookingId && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Finalize Check-in</h2>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-8">Assign a physical room number</p>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Number</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. 402, 501-A"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-black outline-none focus:border-hotel-primary transition-all"
                  value={roomNumberInput}
                  onChange={(e) => setRoomNumberInput(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setAcceptingBookingId(null)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={!roomNumberInput}
                  onClick={() => {
                    const booking = bookings.find(b => b.id === acceptingBookingId);
                    if (booking) handleBookingAction(booking, 'accepted', roomNumberInput);
                  }}
                  className="flex-1 bg-hotel-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 disabled:opacity-50"
                >
                  Confirm & notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Documentation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                  <img src={selectedUser.photoURL} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedUser.legalName}</h3>
                  <p className="text-[9px] font-bold text-hotel-primary uppercase tracking-widest">Digital ID Verification</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 bg-white rounded-xl text-gray-400 hover:text-hotel-primary shadow-sm border border-gray-100">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NID Number</p>
                  <p className="text-sm font-mono tracking-widest font-black text-gray-700">{selectedUser.nidNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guardian Phone</p>
                  <p className="text-sm font-black text-gray-700">{selectedUser.guardianPhone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NID DOCUMENT SCAN</p>
                <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl aspect-video bg-gray-100">
                  <img src={selectedUser.nidImageUrl} className="w-full h-full object-cover" alt="NID Front" />
                  <div className="absolute top-4 right-4 bg-hotel-primary text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                    Verified Digital Copy
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">End of Record</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
